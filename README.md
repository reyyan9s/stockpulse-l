# StockPulse — Modern Stock Market Dashboard

A clean, responsive, and lightweight stock market dashboard built with vanilla **HTML5**, **CSS3**, **JavaScript**, **Node.js (Express)**, and **MySQL**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL Server** (running on `localhost:3306`)

### 2. Database Setup
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS stockpulse_lite;"
mysql -u root stockpulse_lite < schema.sql
```
*(Note: `db.js` also automatically creates the `stocks` table and seeds default stocks on startup if not already created).*

### 3. Start the Server
```bash
npm install     # First time only
npm start       # Production server on http://localhost:3000
# or
npm run dev     # Auto-restarts on code changes
```

### 4. Open in Browser
Visit: **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Core Architecture

The dashboard is built around five clean, readable files:

| File | Purpose |
| :--- | :--- |
| **`index.html`** | Semantic webpage structure, market grid, official TradingView terminal widget, and stock addition form. |
| **`style.css`** | Modern dark-theme styling, CSS variables for instant re-theming, Flexbox, and CSS Grid. |
| **`script.js`** | Client interactions, live search filtering, form validation, dynamic watchlist, and TradingView chart initialization. |
| **`server.js`** | Express REST API serving static assets and handling endpoints (`GET`, `POST`, `PUT`, `DELETE`). |
| **`db.js`** | MySQL connection pool and safe parameterized queries (`?`) preventing SQL injection. |

---

## 🛠️ Private Developer Reference (Quick Edits)

When you need to make changes quickly, search for these exact terms in the respective file:

| Desired Change | File | Search Term | What to Replace |
| :--- | :--- | :--- | :--- |
| **Brand name or page title** | `index.html` | `<title>` or `.brand-name` | Edit the text |
| **Primary brand color** | `style.css` | `--primary-color:` | Change `#2563eb` to any hex code (e.g., `#10b981` or `#7c3aed`) |
| **Background dark theme** | `style.css` | `--background-color:` | Change `#0f172a` to `#18181b` or `#000000` |
| **Default TradingView stock** | `script.js` | `let currentTvSymbol =` | Change `'AAPL'` to `'NVDA'` or `'TSLA'` |
| **Default timeframe** | `script.js` | `let currentTvTimeframe =` | Change `'D'` to `'15'`, `'60'`, `'W'`, or `'M'` |
| **TradingView widget height** | `style.css` | `.tradingview-container-wrapper` | Change `height: 520px;` to `480px` or `600px` |
| **Server port** | `.env` | `PORT=` | Change `3000` to `5000` |
| **Add a new stock field** | `schema.sql` & `db.js` | `INSERT INTO stocks` | Add new column |

---

## 📡 REST API Endpoints

- `GET /api/health` — System and database health status
- `GET /api/stocks` — Retrieve all active market stocks
- `GET /api/stocks/:symbol/history?range=1D` — Historical price points (supports `1D`, `1W`, `1M`, `1Y`)
- `POST /api/stocks` — Add a new stock (requires `symbol`, `company_name`, `price`, `change_percent`)
- `PUT /api/stocks/:id` — Update stock price and percentage
- `DELETE /api/stocks/:id` — Remove stock from database
# stockpulse-l
