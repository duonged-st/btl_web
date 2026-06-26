const LessonModel = require('../model/Lesson');
const CourseModel = require('../model/Course');
const lessonController = {
  // 1. Lấy danh sách bài học của một khóa học
  // GET /api/courses/:id/lessons
  getLessons: async (req, res) => {
    try {
      const courseId = Number(req.params.id);
      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: 'Mã khóa học không hợp lệ.' });
      }
      const lessons = await LessonModel.getLessonsByCourseId(courseId);
      const course = await CourseModel.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
      }
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
      const lessonId = Number(req.params.id);
      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({ message: 'Mã bài học không hợp lệ.' });
      }
      const lesson = await LessonModel.getLessonById(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: 'Không tìm thấy bài học.' });
      }
      res.json(lesson);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết bài học.' });
    }
  },
  // 4. Thêm bài học (video) mới vào khóa học
  // POST /api/lessons
  addLesson: async (req, res) => {
    try {
      const { course_id, title, video_url, lesson_order } = req.body;
      if (!course_id || !title || !video_url) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin bài học (course_id, title, video_url).' });
      }
      const lessonId = await LessonModel.addLesson({ course_id, title, video_url, lesson_order: lesson_order || 0 });
      res.status(201).json({ message: 'Thêm bài học thành công.', lessonId });
    } catch (error) {
      console.error('Lỗi khi thêm bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi thêm bài học.' });
    }
  },
  // 5. Xóa bài học
  // DELETE /api/lessons/:id
  deleteLesson: async (req, res) => {
    try {
      const lessonId = req.params.id;
      const success = await LessonModel.deleteLesson(lessonId);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy bài học để xóa.' });
      }
      res.json({ message: 'Xóa bài học thành công.' });
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi xóa bài học.' });
    }
  }
};
module.exports = lessonController;