const { pool } = require('../config/db');
const CourseModel = {
  // 1. Hàm lấy danh sách khóa học (Dùng cho Trang chủ)
  getAllCourses: async (searchKeyword = '') => {
    try {
      let query = 'SELECT * FROM Courses';
      let values = [];
      if (searchKeyword) {
        query += ' WHERE title LIKE ?';
        values.push(`%${searchKeyword}%`); 
      }
      const [rows] = await pool.execute(query, values);
      return rows; 
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
  },
  // 2. Hàm lấy chi tiết một khóa học (Dùng cho trang Chi tiết khóa học)
  getCourseById: async (id) => {
    try {
      const query = 'SELECT * FROM Courses WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
    return rows[0]; 
    } catch (error) {
        console.error('Error fetching course by ID:', error);
        throw error;
    }
  },
  // 3. Hàm tạo khóa học mới
  createCourse: async (courseData) => {
    try {
      const { title, description, price, thumbnail } = courseData;
      const query = 'INSERT INTO Courses (title, description, price, thumbnail) VALUES (?, ?, ?, ?)';
      const [result] = await pool.execute(query, [title, description, price, thumbnail]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // 4. Hàm cập nhật khóa học
  updateCourse: async (id, courseData) => {
    try {
      const { title, description, price, thumbnail } = courseData;
      const query = 'UPDATE Courses SET title = ?, description = ?, price = ?, thumbnail = ? WHERE id = ?';
      const [result] = await pool.execute(query, [title, description, price, thumbnail, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // 5. Hàm xóa khóa học
  deleteCourse: async (id) => {
    try {
      const query = 'DELETE FROM Courses WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};
module.exports = CourseModel;