# StockPulse Lite — 2-Hour Beginner Study Guide & Practical Viva Prep

Welcome to **StockPulse Lite**! This guide is designed to help you understand every part of the application in **2 to 3 hours**, confidently demonstrate it to your practical examiner, and make live code changes on the spot without stress.

---

## Part A — Running the Project

### 1. Prerequisites Check
Make sure MySQL and Node.js are installed. MySQL should be running locally.

### 2. Database Setup (Takes 10 seconds)
You can run the provided `schema.sql` script into MySQL:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS stockpulse_lite;"
mysql -u root stockpulse_lite < schema.sql
```
*(Note: Even if you forget this step, `db.js` automatically creates the database table and seeds 4 sample stocks on server startup!)*

### 3. Start the Server
In your terminal, navigate to the project directory and run:
```bash
cd /Users/reyyansayyed/Downloads/wtlstock/stockpulse-lite
npm install    # (only needed once)
npm start
```

### 4. Open in Browser
- **Main Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Health Check API:** [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Stocks REST API:** [http://localhost:3000/api/stocks](http://localhost:3000/api/stocks)

---

## Part B — The Five Main Files Explained

| File | Exact Responsibility | Why It Matters |
| :--- | :--- | :--- |
| **`index.html`** | Structure of the webpage. Defines semantic layout (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`), inputs, and buttons. | The skeleton that the browser renders and that JavaScript manipulates. |
| **`style.css`** | Presentation and visual design. Defines CSS variables for quick theming, Flexbox for nav/headers, CSS Grid for stock cards, and responsive media queries. | Makes the dashboard look clean, professional, and readable on phone and desktop. |
| **`script.js`** | Client-side interactivity. Handles button clicks, search filtering, form validation, safe DOM manipulation (`textContent`), and calls the backend using `fetch()`. | The "brain" inside the browser that makes the webpage dynamic and responsive. |
| **`server.js`** | Node.js backend using Express framework. Listens on port 3000, serves static files safely, and exposes REST API routes (`GET`, `POST`, `PUT`, `DELETE`). | Bridges the browser frontend with the database server. |
| **`db.js`** | MySQL database driver. Reads `.env` credentials, creates connection pool, and executes parameterized SQL queries (`?`) to prevent SQL injection. | Stores and retrieves actual persistent stock records from MySQL. |

---

## Part C — How the Application Works (End-to-End Data Flow)

Here is the exact journey when you click **"Add Stock to Market"**:

```
[1. User types in Form]
          ↓
[2. Browser (script.js)] 
     - Intercepts submit with e.preventDefault()
     - Validates: non-empty, price > 0, symbol length
          ↓
[3. Fetch API (script.js)]
     - Sends POST /api/stocks with JSON body { symbol, company_name, price, change_percent }
          ↓
[4. Express Server (server.js)]
     - Reads request via express.json() middleware
     - Re-validates data
     - Calls db.createStock()
          ↓
[5. MySQL Database (db.js)]
     - Runs parameterized SQL: INSERT INTO stocks (...) VALUES (?, ?, ?, ?)
     - Returns insertId and affectedRows
          ↓
[6. JSON Response (server.js)]
     - Sends HTTP 201 Created with { success: true, data: newStock }
          ↓
[7. Browser Update (script.js)]
     - Parses response: await response.json()
     - Calls renderStocks() to build new <article class="stock-card">
     - Shows green success notification banner
```

### How the Interactive Stock Price Chart Works:
1. **Selection:** User selects a stock from the dropdown or clicks **"📈 Chart"** on any stock card.
2. **Fetch:** `script.js` calls `GET /api/stocks/${symbol}/history`.
3. **Database:** `server.js` and `db.js` retrieve the stock's current price from MySQL and return 8 intraday time/price points (9:30 AM – 4:00 PM).
4. **Data Processing:** `script.js` uses `array.map()`:
   - `const labels = historyData.map(item => item.time);`
   - `const prices = historyData.map(item => item.price);`
5. **Chart.js Render:** Cleans up previous chart instance (`priceChartInstance.destroy()`) and passes `labels` and `prices` to the HTML5 `<canvas id="price-chart">` element to draw an interactive line chart with hover tooltips.

---

## Part D — Live Editing Cheat Sheet (Exam Modifications)

When your examiner asks: *"Change X in your project right now"*, use this table. Press **Ctrl+F** (or **Cmd+F**) in the specified file, search for the term, and replace it:

| Desired Change | File | Search For | Replacement Example |
| :--- | :--- | :--- | :--- |
| **1. Change webpage title** | `index.html` | `<title>` | `<title>My Market Pulse</title>` |
| **2. Change main heading** | `index.html` | `id="main-heading"` | Change text inside `<h1>` |
| **3. Change subtitle paragraph** | `index.html` | `id="main-description"` | Change text inside `<p>` |
| **4. Change button label** | `index.html` | `id="add-stock-btn"` | Change text to `"Save Stock"` |
| **5. Change chart title** | `script.js` | `chartTitle.textContent =` | Change string to `${selectedChartSymbol} Market Trend` |
| **6. Change default chart stock** | `script.js` | `let selectedChartSymbol =` | Change `'AAPL'` to `'MSFT'` or `'GOOGL'` |
| **7. Change chart line color** | `script.js` | `borderColor: '#2563eb'` | Change to `'#10b981'` (Green) or `'#f59e0b'` (Gold) |
| **8. Change chart type (Line to Bar)**| `script.js` | `type: 'line'` (in Chart) | Change `'line'` to `'bar'` |
| **9. Change primary theme colour** | `style.css` | `--primary-color:` | Change `#2563eb` to `#7c3aed` (Purple) or `#059669` (Green) |
| **10. Change background colour** | `style.css` | `--background-color:` | Change `#0f172a` to `#18181b` or `#ffffff` |
| **11. Change card padding** | `style.css` | `.stock-card {` | Change `padding: 1.25rem;` to `padding: 2rem;` |
| **12. Change grid columns** | `style.css` | `.stocks-grid {` | Change `minmax(240px, 1fr)` to `minmax(320px, 1fr)` |
| **13. Change mobile breakpoint** | `style.css` | `@media (max-width:` | Change `768px` to `600px` |
| **14. Change form placeholder** | `index.html` | `placeholder="e.g. TSLA"` | Change to `placeholder="e.g. INFY"` |
| **15. Change validation message** | `script.js` | `Stock price must be a positive number` | Change string inside `showMessage(...)` |
| **16. Change validation limit** | `script.js` | `symbol.length > 10` | Change `10` to `5` |
| **17. Change server port** | `.env` or `server.js` | `PORT =` | Change `3000` to `5000` |
| **18. Change an API route** | `server.js` & `script.js` | `app.get('/api/stocks'` | Change `'/api/stocks'` to `'/api/market'` |
| **19. Change a database query** | `db.js` | `SELECT * FROM stocks` | Change to `SELECT * FROM stocks ORDER BY price DESC` |

---

## Part E — WTL Syllabus Mapping (All 15 Practical Topics)

Here is where each syllabus topic lives and what to say:

| # | Topic | File & Location | What to Explain to the Examiner |
| :--- | :--- | :--- | :--- |
| **1** | **HTML Headings, Lists, Images** | `index.html` (`<h1>`, `<h2>`, `<ul>`, `<img>`) | "Here is `<h1>` for page title, `<h2>` for sections, `<ul>` for watchlist items, and `<img src="logo.svg" alt="...">` for accessibility." |
| **2** | **Semantic HTML** | `index.html` (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) | "Semantic tags describe their meaning to browsers and screen readers rather than generic `<div>` tags." |
| **3** | **Inline, Internal, External CSS** | `wtl-topics/topic3-css-types.html` & `style.css` | "External CSS is linked via `<link>`, Internal is inside `<style>` in head, and Inline is directly inside element `style="..."`." |
| **4** | **Responsive Design** | `style.css` (lines 35-45, 130-140, 275-295) | "Flexbox handles navbar alignment, CSS Grid handles card layout, and `@media (max-width: 768px)` adapts to mobile screens." |
| **5** | **CSS Positioning** | `style.css` (`position: sticky`, `relative`, `absolute`) | "The header uses `position: sticky` to stay fixed on scroll; the cards use `position: relative` as an anchor container." |
| **6** | **JavaScript Events & Arrays** | `script.js` (`handleSearch`, `renderStocks`) | "`addEventListener('input')` listens for typing; array `filter()` searches stocks; `forEach()` loops to display cards." |
| **7** | **JavaScript Validation** | `script.js` (`handleAddStock`) | "Validates non-empty inputs, checks `isNaN(price)`, ensures positive price, and blocks submission with `e.preventDefault()`." |
| **8** | **React SPA & JSX** | `wtl-topics/react-demo.html` (`<StockCard />`) | "React uses JSX syntax where HTML-like markup is written directly in JavaScript functional components." |
| **9** | **React Props, State, Hooks** | `wtl-topics/react-demo.html` (`useState`, `useEffect`) | "`useState` manages stock list state; `useEffect` manages timer lifecycle; `props` passes data from parent to child component." |
| **10** | **Fetch & JSON** | `script.js` (`fetchStocks`) | "`fetch('/api/stocks')` makes an asynchronous HTTP GET request, and `await response.json()` parses the JSON payload." |
| **11** | **DOM Manipulation** | `script.js` (`renderStocks`, `toggleWatchlist`) | "`document.createElement('article')` creates nodes; `.textContent` assigns safe text; `appendChild()` adds them to the page." |
| **12** | **PHP Forms, Strings, Sessions** | `wtl-topics/php-session-demo.php` | "`session_start()` initiates session; `trim()` & `strlen()` validate strings; `$_SESSION` stores user data across requests." |
| **13** | **PHP-MySQL CRUD** | `wtl-topics/php-mysql-crud.php` | "Uses PHP PDO with prepared statements (`?` placeholders) to prevent SQL injection while performing INSERT, SELECT, UPDATE, DELETE." |
| **14** | **Node.js & Express** | `server.js` | "Express is a lightweight Node.js framework that routes incoming requests, parses JSON (`express.json()`), and serves static files." |
| **15** | **REST API & DB Connectivity** | `server.js` & `db.js` | "Provides standard REST endpoints (`GET`, `POST`, `PUT`, `DELETE`) with HTTP status codes (200, 201, 400, 404) backed by MySQL." |

---

## Part F — Viva Questions & Answers (1–2 Sentences Each)

1. **What is HTML?**
   HTML (HyperText Markup Language) is the standard markup language used to structure web pages and their content.

2. **What is semantic HTML?**
   Semantic HTML uses tags like `<header>`, `<article>`, and `<nav>` that convey the meaning of the content to browsers, search engines, and screen readers.

3. **What is CSS?**
   CSS (Cascading Style Sheets) is a stylesheet language used to control the visual presentation, styling, and layout of HTML elements.

4. **What is Flexbox?**
   Flexbox is a one-dimensional CSS layout model designed for distributing space and aligning items along a single row or column.

5. **What is CSS Grid?**
   CSS Grid is a two-dimensional layout system that allows developers to arrange items simultaneously across rows and columns.

6. **What is JavaScript?**
   JavaScript is a lightweight, interpreted programming language that enables interactive and dynamic behavior on web pages.

7. **What is the DOM?**
   The DOM (Document Object Model) is a tree-like object representation of the HTML document created by the browser that JavaScript can read and modify.

8. **What are events in JavaScript?**
   Events are signals emitted by the browser when actions occur (like clicks, keypresses, or form submissions) that event listeners can respond to.

9. **What is form validation?**
   Form validation is the process of verifying that user input meets required criteria (such as non-empty, correct format, or positive values) before processing.

10. **What is React?**
    React is an open-source JavaScript library developed by Meta for building component-based user interfaces, especially Single Page Applications.

11. **What is JSX?**
    JSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like elements inside JavaScript code.

12. **What are props and state in React?**
    Props are read-only inputs passed from parent to child components, whereas state is mutable data managed locally within a component that triggers re-renders when updated.

13. **What are React hooks?**
    Hooks are built-in functions like `useState` and `useEffect` that allow functional components to use state and lifecycle features without writing classes.

14. **What is Fetch?**
    `fetch()` is a modern browser JavaScript API for making asynchronous network HTTP requests to retrieve or send data to a server.

15. **What is JSON?**
    JSON (JavaScript Object Notation) is a lightweight, human-readable data-interchange format composed of key-value pairs and arrays.

16. **What is Node.js?**
    Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine that runs JavaScript on the server.

17. **What is Express?**
    Express is a fast, minimalist web framework for Node.js used for building web servers, routing HTTP requests, and creating RESTful APIs.

18. **What is an API?**
    An API (Application Programming Interface) is a set of rules and protocols that allows two different software programs or systems to communicate.

19. **What is a REST API?**
    A REST (Representational State Transfer) API is a web architectural style that uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to perform operations on resources identified by URLs.

20. **What is MySQL?**
    MySQL is a popular open-source relational database management system (RDBMS) that organizes data into tables with rows and columns using Structured Query Language (SQL).

21. **What is CRUD?**
    CRUD stands for the four basic database operations: Create (`INSERT`), Read (`SELECT`), Update (`UPDATE`), and Delete (`DELETE`).

22. **What is PHP?**
    PHP is an open-source server-side scripting language designed for web development that runs on the web server to produce dynamic HTML.

23. **What is a PHP session?**
    A PHP session is a mechanism that preserves state and user data across multiple page requests by storing data on the server and associating it with a unique session ID cookie on the client.

24. **What are prepared statements?**
    Prepared statements are pre-compiled SQL queries with parameter placeholders (`?`) that separate SQL logic from user data, preventing SQL injection attacks.

---

## Part G — Two-Hour Exam Practice Plan

Spend 30 minutes on each block to be 100% exam-ready:

### ⏱ Block 1: HTML & CSS (30 Minutes)
1. Open `index.html` and locate `<header>`, `<main>`, `<section>`, and `<footer>`.
2. Open `style.css` and change `--primary-color` from `#2563eb` to `#7c3aed`. Refresh browser to see the instant theme change.
3. Observe how `.stocks-grid` switches from multi-column grid to 1-column on mobile.

### ⏱ Block 2: JavaScript & Form Validation (30 Minutes)
1. Open `script.js` and trace `fetchStocks()`, `renderStocks()`, and `handleSearch()`.
2. Test search: Type `AAP` in the search box; note how `filter()` isolates Apple Inc.
3. Test validation: Try adding a stock with a negative price (e.g. `-50`). Verify the red error banner appears.
4. Add a valid stock (e.g. `TSLA`, `Tesla Inc.`, `240.50`, `3.20`) and watch it appear in the grid!

### ⏱ Block 3: Express Server, REST API & MySQL (30 Minutes)
1. Open `server.js` and identify the 5 API routes (`GET /api/health`, `GET /api/stocks`, `POST`, `PUT`, `DELETE`).
2. Open `db.js` and see the parameterized queries (`?`).
3. Open `http://localhost:3000/api/stocks` in your browser to see the raw JSON array sent from MySQL.
4. Try deleting a card from the UI and observe the MySQL delete query execute.

### ⏱ Block 4: React, PHP & Viva Revision (30 Minutes)
1. Open `wtl-topics/react-demo.html` in browser; click "Add to Watchlist" to test React state and conditional rendering.
2. Read the 24 Viva Q&As in Part F twice out loud.
3. You are now fully prepared for your Web Technology Lab practical examination!
