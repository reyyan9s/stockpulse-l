// ============================================================
// server.js — Node.js & Express REST API Server
// Web Technology Lab: Demonstrates routing, middleware, REST
// ============================================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware: Parse incoming JSON request bodies
app.use(express.json());

// 2. Security Middleware: Block direct browser access to sensitive backend files
app.use((req, res, next) => {
  const blocked = ['.env', 'server.js', 'db.js', 'package.json', 'package-lock.json', 'schema.sql'];
  const requested = path.basename(req.path);
  if (blocked.includes(requested) || requested.startsWith('.')) {
    return res.status(403).json({ success: false, error: 'Access denied: protected file' });
  }
  next();
});

// 3. Static Files: Serve frontend files (HTML, CSS, JS, images, WTL topic demos)
app.use(express.static(__dirname));

// ============================================================
// REST API ROUTES
// ============================================================

// GET /api/health — Health check endpoint
app.get('/api/health', (req, res) => {
  const connected = db.isDbConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'healthy' : 'database_unavailable',
    timestamp: new Date().toISOString(),
    database: connected ? 'connected' : 'disconnected'
  });
});

// GET /api/stocks — Retrieve all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await db.getAllStocks();
    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    console.error('Error in GET /api/stocks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stocks from database.'
    });
  }
});


// POST /api/stocks — Create a new stock
app.post('/api/stocks', async (req, res) => {
  const { symbol, company_name, price, change_percent } = req.body;

  // Validation
  if (!symbol || !company_name || price === undefined || change_percent === undefined) {
    return res.status(400).json({
      success: false,
      error: 'All fields (symbol, company_name, price, change_percent) are required.'
    });
  }

  const numPrice = Number(price);
  const numChange = Number(change_percent);

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Stock price must be a valid positive number.'
    });
  }

  if (isNaN(numChange)) {
    return res.status(400).json({
      success: false,
      error: 'Change percentage must be a valid number.'
    });
  }

  try {
    const newStock = await db.createStock({
      symbol: symbol.trim(),
      company_name: company_name.trim(),
      price: numPrice,
      change_percent: numChange
    });

    res.status(201).json({
      success: true,
      message: 'Stock created successfully.',
      data: newStock
    });
  } catch (error) {
    console.error('Error in POST /api/stocks:', error.message);
    // Check for MySQL duplicate key error (code ER_DUP_ENTRY)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: `Stock with symbol '${symbol.toUpperCase()}' already exists.`
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to add stock to database.'
    });
  }
});

// PUT /api/stocks/:id — Update an existing stock
app.put('/api/stocks/:id', async (req, res) => {
  const { id } = req.params;
  const { symbol, company_name, price, change_percent } = req.body;

  if (!symbol || !company_name || price === undefined || change_percent === undefined) {
    return res.status(400).json({
      success: false,
      error: 'All fields (symbol, company_name, price, change_percent) are required.'
    });
  }

  const numPrice = Number(price);
  const numChange = Number(change_percent);

  if (isNaN(numPrice) || numPrice <= 0 || isNaN(numChange)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid price or change percent values.'
    });
  }

  try {
    const updated = await db.updateStock(id, {
      symbol: symbol.trim(),
      company_name: company_name.trim(),
      price: numPrice,
      change_percent: numChange
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Stock with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully.'
    });
  } catch (error) {
    console.error('Error in PUT /api/stocks/:id:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock.'
    });
  }
});

// DELETE /api/stocks/:id — Remove a stock
app.delete('/api/stocks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.deleteStock(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Stock with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Stock with ID ${id} deleted successfully.`
    });
  } catch (error) {
    console.error('Error in DELETE /api/stocks/:id:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete stock.'
    });
  }
});

// 4. Fallback 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found.'
  });
});

// 5. Start Express server and initialize Database
async function startServer() {
  await db.initDb();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 StockPulse Lite Server is running!`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
    console.log(`📊 Health:    http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
