// ============================================================
// StockPulse Terminal — script.js
// High-Precision Financial Workstation Script
// Web Technology Lab: DOM Manipulation, Events, Fetch API, TradingView
// ============================================================

// 1. APPLICATION STATE
let stocks = [];
let watchlist = JSON.parse(localStorage.getItem('stockpulse_watchlist') || '[]');
let currentTvSymbol = 'AAPL';
let currentTvTimeframe = 'D';
let activeFilter = 'all';

// Fallback demo data in case backend server is unreachable
const DEMO_STOCKS = [
  { id: 1, symbol: 'AAPL', company_name: 'Apple Inc.', price: 182.50, change_percent: 1.25 },
  { id: 2, symbol: 'MSFT', company_name: 'Microsoft Corporation', price: 420.10, change_percent: -0.45 },
  { id: 3, symbol: 'GOOGL', company_name: 'Alphabet Inc.', price: 175.30, change_percent: 0.85 },
  { id: 4, symbol: 'AMZN', company_name: 'Amazon.com Inc.', price: 185.90, change_percent: -1.10 },
  { id: 5, symbol: 'XAUUSD', company_name: 'Gold / US Dollar (Spot)', price: 2735.50, change_percent: 0.65 }
];

// Exchange mapping for proper TradingView technical feed
const TRADINGVIEW_SYMBOL_MAP = {
  AAPL: { tv: 'NASDAQ:AAPL', exchange: 'NASDAQ' },
  NVDA: { tv: 'NASDAQ:NVDA', exchange: 'NASDAQ' },
  MSFT: { tv: 'NASDAQ:MSFT', exchange: 'NASDAQ' },
  AMZN: { tv: 'NASDAQ:AMZN', exchange: 'NASDAQ' },
  TSLA: { tv: 'NASDAQ:TSLA', exchange: 'NASDAQ' },
  GOOGL: { tv: 'NASDAQ:GOOGL', exchange: 'NASDAQ' },
  META: { tv: 'NASDAQ:META', exchange: 'NASDAQ' },
  NFLX: { tv: 'NASDAQ:NFLX', exchange: 'NASDAQ' },
  JPM: { tv: 'NYSE:JPM', exchange: 'NYSE' },
  UBER: { tv: 'NYSE:UBER', exchange: 'NYSE' },
  RELIANCE: { tv: 'BSE:RELIANCE', exchange: 'BSE' },
  TCS: { tv: 'BSE:TCS', exchange: 'BSE' },
  INFY: { tv: 'BSE:INFY', exchange: 'BSE' },
  HDFCBANK: { tv: 'BSE:HDFCBANK', exchange: 'BSE' },
  XAUUSD: { tv: 'OANDA:XAUUSD', exchange: 'COMMODITY' },
  GOLD: { tv: 'OANDA:XAUUSD', exchange: 'COMMODITY' },
  'XAU/USD': { tv: 'OANDA:XAUUSD', exchange: 'COMMODITY' }
};

// 2. DOM ELEMENT REFERENCES
const stocksGrid = document.querySelector('#stocks-grid');
const searchInput = document.querySelector('#search-input');
const addStockForm = document.querySelector('#add-stock-form');
const messageBox = document.querySelector('#message-box');
const refreshBtn = document.querySelector('#refresh-btn');
const backendStatus = document.querySelector('#backend-status');
const watchlistItems = document.querySelector('#watchlist-items');
const watchlistCount = document.querySelector('#watchlist-count');
const chartSelect = document.querySelector('#chart-stock-select');
const chartTitle = document.querySelector('#chart-title');
const chartSubtitle = document.querySelector('#chart-subtitle');
const activeSymbolBadge = document.querySelector('#active-symbol-badge');
const activeExchangeBadge = document.querySelector('#active-exchange-badge');
const quickAssetChips = document.querySelector('#quick-asset-chips');
const quotesCountBadge = document.querySelector('#quotes-count-badge');

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  fetchStocks();
  renderWatchlist();
  setupEventListeners();
});

// 4. EVENT LISTENERS
function setupEventListeners() {
  // Search input filter
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Keyboard shortcut: '/' focuses search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      handleSearch({ target: searchInput });
      searchInput.blur();
    }
  });

  // Filter category tabs
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter') || 'all';
      filterAndRenderStocks();
    });
  });

  // Add stock form submission
  if (addStockForm) {
    addStockForm.addEventListener('submit', handleAddStock);
  }

  // Timeframe selector buttons
  document.querySelectorAll('.timeframe-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.timeframe-btn').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      currentTvTimeframe = e.target.getAttribute('data-timeframe') || 'D';
      initTradingViewChart(currentTvSymbol, currentTvTimeframe);
    });
  });

  // Native chart dropdown change
  if (chartSelect) {
    chartSelect.addEventListener('change', (e) => initTradingViewChart(e.target.value, currentTvTimeframe));
  }

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchStocks();
      showMessage('Syncing latest market quotes...', 'success');
    });
  }
}

// 5. FETCH STOCKS FROM BACKEND (REST API)
async function fetchStocks() {
  try {
    const response = await fetch('/api/stocks');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      stocks = result.data;
      filterAndRenderStocks();
      updateChartControls(stocks);
      initTradingViewChart(currentTvSymbol || 'AAPL', currentTvTimeframe);
      updateBackendStatus(true);
    } else {
      throw new Error(result.error || 'Invalid data');
    }
  } catch (error) {
    console.warn('Backend unavailable, using demonstration assets:', error.message);
    stocks = [...DEMO_STOCKS];
    filterAndRenderStocks();
    updateChartControls(stocks);
    initTradingViewChart(currentTvSymbol || 'AAPL', currentTvTimeframe);
    updateBackendStatus(false);
  }
}

async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    updateBackendStatus(res.ok && data.database === 'connected');
  } catch {
    updateBackendStatus(false);
  }
}

function updateBackendStatus(isOnline) {
  if (backendStatus) {
    if (isOnline) {
      backendStatus.textContent = 'FEED: LIVE (MySQL)';
      backendStatus.style.color = '#10b981';
    } else {
      backendStatus.textContent = 'FEED: LOCAL (Offline)';
      backendStatus.style.color = '#f43f5e';
    }
  }
}

// 6. RENDER STOCKS GRID
function filterAndRenderStocks() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  let filtered = stocks.filter((stock) => {
    const symbolMatches = stock.symbol.toLowerCase().includes(query);
    const companyMatches = stock.company_name.toLowerCase().includes(query);
    return symbolMatches || companyMatches;
  });

  if (activeFilter === 'gainers') {
    filtered = filtered.filter((s) => Number(s.change_percent) > 0);
  } else if (activeFilter === 'tech') {
    filtered = filtered.filter((s) => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'].includes(s.symbol.toUpperCase()));
  } else if (activeFilter === 'commodities') {
    filtered = filtered.filter((s) => ['XAUUSD', 'GOLD', 'XAU/USD'].includes(s.symbol.toUpperCase()));
  }

  renderStocks(filtered);

  if (quotesCountBadge) {
    quotesCountBadge.textContent = `${filtered.length} of ${stocks.length} Assets`;
  }
}

function renderStocks(stocksToDisplay) {
  stocksGrid.innerHTML = '';

  if (stocksToDisplay.length === 0) {
    stocksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; color: var(--text-dim);">
        <p style="font-size: 0.95rem;">No matching assets found.</p>
        <p style="font-size: 0.8rem; margin-top: 0.35rem;">Try adjusting your query or filter tab.</p>
      </div>
    `;
    return;
  }

  stocksToDisplay.forEach((stock) => {
    const card = document.createElement('article');
    card.className = `stock-card ${stock.symbol.toUpperCase() === currentTvSymbol.toUpperCase() ? 'is-active-chart' : ''}`;
    card.setAttribute('data-symbol', stock.symbol);

    const isPositive = Number(stock.change_percent) >= 0;
    const mapping = TRADINGVIEW_SYMBOL_MAP[stock.symbol.toUpperCase()] || { exchange: 'US' };

    // Card Top: Symbol, Exchange & 24h Change
    const cardTop = document.createElement('div');
    cardTop.className = 'card-top';

    const symCluster = document.createElement('div');
    symCluster.className = 'card-symbol-cluster';

    const symbolEl = document.createElement('span');
    symbolEl.className = 'stock-symbol';
    symbolEl.textContent = stock.symbol;

    const exchangeEl = document.createElement('span');
    exchangeEl.className = 'card-exchange';
    exchangeEl.textContent = mapping.exchange;

    symCluster.appendChild(symbolEl);
    symCluster.appendChild(exchangeEl);

    const changeEl = document.createElement('span');
    changeEl.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
    changeEl.textContent = `${isPositive ? '+' : ''}${Number(stock.change_percent).toFixed(2)}%`;

    cardTop.appendChild(symCluster);
    cardTop.appendChild(changeEl);

    // Company Name
    const nameEl = document.createElement('p');
    nameEl.className = 'stock-name';
    nameEl.textContent = stock.company_name;

    // Pricing Row
    const pricingDiv = document.createElement('div');
    pricingDiv.className = 'card-pricing';

    const priceEl = document.createElement('span');
    priceEl.className = 'stock-price';
    priceEl.textContent = `$${Number(stock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const currencyEl = document.createElement('span');
    currencyEl.className = 'card-currency-tag';
    currencyEl.textContent = 'USD';

    pricingDiv.appendChild(priceEl);
    pricingDiv.appendChild(currencyEl);

    // Action Buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card-actions';

    // Chart button
    const chartBtn = document.createElement('button');
    chartBtn.type = 'button';
    chartBtn.className = 'card-btn chart-btn';
    chartBtn.innerHTML = 'Chart &nearr;';
    chartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      initTradingViewChart(stock.symbol, currentTvTimeframe);
      document.querySelector('#chart-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Watchlist toggle button
    const isWatchlisted = watchlist.some((w) => w.symbol === stock.symbol);
    const watchBtn = document.createElement('button');
    watchBtn.type = 'button';
    watchBtn.className = `card-btn watch-btn ${isWatchlisted ? 'watching' : ''}`;
    watchBtn.textContent = isWatchlisted ? '★ Pinned' : '+ Watch';
    watchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWatchlist(stock);
    });

    // Remove from DB button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'card-btn delete-btn';
    deleteBtn.title = 'Remove asset from database';
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRemoveStock(stock.id, stock.symbol);
    });

    actionsDiv.appendChild(chartBtn);
    actionsDiv.appendChild(watchBtn);
    actionsDiv.appendChild(deleteBtn);

    // Clicking anywhere on card opens in chart
    card.addEventListener('click', () => {
      initTradingViewChart(stock.symbol, currentTvTimeframe);
    });

    card.appendChild(cardTop);
    card.appendChild(nameEl);
    card.appendChild(pricingDiv);
    card.appendChild(actionsDiv);

    stocksGrid.appendChild(card);
  });
}

function handleSearch(event) {
  filterAndRenderStocks();
}

// 7. WATCHLIST MANAGEMENT (LocalStorage Sync)
function toggleWatchlist(stock) {
  const index = watchlist.findIndex((w) => w.symbol === stock.symbol);
  if (index >= 0) {
    watchlist.splice(index, 1);
    showMessage(`Removed ${stock.symbol} from watchlist.`, 'success');
  } else {
    watchlist.push({
      id: stock.id,
      symbol: stock.symbol,
      company_name: stock.company_name,
      price: stock.price,
      change_percent: stock.change_percent
    });
    showMessage(`Pinned ${stock.symbol} to active watchlist.`, 'success');
  }

  localStorage.setItem('stockpulse_watchlist', JSON.stringify(watchlist));
  renderWatchlist();
  filterAndRenderStocks();
}

function renderWatchlist() {
  if (!watchlistItems || !watchlistCount) return;

  watchlistCount.textContent = watchlist.length;
  watchlistItems.innerHTML = '';

  if (watchlist.length === 0) {
    watchlistItems.innerHTML = `
      <li class="empty-watchlist">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span>No pinned assets. Click <strong>+ Watch</strong> on any quote above.</span>
      </li>
    `;
    return;
  }

  watchlist.forEach((stock) => {
    const li = document.createElement('li');
    li.className = 'watchlist-item';

    const left = document.createElement('div');
    left.className = 'watchlist-item-left';
    left.addEventListener('click', () => {
      initTradingViewChart(stock.symbol, currentTvTimeframe);
      document.querySelector('#chart-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    const sym = document.createElement('span');
    sym.className = 'watchlist-symbol';
    sym.textContent = stock.symbol;

    const comp = document.createElement('span');
    comp.className = 'watchlist-company';
    comp.textContent = stock.company_name;

    left.appendChild(sym);
    left.appendChild(comp);

    const right = document.createElement('div');
    right.className = 'watchlist-item-right';

    const price = document.createElement('span');
    price.className = 'watchlist-price';
    price.textContent = `$${Number(stock.price).toFixed(2)}`;

    const del = document.createElement('button');
    del.className = 'watchlist-remove-btn';
    del.innerHTML = '&times;';
    del.title = 'Remove from watchlist';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWatchlist(stock);
    });

    right.appendChild(price);
    right.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    watchlistItems.appendChild(li);
  });
}

// 8. ADD STOCK FORM HANDLER (Fetch POST)
async function handleAddStock(event) {
  event.preventDefault();

  const symbolInput = document.querySelector('#stock-symbol');
  const companyInput = document.querySelector('#stock-company');
  const priceInput = document.querySelector('#stock-price');
  const changeInput = document.querySelector('#stock-change');

  const symbol = symbolInput.value.trim().toUpperCase();
  const company = companyInput.value.trim();
  const price = parseFloat(priceInput.value);
  const change = parseFloat(changeInput.value);

  if (!symbol || !company) {
    showMessage('Please specify both the ticker symbol and asset name.', 'error');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showMessage('Please enter a valid positive asset price.', 'error');
    return;
  }
  if (isNaN(change)) {
    showMessage('Please enter a valid percentage net change.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/stocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        company_name: company,
        price,
        change_percent: change
      })
    });

    const result = await response.json();
    if (response.ok && result.success) {
      showMessage(`Added ${symbol} (${company}) to market feed.`, 'success');
      addStockForm.reset();
      await fetchStocks();
      initTradingViewChart(symbol, currentTvTimeframe);
    } else {
      throw new Error(result.error || 'Failed to insert asset.');
    }
  } catch (error) {
    console.warn('POST failed, appending locally:', error.message);
    const newStock = {
      id: Date.now(),
      symbol,
      company_name: company,
      price,
      change_percent: change
    };
    stocks.unshift(newStock);
    filterAndRenderStocks();
    updateChartControls(stocks);
    initTradingViewChart(symbol, currentTvTimeframe);
    addStockForm.reset();
    showMessage(`Added ${symbol} to session assets (local mode).`, 'success');
  }
}

// 9. REMOVE STOCK HANDLER (Fetch DELETE)
async function handleRemoveStock(id, symbol) {
  if (!confirm(`Are you sure you want to delete ${symbol} from the market?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/stocks/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok && result.success) {
      showMessage(`Removed ${symbol} from database.`, 'success');
      await fetchStocks();
    } else {
      throw new Error(result.error || 'Delete failed.');
    }
  } catch (err) {
    console.warn('DELETE failed, removing locally:', err.message);
    stocks = stocks.filter((s) => s.id !== id);
    filterAndRenderStocks();
    updateChartControls(stocks);
    showMessage(`Removed ${symbol} (local mode).`, 'success');
  }
}

// 10. TRADINGVIEW TECHNICAL CHART INTEGRATION
function updateChartControls(stockList) {
  if (chartSelect) {
    chartSelect.innerHTML = '';
    stockList.forEach((st) => {
      const opt = document.createElement('option');
      opt.value = st.symbol;
      opt.textContent = `${st.symbol} — ${st.company_name}`;
      if (st.symbol === currentTvSymbol) opt.selected = true;
      chartSelect.appendChild(opt);
    });
  }

  // Update quick asset chips
  if (quickAssetChips) {
    quickAssetChips.innerHTML = '';
    const priority = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'XAUUSD'];
    
    // Put priority first, then remaining
    const ordered = [...stockList].sort((a, b) => {
      const idxA = priority.indexOf(a.symbol.toUpperCase());
      const idxB = priority.indexOf(b.symbol.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    ordered.slice(0, 6).forEach((st) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isGold = ['XAUUSD', 'GOLD'].includes(st.symbol.toUpperCase());
      btn.className = `chip-btn ${isGold ? 'gold-chip' : ''} ${st.symbol.toUpperCase() === currentTvSymbol.toUpperCase() ? 'active' : ''}`;
      btn.setAttribute('data-symbol', st.symbol);
      btn.textContent = isGold ? '★ Gold (XAUUSD)' : st.symbol;
      btn.addEventListener('click', () => initTradingViewChart(st.symbol, currentTvTimeframe));
      quickAssetChips.appendChild(btn);
    });
  }
}

function initTradingViewChart(symbol = currentTvSymbol, timeframe = currentTvTimeframe) {
  currentTvSymbol = symbol.toUpperCase();
  currentTvTimeframe = timeframe;

  const container = document.getElementById('tradingview-chart-container');
  if (!container) return;

  const mapping = TRADINGVIEW_SYMBOL_MAP[currentTvSymbol] || { tv: `NASDAQ:${currentTvSymbol}`, exchange: 'NASDAQ' };
  const foundStock = stocks.find((s) => s.symbol.toUpperCase() === currentTvSymbol);
  const companyName = foundStock ? foundStock.company_name : (currentTvSymbol === 'XAUUSD' ? 'Gold / US Dollar Spot' : 'Active Asset');

  // Update header badges
  if (activeSymbolBadge) activeSymbolBadge.textContent = currentTvSymbol;
  if (activeExchangeBadge) activeExchangeBadge.textContent = mapping.exchange;
  if (chartTitle) chartTitle.textContent = `${currentTvSymbol} — ${companyName}`;
  if (chartSelect && chartSelect.value !== currentTvSymbol) chartSelect.value = currentTvSymbol;

  // Update active chip
  document.querySelectorAll('.chip-btn').forEach((chip) => {
    if (chip.getAttribute('data-symbol')?.toUpperCase() === currentTvSymbol) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Re-highlight active card in stock cards grid
  document.querySelectorAll('.stock-card').forEach((card) => {
    if (card.getAttribute('data-symbol')?.toUpperCase() === currentTvSymbol) {
      card.classList.add('is-active-chart');
    } else {
      card.classList.remove('is-active-chart');
    }
  });

  // Clean re-mount
  container.innerHTML = '';

  const widgetDiv = document.createElement('div');
  widgetDiv.className = 'tradingview-widget-container__widget';
  widgetDiv.style.height = '100%';
  widgetDiv.style.width = '100%';
  container.appendChild(widgetDiv);

  // Official TradingView Advanced Chart Embed Script
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  script.type = 'text/javascript';
  script.async = true;
  script.innerHTML = JSON.stringify({
    autosize: true,
    symbol: mapping.tv,
    interval: currentTvTimeframe,
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1',
    locale: 'en',
    enable_publishing: false,
    backgroundColor: '#080b11',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    calendar: false,
    hide_volume: false,
    support_host: 'https://www.tradingview.com'
  });

  container.appendChild(script);
}

// 11. TOAST NOTIFICATION HELPER
function showMessage(text, type = 'success') {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `toast-notification ${type}`;
  messageBox.classList.remove('hidden');

  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 4000);
}
