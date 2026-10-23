-- ============================================================
-- StockPulse Lite: Database Schema
-- Simple, clean table for Web Technology Lab practicals
-- ============================================================

CREATE DATABASE IF NOT EXISTS stockpulse_lite;
USE stockpulse_lite;

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  company_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  change_percent DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial demonstration stocks (4 sample cards)
INSERT INTO stocks (symbol, company_name, price, change_percent) VALUES
('AAPL', 'Apple Inc.', 182.50, 1.25),
('MSFT', 'Microsoft Corporation', 420.10, -0.45),
('GOOGL', 'Alphabet Inc.', 175.30, 0.85),
('AMZN', 'Amazon.com Inc.', 185.90, -1.10),
('XAUUSD', 'Gold / US Dollar (Spot)', 2735.50, 0.65)
ON DUPLICATE KEY UPDATE symbol=symbol;
