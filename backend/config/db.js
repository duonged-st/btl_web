const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
async function setupDatabase() {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      )
    `;
    const createCoursesTable = `
      CREATE TABLE IF NOT EXISTS Courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price INT DEFAULT 0,
        thumbnail VARCHAR(255)
      )
    `;
    const createLessonsTable = `
      CREATE TABLE IF NOT EXISTS Lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        video_url VARCHAR(255),
        lesson_order INT DEFAULT 1,
        FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
      )
    `;
    const createEnrollmentsTable = `
      CREATE TABLE IF NOT EXISTS Enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        enroll_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
      )
    `;
    const createLessonProgressTable = `
      CREATE TABLE IF NOT EXISTS LessonProgress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed TINYINT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_course_lesson (user_id, course_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE
      )
    `;
    await pool.execute(createUsersTable);
    await pool.execute(createCoursesTable);
    await pool.execute(createLessonsTable);
    await pool.execute(createEnrollmentsTable);
    await pool.execute(createLessonProgressTable);
    // Kiểm tra và thêm cột video_url nếu chưa có
    const [columns] = await pool.execute("SHOW COLUMNS FROM Lessons LIKE 'video_url'");
    if (columns.length === 0) {
      await pool.execute("ALTER TABLE Lessons ADD COLUMN video_url VARCHAR(255)");
      console.log("Đã thêm cột video_url vào bảng Lessons.");
    }
    // Kiểm tra và thêm cột role vào bảng Users nếu chưa có
    const [userCols] = await pool.execute("SHOW COLUMNS FROM Users LIKE 'role'");
    if (userCols.length === 0) {
      await pool.execute("ALTER TABLE Users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
      console.log("Đã thêm cột role vào bảng Users.");
    }
    // Seed tài khoản admin mặc định nếu chưa tồn tại
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const [existingAdmin] = await pool.execute(
      "SELECT id FROM Users WHERE username = ?",
      [adminUsername]
    );
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.execute(
        "INSERT INTO Users (username, password, role) VALUES (?, ?, 'admin')",
        [adminUsername, hashedPassword]
      );
      console.log(`Đã tạo tài khoản admin mặc định: username="${adminUsername}", password="${adminPassword}"`);
    } else {
      // Kiểm tra nếu tài khoản tồn tại nhưng role chưa phải admin thì cập nhật
      const [adminRow] = await pool.execute(
        "SELECT role FROM Users WHERE username = ?",
        [adminUsername]
      );
      if (adminRow.length > 0 && adminRow[0].role !== 'admin') {
        await pool.execute(
          "UPDATE Users SET role = 'admin' WHERE username = ?",
          [adminUsername]
        );
        console.log(`Đã cập nhật role của "${adminUsername}" thành admin.`);
      } else {
        console.log(`Tài khoản admin "${adminUsername}" đã tồn tại, bỏ qua seed.`);
      }
    }
    console.log("Khoi tao cac bang thanh cong.");
  } catch (error) {
    console.error("Loi khi tao bang:", error.message);
    throw error;
  }
}
module.exports = {
  pool,
  setupDatabase
};