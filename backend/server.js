const express = require('express');
const { setupDatabase, pool } = require('./config/db');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors());
const courseController = require('./controllers/courseController');
const enrollController = require('./controllers/enrollController');
const lessonController = require('./controllers/lessonController');
app.get('/api/setup-db', async (req, res) => {
  await setupDatabase();
  res.json({ message: "Da chay lenh khoi tao CSDL. Vui long kiem tra MySQL." });
});
// Route seed dữ liệu mẫu (chỉ chạy một lần để khởi tạo)
app.get('/api/seed', async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT id FROM Courses WHERE title = 'Thiết kế và lập trình web'");
    if (existing.length > 0) {
      return res.json({ message: 'Du lieu mau da ton tai, khong can seed lai.' });
    }
    const [courseResult] = await pool.execute(
      "INSERT INTO Courses (title, description, price, thumbnail) VALUES (?, ?, ?, ?)",
      [
        'Thiết kế và lập trình web',
        'Khóa học miễn phí giúp người mới học cách xây dựng một website hoàn chỉnh từ HTML, CSS và JavaScript.',
        0,
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'
      ]
    );
    const courseId = courseResult.insertId;
    const lessons = [
      { order: 1, title: 'Tổng quan về thiết kế và lập trình web', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
      { order: 2, title: 'Xây dựng cấu trúc trang web bằng HTML', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE' },
      { order: 3, title: 'Trang trí giao diện bằng CSS', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI' },
      { order: 4, title: 'Thiết kế responsive cho điện thoại và máy tính', url: 'https://www.youtube.com/watch?v=srvUrASNj0s' },
      { order: 5, title: 'Tạo tương tác bằng JavaScript', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' }
    ];
    for (const lesson of lessons) {
      await pool.execute(
        "INSERT INTO Lessons (course_id, title, video_url, lesson_order) VALUES (?, ?, ?, ?)",
        [courseId, lesson.title, lesson.url, lesson.order]
      );
    }
    res.json({ message: 'Seed du lieu mau thanh cong.', courseId });
  } catch (error) {
    console.error('Loi seed:', error);
    res.status(500).json({ message: 'Loi khi seed du lieu.' });
  }
});
app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/:id', courseController.getCourseDetail);
app.get('/api/courses/:id/lessons', lessonController.getLessons);
app.get('/api/courses/:courseId/lessons', lessonController.getLessonsByCourse);
app.get('/api/lessons/:id', lessonController.getLessonDetail);
app.post('/api/enroll', enrollController.enrollCourse);
app.get('/api/enroll/user/:userId', enrollController.getEnrolledCourses);
app.listen(port, () => {
  console.log(`Server dang chay tai http://localhost:${port}`);
});