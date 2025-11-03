const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.brand_name 
      FROM Product p
      JOIN Brand b ON p.brand_id = b.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  // Ürün ekleme
});

module.exports = router;