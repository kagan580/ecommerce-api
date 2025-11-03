// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Zorunlu environment değişkenlerini kontrol et
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
