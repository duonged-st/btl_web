const express = require('express');
const { setupDatabase } = require('./db'); 
const app = express();
const port = 3000;
app.use(express.json());
app.get('/api/setup-db', async (req, res) => {
    await setupDatabase();
    res.json({ message: "Da chay lenh khoi tao CSDL. Vui long kiem tra MySQL." });
});
app.listen(port, () => {
  console.log(`Server dang chay tai http://localhost:${port}`);
});