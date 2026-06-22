const express = require('express');
const { setupDatabase } = require('./config/db');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors());
const courseController = require('./controllers/courseController');
const enrollController = require('./controllers/enrollController');
const lessonController = require('./controllers/lessonController');
const authController = require('./controllers/authController');
app.get('/api/setup-db', async (req, res) => {
  await setupDatabase();
  res.json({ message: "Da chay lenh khoi tao CSDL. Vui long kiem tra MySQL." });
});
// Routes khóa học & bài học
app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/:id', courseController.getCourseDetail);
app.get('/api/courses/:id/lessons', lessonController.getLessons);
app.get('/api/courses/:courseId/lessons', lessonController.getLessonsByCourse);
app.get('/api/lessons/:id', lessonController.getLessonDetail);
// Routes ghi danh
app.post('/api/enroll', enrollController.enrollCourse);
app.get('/api/enroll/user/:userId', enrollController.getEnrolledCourses);
// Routes xác thực & người dùng
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/users/:id', authController.getUserProfile);
app.listen(port, () => {
  console.log(`Server dang chay tai http://localhost:${port}`);
});