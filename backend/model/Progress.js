const { pool } = require('../config/db');

const ProgressModel = {
  // Lấy danh sách ID các bài học đã hoàn thành của một user trong một khóa học
  getProgressByCourse: async (user_id, course_id) => {
    try {
      // 1. Kiểm tra người dùng đã đăng ký khóa học chưa
      const enrollQuery = 'SELECT id FROM Enrollments WHERE user_id = ? AND course_id = ?';
      const [enrollRows] = await pool.execute(enrollQuery, [user_id, course_id]);
      
      if (enrollRows.length === 0) {
        throw new Error('Người dùng chưa đăng ký khóa học này.');
      }

      // 2. Lấy danh sách ID các bài học đã hoàn thành
      const query = 'SELECT lesson_id FROM LessonProgress WHERE user_id = ? AND course_id = ? AND completed = 1';
      const [rows] = await pool.execute(query, [user_id, course_id]);
      return rows.map(row => row.lesson_id);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
  },

  // Đánh dấu một bài học là đã hoàn thành
  markLessonCompleted: async (user_id, course_id, lesson_id) => {
    try {
      // 1. Kiểm tra người dùng đã đăng ký khóa học chưa
      const enrollQuery = 'SELECT id FROM Enrollments WHERE user_id = ? AND course_id = ?';
      const [enrollRows] = await pool.execute(enrollQuery, [user_id, course_id]);
      
      if (enrollRows.length === 0) {
        throw new Error('Người dùng chưa đăng ký khóa học này.');
      }

      // 2. Kiểm tra bài học có thực sự thuộc khóa học không
      const checkQuery = 'SELECT id FROM Lessons WHERE id = ? AND course_id = ?';
      const [checkRows] = await pool.execute(checkQuery, [lesson_id, course_id]);
      
      if (checkRows.length === 0) {
        throw new Error('Bài học không thuộc khóa học này hoặc không tồn tại.');
      }

      // 3. Thực hiện insert hoặc update trạng thái completed và updated_at
      // Sử dụng ON DUPLICATE KEY UPDATE của MySQL
      const upsertQuery = `
        INSERT INTO LessonProgress (user_id, course_id, lesson_id, completed)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE completed = 1, updated_at = CURRENT_TIMESTAMP
      `;
      await pool.execute(upsertQuery, [user_id, course_id, lesson_id]);
      return true;
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      throw error;
    }
  }
};

module.exports = ProgressModel;
