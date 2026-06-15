const CourseModel = require('../model/Course');
const courseController = {
  // 1. Lấy danh sách tất cả khóa học (Có hỗ trợ tìm kiếm)
  // GET /api/courses?search=keyword
  getCourses: async (req, res) => {
    try {
      const searchKeyword = req.query.search || '';
      const courses = await CourseModel.getAllCourses(searchKeyword);
      res.json(courses);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách khóa học.' });
    }
  },
  // 2. Lấy thông tin chi tiết một khóa học
  // GET /api/courses/:id
  getCourseDetail: async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await CourseModel.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học.' });
      }
      res.json(course);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết khóa học.' });
    }
  }
};
module.exports = courseController;
