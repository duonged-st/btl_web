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
const progressController = require('./controllers/progressController');
app.get('/api/setup-db', async (req, res) => {
  try {
    await setupDatabase();
    res.json({ message: "Đã chạy lệnh khởi tạo CSDL. Vui lòng kiểm tra MySQL." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khởi tạo CSDL.", error: error.message });
  }
});
app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/:id', courseController.getCourseDetail);
app.get('/api/courses/:id/lessons', lessonController.getLessons);
app.get('/api/lessons/:id', lessonController.getLessonDetail);
app.post('/api/enroll', enrollController.enrollCourse);
app.get('/api/enroll/user/:userId', enrollController.getEnrolledCourses);
app.get('/api/progress/:userId/:courseId', progressController.getProgress);
app.post('/api/progress/complete', progressController.markCompleted);
app.listen(port, () => {
  console.log(`Server dang chay tai http://localhost:${port}`);
});