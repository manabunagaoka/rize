-- Recalculate AI investor portfolio values based on real stock prices
-- This updates the user_investments table with current market prices

-- First, update the pitch_market_data table with real prices
-- These are approximate current prices - will be updated by Finnhub sync
UPDATE pitch_market_data
SET 
  current_price = CASE pitch_id
    WHEN 1 THEN 590.00  -- META (Facebook) - real current price
    WHEN 2 THEN 425.00  -- MSFT (Microsoft) - real current price
    WHEN 3 THEN 28.00   -- DBX (Dropbox) - real current price
    WHEN 4 THEN 95.00   -- AKAM (Akamai) - real current price
    WHEN 5 THEN 180.00  -- RDDT (Reddit) - real current price
    WHEN 6 THEN 17.00   -- WRBY (Warby Parker) - real current price
    WHEN 7 THEN 4800.00 -- BKNG (Booking.com) - real current price
  END,
  updated_at = NOW()
WHERE pitch_id BETWEEN 1 AND 7;

-- Now recalculate all user_investments.current_value based on real prices
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price,
    updated_at = NOW()
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id;

-- Verify the AI investor portfolios
SELECT 
  utb.ai_nickname,
  utb.available_tokens as cash,
  COALESCE(SUM(ui.current_value), 0) as holdings_value,
  utb.available_tokens + COALESCE(SUM(ui.current_value), 0) as total_portfolio_value,
  COALESCE(SUM(ui.current_value) - SUM(ui.total_invested), 0) as unrealized_gain_loss,
  ROUND(((utb.available_tokens + COALESCE(SUM(ui.current_value), 0) - 1000000) / 1000000.0 * 100), 2) as performance_pct
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id
WHERE utb.is_ai_investor = true
GROUP BY utb.user_id, utb.ai_nickname, utb.available_tokens
ORDER BY total_portfolio_value DESC;
