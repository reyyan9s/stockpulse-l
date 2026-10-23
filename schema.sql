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
('AAPL', 'Apple Inc.', 227.83, -0.45),
('MSFT', 'Microsoft Corporation', 425.79, 0.81),
('GOOGL', 'Alphabet Inc.', 164.44, 1.57),
('AMZN', 'Amazon.com Inc.', 187.83, 0.78),
('XAUUSD', 'Gold / US Dollar (Spot)', 3994.00, 0.65)
ON DUPLICATE KEY UPDATE symbol=symbol;
