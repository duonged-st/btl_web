const ProgressModel = require('../model/Progress');

const progressController = {
  // GET /api/progress/:courseId
  getProgress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
      }

      const completedLessons = await ProgressModel.getProgressByCourse(userId, courseId);
      res.json(completedLessons);
    } catch (error) {
      console.error('Lỗi khi lấy tiến độ:', error);
      if (error.message === 'Người dùng chưa đăng ký khóa học này.') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy tiến độ học tập.' });
    }
  },

  // POST /api/progress/complete
  markCompleted: async (req, res) => {
    try {
      let { course_id, lesson_id } = req.body;
      const user_id = req.session.userId;

      course_id = Number(course_id);
      lesson_id = Number(lesson_id);

      if (!Number.isInteger(course_id) || course_id <= 0 || 
          !Number.isInteger(lesson_id) || lesson_id <= 0) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ (course_id, lesson_id).' });
      }

      await ProgressModel.markLessonCompleted(user_id, course_id, lesson_id);
      res.json({ message: 'Đã đánh dấu hoàn thành bài học.' });
    } catch (error) {
      console.error('Lỗi khi đánh dấu hoàn thành:', error);
      if (error.message === 'Bài học không thuộc khóa học này hoặc không tồn tại.' || error.message === 'Người dùng chưa đăng ký khóa học này.') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Lỗi máy chủ khi đánh dấu hoàn thành bài học.' });
    }
  }
};

module.exports = progressController;
