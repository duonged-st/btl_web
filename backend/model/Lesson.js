const { pool } = require('../config/db');

const LessonModel = {
  // 1. Hàm lấy danh sách bài học của một khóa học (Dùng cho giao diện Learning Workspace)
  getLessonsByCourseId: async (course_id) => {
    try {
      const query = 'SELECT id, course_id, title, lesson_order FROM Lessons WHERE course_id = ? ORDER BY lesson_order ASC';
      const [rows] = await pool.execute(query, [course_id]);      
      return rows; 
    } catch (error) {
        console.error('Error fetching lessons by course ID:', error);
        throw error;
    }
  },
  // 2. Hàm lấy chi tiết một bài học (Dùng khi người dùng bấm vào một bài học cụ thể để xem)
  getLessonById: async (id) => {
    try {
      const query = 'SELECT * FROM Lessons WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      return rows[0]; 
    } catch (error) {
        console.error('Error fetching lesson by ID:', error);
        throw error;
    }
  },

  // 3. Hàm thêm bài học (video) vào khóa học
  addLesson: async (lessonData) => {
    try {
      const { course_id, title, video_url, lesson_order } = lessonData;
      const query = 'INSERT INTO Lessons (course_id, title, video_url, lesson_order) VALUES (?, ?, ?, ?)';
      const [result] = await pool.execute(query, [course_id, title, video_url, lesson_order]);
      return result.insertId;
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  },

  // 4. Hàm xóa bài học
  deleteLesson: async (id) => {
    try {
      const query = 'DELETE FROM Lessons WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }
};

module.exports = LessonModel;