require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();

// Veritabanı bağlantı havuzu
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '14275386Kaan',
  database: process.env.DB_NAME || 'E_Tradedatabase',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware'ler
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static dosyalar
app.use(express.static(path.join(__dirname, 'view')));
app.use('/controller', express.static(path.join(__dirname, 'controller')));
app.use('/media', express.static(path.join(__dirname, 'media')));

// Sayfa Route'ları
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'view', 'main.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'view', 'login.html')));
app.get('/signin', (req, res) => res.sendFile(path.join(__dirname, 'view', 'signin.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'view', 'product.html')));
app.get('/productAdd', (req, res) => res.sendFile(path.join(__dirname, 'view', 'productAdd.html')));
app.get('/shoppingCard', (req, res) => res.sendFile(path.join(__dirname, 'view', 'shoppingCard.html')));
app.get('/category', (req, res) => res.sendFile(path.join(__dirname, 'view', 'category.html')));

// API Route'ları
// 1. Kategori işlemleri
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marka işlemleri
app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brand');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Ürün İşlemleri
// app.js içinde
app.get('/api/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.json([]);  // Arama sorgusu boşsa, boş bir array döndür
    }

    const connection = await pool.getConnection();  // DB bağlantısını sağla
    
    // Ürün, marka, model ve kategori adlarında arama yap
    const [rows] = await connection.execute(`
      SELECT p.*, b.brand_name 
      FROM product p
      JOIN brand b ON p.brand_id = b.id
      WHERE p.product_name LIKE ? 
      OR b.brand_name LIKE ? 
    `, [
      `%${searchQuery}%`,  // Ürün adı ile arama
      `%${searchQuery}%`  // Marka adı ile arama
    ]);

    // img alanını base64'e çevir
    const products = rows.map(product => {
      if (product.img) {
        product.img = product.img.toString('base64');
      }
      return product;
    });

    res.json(products);  // Arama sonuçlarını JSON olarak döndür
    connection.release(); // Bağlantıyı serbest bırak
  } catch (error) {
    console.error("Database error:", error);  // Hata mesajını logla
    res.status(500).json({
      message: 'Veritabanı hatası',
      error: error.message
    });
  }
});

app.post('/api/products/add', async (req, res) => {
  const { brandId, modelId, categoryId, productName, stock, price, imgPath } = req.body;

  try {
    const query = `
      INSERT INTO product (brand_id, model_id, category_id, product_name, stock, price, img)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [brandId, modelId, categoryId, productName, stock, price, imgPath]);

    res.status(200).json({ success: true, productId: result.insertId });
  } catch (err) {
    console.error('Ürün eklerken hata:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.brand_name, m.model_name, c.category_name 
      FROM product p
      JOIN brand b ON p.brand_id = b.id
      JOIN model m ON p.model_id = m.id
      JOIN category c ON p.category_id = c.id
    `);

    // img alanını base64'e çevir
    const products = rows.map(product => {
      if (product.img) {
        product.img = product.img.toString('base64');
      }
      return product;
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get('/api/products', async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT p.*, b.brand_name, m.model_name, c.category_name 
//       FROM product p
//       JOIN brand b ON p.brand_id = b.id
//       JOIN model m ON p.model_id = m.id
//       JOIN category c ON p.category_id = c.id
//     `);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.brand_name, m.model_name, c.category_name 
      FROM product p
      JOIN brand b ON p.brand_id = b.id
      JOIN model m ON p.model_id = m.id
      JOIN category c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Kullanıcı İşlemleri
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM customer WHERE user_name = ?',
      [username]
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    res.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: rows[0].id,
        username: rows[0].user_name,
        name: rows[0].customer_name,
        surname: rows[0].customer_surname
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, surname, city, state } = req.body;
    
    // Kullanıcı adı kontrolü
    const [existing] = await pool.query(
      'SELECT * FROM customer WHERE user_name = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış' });
    }

    // Şifreyi düz metin olarak kaydet
    const [result] = await pool.query(
      `INSERT INTO customer (user_name, password, customer_name, customer_surname, city, state, stat)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, password, name, surname, city, state]
    );

    res.json({ success: true, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 4. Sepet İşlemleri (Kimlik doğrulama gerektirir)
// app.get('/api/cart', async (req, res) => {
//   const { customerId } = req.query;
//   const query = `
//     SELECT sc.amount, p.product_name, p.price, p.img, p.stock, p.id as product_id
//     FROM shopping_cart sc
//     JOIN product p ON sc.product_id = p.id
//     WHERE sc.customer_id = ?`;
//   const result = await db.query(query, [customerId]);
//   res.json(result[0]);
// });

// // Sepete ekle/güncelle
// app.post('/api/cart/add', async (req, res) => {
//   const { productId, quantity, customerId } = req.body;

//   const [existing] = await db.query(
//     'SELECT * FROM shopping_cart WHERE product_id = ? AND customer_id = ?',
//     [productId, customerId]
//   );

//   if (existing.length > 0) {
//     await db.query(
//       'UPDATE shopping_cart SET amount = ? WHERE product_id = ? AND customer_id = ?',
//       [quantity, productId, customerId]
//     );
//   } else {
//     await db.query(
//       'INSERT INTO shopping_cart (product_id, amount, customer_id) VALUES (?, ?, ?)',
//       [productId, quantity, customerId]
//     );
//   }

//   res.json({ success: true });
// });

// // Sepetten sil
// app.post('/api/cart/delete', async (req, res) => {
//   const { productId, customerId } = req.body;
//   await db.query('DELETE FROM shopping_cart WHERE product_id = ? AND customer_id = ?', [productId, customerId]);
//   res.json({ success: true });
// });

// // Stok güncelle
// app.post('/api/product/updateStock', async (req, res) => {
//   const { productId, stock } = req.body;
//   await db.query('UPDATE product SET stock = ? WHERE id = ?', [stock, productId]);
//   res.json({ success: true });
// });

app.get('/api/cart', async (req, res) => {
  const { customerId } = req.query;

  const query = `
    SELECT sc.amount, p.product_name, p.price, p.img, p.stock, p.id as product_id
    FROM shopping_cart sc
    JOIN product p ON sc.product_id = p.id
    WHERE sc.customer_id = ?`;

  try {
    const [rows] = await pool.query(query, [customerId]);

    const updatedRows = rows.map((item) => {
      if (item.img) {
        item.img = item.img.toString('base64');  // BLOB'u base64 string'e çevir
      }
      return item;
    });

    res.json(updatedRows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API endpoint: Add or update product in the shopping cart
app.post('/api/cart/add', async (req, res) => {
  const { productId, quantity, customerId } = req.body; // Gelen veriler alınır
  
  try {
    // Sepetteki mevcut ürün kontrol edilir
    const [existing] = await pool.query(
      'SELECT * FROM shopping_cart WHERE product_id = ? AND customer_id = ?',
      [productId, customerId]
    );

    // Eğer ürün sepette varsa, miktar güncellenir
    if (existing.length > 0) {
      await pool.query(
        'UPDATE shopping_cart SET amount = ? WHERE product_id = ? AND customer_id = ?',
        [quantity, productId, customerId]
      );
    } else {
      // Ürün sepette yoksa, yeni bir satır eklenir
      await pool.query(
        'INSERT INTO shopping_cart (product_id, amount, customer_id) VALUES (?, ?, ?)',
        [productId, quantity, customerId]
      );
    }

    res.json({ success: true }); // Başarılı yanıt döndürülür
  } catch (err) {
    console.error('Error adding/updating item in cart:', err);
    res.status(500).json({ error: 'Internal server error' }); // Hata durumunda 500 döndürülür
  }
});

// API endpoint: Delete product from shopping cart
app.post('/api/cart/delete', async (req, res) => {
  const { productId, customerId } = req.body; // Gelen veriler alınır
  try {
    await pool.query('DELETE FROM shopping_cart WHERE product_id = ? AND customer_id = ?', [productId, customerId]); // Sepetten ürün silinir
    res.json({ success: true }); // Başarılı yanıt döndürülür
  } catch (err) {
    console.error('Error deleting item from cart:', err);
    res.status(500).json({ error: 'Internal server error' }); // Hata durumunda 500 döndürülür
  }
});

// API endpoint: Update product stock
app.post('/api/product/updateStock', async (req, res) => {
  const { productId, stock } = req.body; // Gelen veriler alınır
  try {
    await pool.query('UPDATE product SET stock = ? WHERE id = ?', [stock, productId]); // Ürün stok miktarı güncellenir
    res.json({ success: true }); // Başarılı yanıt döndürülür
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Internal server error' }); // Hata durumunda 500 döndürülür
  }
});

// 404 ve 500 Hata Yönetimi
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'view', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Sunucu hatası');
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});