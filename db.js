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
        ('AAPL', 'Apple Inc.', 227.83, -0.45),
        ('MSFT', 'Microsoft Corporation', 425.79, 0.81),
        ('GOOGL', 'Alphabet Inc.', 164.44, 1.57),
        ('AMZN', 'Amazon.com Inc.', 187.83, 0.78),
        ('XAUUSD', 'Gold / US Dollar (Spot)', 3994.00, 0.65)
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
  deleteStock
};


