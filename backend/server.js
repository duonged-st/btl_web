const express = require('express');
const { setupDatabase, pool } = require('./config/db');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
const session = require('express-session');
const { requireAuth } = require('./middleware/authMiddleware');
// Cấu hình CORS động để cho phép gửi cookie từ Frontend
app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || true);
    },
    credentials: true
}));
// Cấu hình Session
app.use(session({
    secret: 'btl-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
const courseController = require('./controllers/courseController');
const enrollController = require('./controllers/enrollController');
const lessonController = require('./controllers/lessonController');
const authController = require('./controllers/authController');
const progressController = require('./controllers/progressController');
app.get('/api/setup-db', async (req, res) => {
  try {
    await setupDatabase();
    res.json({ message: "Đã chạy lệnh khởi tạo CSDL. Vui lòng kiểm tra MySQL." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khởi tạo CSDL.", error: error.message });
  }
});
// Routes khóa học & bài học
app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/:id', courseController.getCourseDetail);
app.post('/api/courses', courseController.createCourse);
app.put('/api/courses/:id', courseController.updateCourse);
app.delete('/api/courses/:id', courseController.deleteCourse);
app.get('/api/courses/:id/lessons', lessonController.getLessons);
app.get('/api/lessons/:id', lessonController.getLessonDetail);
app.post('/api/lessons', lessonController.addLesson);
app.delete('/api/lessons/:id', lessonController.deleteLesson);
// Routes ghi danh
app.post('/api/enroll', requireAuth, enrollController.enrollCourse);
app.get('/api/enroll/user', requireAuth, enrollController.getEnrolledCourses);
// Routes xác thực & người dùng
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', requireAuth, authController.getMe);
app.get('/api/users/:id', requireAuth, authController.getUserProfile);
// Routes tiến độ học tập
app.get('/api/progress/:courseId', requireAuth, progressController.getProgress);
app.post('/api/progress/complete', requireAuth, progressController.markCompleted);
const fs = require('fs');
const path = require('path');
app.get('/api/images', async (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../frontend/src/images');
    if (!fs.existsSync(imagesDir)) {
      return res.json({ success: true, data: [] });
    }
    const files = await fs.promises.readdir(imagesDir);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Lỗi đọc thư mục ảnh:', error);
    res.status(500).json({ success: false, message: 'Lỗi đọc danh sách ảnh' });
  }
});
app.listen(port, () => {
  console.log(`Server dang chay tai http://localhost:${port}`);
});