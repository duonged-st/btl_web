const UserModel = require('../model/User');
const bcrypt = require('bcryptjs');
const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' });
      }
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại trên hệ thống.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertId = await UserModel.createUser(username, hashedPassword);
      if (!insertId) {
        return res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại sau.' });
      }
      // Lưu session
      req.session.userId = insertId;
      req.session.userRole = 'user';
      res.status(201).json({
        message: 'Đăng ký tài khoản thành công.',
        user: { id: insertId, username, role: 'user' }
      });
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký tài khoản.' });
    }
  },
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu.' });
      }
      const user = await UserModel.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
      }
      // Lưu session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      res.json({
        message: 'Đăng nhập thành công.',user: { id: user.id, username: user.username, role: user.role }});
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập.' });
    }
  },
  // POST /api/auth/logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi khi đăng xuất.' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Đăng xuất thành công.' });
    });
  },
  // GET /api/auth/me
  getMe: async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
      }
      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
      }
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error('Lỗi lấy thông tin session:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin.' });
    }
  },
  // GET /api/users/:id
  getUserProfile: async (req, res) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ message: 'Thiếu thông tin ID người dùng.' });
      }
      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
      }
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin người dùng.' });
    }
  }
};
module.exports = authController;