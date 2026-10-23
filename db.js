// ============================================================
// db.js — MySQL Database Connection & Queries
// Simple, parameterized queries for StockPulse Lite
// ============================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

// 1. Connection Pool Configuration from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stockpulse_lite',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database state tracker
let isConnected = false;

// 2. Initialize Database & Seed Default Stocks
async function initDb() {
  try {
    const connection = await pool.getConnection();
    isConnected = true;
    console.log('✅ [MySQL] Connected to database:', process.env.DB_NAME || 'stockpulse_lite');

    // Create table if it does not exist yet
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL UNIQUE,
        company_name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        change_percent DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if table is empty; if so, insert 4 default stocks
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM stocks');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO stocks (symbol, company_name, price, change_percent) VALUES
        ('AAPL', 'Apple Inc.', 182.50, 1.25),
        ('MSFT', 'Microsoft Corporation', 420.10, -0.45),
        ('GOOGL', 'Alphabet Inc.', 175.30, 0.85),
        ('AMZN', 'Amazon.com Inc.', 185.90, -1.10),
        ('XAUUSD', 'Gold / US Dollar (Spot)', 2735.50, 0.65)
      `);
      console.log('🌱 [MySQL] Seeded default market assets including Gold (XAUUSD).');
    }

    connection.release();
    return true;
  } catch (error) {
    isConnected = false;
    console.error('❌ [MySQL Error] Could not connect to MySQL database.');
    console.error('   Hint: Ensure MySQL is running and credentials in .env are correct.');
    console.error('   Details:', error.message);
    return false;
  }
}

// 3. READ: Get all stocks
async function getAllStocks() {
  const [rows] = await pool.query('SELECT * FROM stocks ORDER BY id ASC');
  return rows;
}

// 4. READ: Get single stock by ID
async function getStockById(id) {
  const [rows] = await pool.query('SELECT * FROM stocks WHERE id = ?', [id]);
  return rows[0] || null;
}

// 5. CREATE: Insert a new stock
async function createStock({ symbol, company_name, price, change_percent }) {
  const query = 'INSERT INTO stocks (symbol, company_name, price, change_percent) VALUES (?, ?, ?, ?)';
  const [result] = await pool.query(query, [symbol.toUpperCase(), company_name, price, change_percent]);
  return {
    id: result.insertId,
    symbol: symbol.toUpperCase(),
    company_name,
    price: Number(price),
    change_percent: Number(change_percent)
  };
}

// 6. UPDATE: Update an existing stock
async function updateStock(id, { symbol, company_name, price, change_percent }) {
  const query = 'UPDATE stocks SET symbol = ?, company_name = ?, price = ?, change_percent = ? WHERE id = ?';
  const [result] = await pool.query(query, [symbol.toUpperCase(), company_name, price, change_percent, id]);
  return result.affectedRows > 0;
}

// 7. DELETE: Delete a stock by ID
async function deleteStock(id) {
  const query = 'DELETE FROM stocks WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result.affectedRows > 0;
}

// 8. READ: Get historical price points for a stock symbol
async function getStockHistory(symbol, range = '1D') {
  const [rows] = await pool.query('SELECT * FROM stocks WHERE symbol = ?', [symbol.toUpperCase()]);
  const currentPrice = rows.length > 0 ? Number(rows[0].price) : 150.00;
  const changePercent = rows.length > 0 ? Number(rows[0].change_percent) : 0.00;

  if (range === '1W') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const startPrice = currentPrice * 0.96;
    const step = (currentPrice - startPrice) / 4;
    return days.map((day, i) => ({
      time: day,
      price: Number((startPrice + step * i + Math.sin(i) * (currentPrice * 0.015)).toFixed(2))
    }));
  }

  if (range === '1M') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const startPrice = currentPrice * 0.93;
    const step = (currentPrice - startPrice) / 3;
    return weeks.map((w, i) => ({
      time: w,
      price: Number((startPrice + step * i + Math.sin(i) * (currentPrice * 0.02)).toFixed(2))
    }));
  }

  if (range === '1Y') {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const startPrice = currentPrice * 0.84;
    const step = (currentPrice - startPrice) / 11;
    return months.map((m, i) => ({
      time: m,
      price: Number((startPrice + step * i + Math.sin(i * 1.2) * (currentPrice * 0.03)).toFixed(2))
    }));
  }

  // Default: 1D (Intraday)
  const times = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:00 PM'];
  const startPrice = currentPrice / (1 + changePercent / 100);
  const step = (currentPrice - startPrice) / 7;

  return times.map((time, index) => {
    const jitter = index === 7 ? 0 : Math.sin(index * 1.5) * (currentPrice * 0.006);
    const price = Number((startPrice + step * index + jitter).toFixed(2));
    return { time, price };
  });
}

// Helper to check connection status
function isDbConnected() {
  return isConnected;
}

module.exports = {
  pool,
  initDb,
  isDbConnected,
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockHistory
};


