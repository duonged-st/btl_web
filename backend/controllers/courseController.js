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
  },

  // 3. Thêm khóa học mới
  // POST /api/courses
  createCourse: async (req, res) => {
    try {
      const { title, description, price, thumbnail } = req.body;
      if (!title || price === undefined) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin bắt buộc (title, price).' });
      }
      const courseId = await CourseModel.createCourse({ title, description, price, thumbnail });
      res.status(201).json({ message: 'Thêm khóa học thành công', courseId });
    } catch (error) {
      console.error('Lỗi khi thêm khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi thêm khóa học.' });
    }
  },

  // 4. Cập nhật thông tin khóa học (bao gồm sửa giá)
  // PUT /api/courses/:id
  updateCourse: async (req, res) => {
    try {
      const courseId = req.params.id;
      const { title, description, price, thumbnail } = req.body;
      const success = await CourseModel.updateCourse(courseId, { title, description, price, thumbnail });
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học để cập nhật.' });
      }
      res.json({ message: 'Cập nhật khóa học thành công.' });
    } catch (error) {
      console.error('Lỗi khi cập nhật khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật khóa học.' });
    }
  },

  // 5. Xóa khóa học
  // DELETE /api/courses/:id
  deleteCourse: async (req, res) => {
    try {
      const courseId = req.params.id;
      const success = await CourseModel.deleteCourse(courseId);
      if (!success) {
        return res.status(404).json({ message: 'Không tìm thấy khóa học để xóa.' });
      }
      res.json({ message: 'Xóa khóa học thành công.' });
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi xóa khóa học.' });
    }
  }
};
module.exports = courseController;
