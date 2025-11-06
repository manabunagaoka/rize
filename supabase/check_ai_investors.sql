-- Check AI investors' portfolios for anomalies
-- Looking for unrealistic share counts or values

-- Top AI investors with their holdings
SELECT 
  utb.user_email,
  utb.username,
  utb.available_tokens as cash,
  COUNT(ui.pitch_id) as investment_count,
  SUM(ui.shares_owned * 
    CASE ui.pitch_id
      WHEN 1 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 1)
      WHEN 2 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 2)
      WHEN 3 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 3)
      WHEN 4 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 4)
      WHEN 5 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 5)
      WHEN 6 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 6)
      WHEN 7 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 7)
    END
  ) as holdings_value,
  utb.available_tokens + SUM(ui.shares_owned * 
    CASE ui.pitch_id
      WHEN 1 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 1)
      WHEN 2 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 2)
      WHEN 3 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 3)
      WHEN 4 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 4)
      WHEN 5 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 5)
      WHEN 6 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 6)
      WHEN 7 THEN (SELECT current_price FROM pitch_market_data WHERE pitch_id = 7)
    END
  ) as total_portfolio
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id
WHERE utb.is_ai_investor = true
GROUP BY utb.user_id, utb.user_email, utb.username, utb.available_tokens
ORDER BY total_portfolio DESC
LIMIT 5;

-- Detailed holdings for top 2 AI investors
SELECT 
  utb.username,
  ui.pitch_id,
  ui.shares_owned,
  ui.total_invested,
  ui.current_value,
  ui.avg_purchase_price
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
WHERE utb.user_email IN ('ai_steady@rize.manaboodle.com', 'ai_oracle@rize.manaboodle.com')
ORDER BY utb.username, ui.pitch_id;

-- Check transaction history for AI Steady Eddie
SELECT 
  transaction_type,
  pitch_id,
  shares,
  price_per_share,
  total_amount,
  balance_before,
  balance_after,
  timestamp
FROM investment_transactions
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_steady@rize.manaboodle.com')
ORDER BY timestamp DESC
LIMIT 20;
