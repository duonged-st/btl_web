const { pool } = require('../db'); 
const UserModel = {
  // 1. Hàm tạo người dùng mới (Dùng khi đăng ký tài khoản)
  createUser: async (name, email, password) => {
    try {
        const query = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
        const [result] = await pool.execute(query, [name, email, password]);
      return result.insertId; 
    } catch (error) {
        console.error('Error creating user:', error);
    }
  },
  // 2. Hàm tìm người dùng bằng Email (Dùng khi đăng nhập hoặc kiểm tra tồn tại)
  getUserByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM Users WHERE email = ?';
      const [rows] = await pool.execute(query, [email]);
        return rows[0]; 
    } catch (error) {
        console.error('Error finding user by email:', error);
    }
  },
  // 3. Hàm lấy thông tin người dùng bằng ID (Dùng để hiển thị profile hoặc check quyền mua khóa học)
  getUserById: async (id) => {
    try {
      const query = 'SELECT id, name, email FROM Users WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);      
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
    }
  }
};
module.exports = UserModel;