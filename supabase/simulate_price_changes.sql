-- Simulate market movement by changing HM7 stock prices
-- Run this to create price variance so AI portfolios diverge

-- Simulate some stocks going up, some going down
UPDATE pitch_market_data
SET 
  current_price = CASE pitch_id
    WHEN 1 THEN 395.00  -- Facebook/Meta UP 2.6% (was 385)
    WHEN 2 THEN 410.00  -- Microsoft DOWN 1.2% (was 415)
    WHEN 3 THEN 27.00   -- Dropbox UP 8% (was 25)
    WHEN 4 THEN 70.00   -- Reddit UP 7.7% (was 65)
    WHEN 5 THEN 98.00   -- Quora DOWN 2% (was 100)
    WHEN 6 THEN 105.00  -- Khan Academy UP 5% (was 100)
    WHEN 7 THEN 14.00   -- Snapchat DOWN 6.7% (was 15)
  END,
  price_change_24h = CASE pitch_id
    WHEN 1 THEN 2.6
    WHEN 2 THEN -1.2
    WHEN 3 THEN 8.0
    WHEN 4 THEN 7.7
    WHEN 5 THEN -2.0
    WHEN 6 THEN 5.0
    WHEN 7 THEN -6.7
  END,
  updated_at = NOW()
WHERE pitch_id BETWEEN 1 AND 7;

-- Trigger portfolio value recalculation
-- This updates all user_investments.current_value based on new prices
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price,
    updated_at = NOW()
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id;

-- Verify the changes
SELECT 
  utb.ai_nickname,
  utb.available_tokens as cash,
  COALESCE(SUM(ui.current_value), 0) as holdings_value,
  utb.available_tokens + COALESCE(SUM(ui.current_value), 0) as total_value,
  COALESCE(SUM(ui.current_value) - SUM(ui.total_invested), 0) as unrealized_gain
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id
WHERE utb.is_ai_investor = true
GROUP BY utb.user_id, utb.ai_nickname, utb.available_tokens
ORDER BY total_value DESC;
