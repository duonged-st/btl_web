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
    }
  }
};
module.exports = CourseModel;