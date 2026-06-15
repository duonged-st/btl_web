const EnrollmentModel = require('../model/Enrollment');

const enrollController = {
  // 1. Đăng ký khóa học
  // POST /api/enroll
  enrollCourse: async (req, res) => {
    try {
      const { user_id, course_id } = req.body;
      if (!user_id || !course_id) {
        return res.status(400).json({ message: 'Thiếu thông tin user_id hoặc course_id.' });
          }
      const isEnrolled = await EnrollmentModel.checkEnrollment(user_id, course_id);
      if (isEnrolled) {
        return res.status(400).json({ message: 'Học viên đã đăng ký khóa học này trước đó.' });
      }
      const enrollId = await EnrollmentModel.enrollCourse(user_id, course_id);
      res.status(201).json({
        message: 'Đăng ký khóa học thành công.',
        enrollmentId: enrollId
      });
    } catch (error) {
      console.error('Lỗi khi đăng ký khóa học:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký khóa học.' });
    }
  },

  // 2. Lấy danh sách các khóa học mà một người dùng CỤ THỂ đã mua
  // GET /api/enroll/user/:userId
  getEnrolledCourses: async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ message: 'Thiếu thông tin userId.' });
      }
      const courses = await EnrollmentModel.getEnrolledCoursesByUser(userId);
      res.json(courses);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học đã đăng ký:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách khóa học đã đăng ký.' });
    }
  }
};

module.exports = enrollController;
