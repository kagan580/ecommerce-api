const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/add', async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO Shopping_Cart (product_id, amount, customer_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = amount + ?`,
      [productId, quantity, userId, quantity]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;