const LessonModel = require('../model/Lesson');
const CourseModel = require('../model/Course');

const lessonController = {
  // 1. Lấy danh sách bài học của một khóa học
  // GET /api/courses/:id/lessons
  getLessons: async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await CourseModel.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
      }
      const lessons = await LessonModel.getLessonsByCourseId(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách bài học.' });
    }
  },

  // 2. Lấy danh sách bài học của một khóa học (cho thanh sidebar danh sách)
  // GET /api/courses/:courseId/lessons
  getLessonsByCourse: async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const course = await CourseModel.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
      }
      const lessons = await LessonModel.getLessonsByCourseId(courseId);
      res.json(lessons);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách bài học.' });
    }
  },

  // 3. Lấy chi tiết một bài học cụ thể (để lấy video_url hiển thị lên trình phát)
  // GET /api/lessons/:id
  getLessonDetail: async (req, res) => {
    try {
      const lessonId = req.params.id;
      const lesson = await LessonModel.getLessonById(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Không tìm thấy bài học.' });
      }
      res.json(lesson);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết bài học.' });
    }
  }
};

module.exports = lessonController;
