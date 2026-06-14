const { pool } = require('../db');

const EnrollmentModel = {
  // 1. Hàm kiểm tra xem người dùng đã đăng ký khóa học này chưa
  checkEnrollment: async (user_id, course_id) => {
    try {
      const query = 'SELECT * FROM Enrollments WHERE user_id = ? AND course_id = ?';
      const [rows] = await pool.execute(query, [user_id, course_id]);      
      return rows.length > 0;
    } catch (error) {
        console.error('Error checking enrollment:', error);
    }
  },

  // 2. Hàm thực hiện đăng ký/mua khóa học
  enrollCourse: async (user_id, course_id) => {
    try {
      const query = 'INSERT INTO Enrollments (user_id, course_id) VALUES (?, ?)';
      const [result] = await pool.execute(query, [user_id, course_id]);
      
      return result.insertId;
    } catch (error) {
        console.error('Error enrolling course:', error);
    }
  },

  // 3. Hàm lấy danh sách các khóa học mà một người dùng CỤ THỂ đã mua (Dùng cho không gian học tập)
  getEnrolledCoursesByUser: async (user_id) => {
    try {
      const query = `
        SELECT c.id, c.title, c.thumbnail, e.enroll_date 
        FROM Courses c
        JOIN Enrollments e ON c.id = e.course_id
        WHERE e.user_id = ?
        ORDER BY e.enroll_date DESC
      `;
      const [rows] = await pool.execute(query, [user_id]);
      
      return rows;
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
    }
  }
};

module.exports = EnrollmentModel;