const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM Customer WHERE user_name = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  // Kayıt işlemleri
});

module.exports = router;