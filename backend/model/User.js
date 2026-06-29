const { pool } = require('../config/db'); 
const UserModel = {
  // 1. Hàm tạo người dùng mới (Dùng khi đăng ký tài khoản)
  createUser: async (username, password) => {
    try {
      const query = 'INSERT INTO Users (username, password) VALUES (?, ?)';
      const [result] = await pool.execute(query, [username, password]);
      return result.insertId; 
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  // 2. Hàm tìm người dùng bằng Tên đăng nhập (Dùng khi đăng nhập hoặc kiểm tra tồn tại)
  getUserByUsername: async (username) => {
    try {
      const query = 'SELECT * FROM Users WHERE username = ?';
      const [rows] = await pool.execute(query, [username]);
      return rows[0]; 
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  },
  // 3. Hàm lấy thông tin người dùng bằng ID (Dùng để hiển thị profile hoặc check quyền mua khóa học)
  getUserById: async (id) => {
    try {
      const query = 'SELECT id, username, role FROM Users WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);      
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
};
module.exports = UserModel;