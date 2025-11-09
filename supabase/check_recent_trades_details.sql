-- Get detailed view of recent trades to understand the pattern

-- When did these trades happen? (all time, grouped by date)
SELECT 
  DATE(it.timestamp) as trade_date,
  utb.ai_nickname,
  COUNT(*) as trades_that_day
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
GROUP BY DATE(it.timestamp), utb.ai_nickname
ORDER BY trade_date DESC, trades_that_day DESC;

-- Show actual trades from today
SELECT 
  utb.ai_nickname,
  it.transaction_type,
  it.pitch_id,
  it.shares,
  it.price_per_share,
  it.total_amount,
  it.balance_before,
  it.balance_after,
  it.timestamp AT TIME ZONE 'America/New_York' as timestamp_est
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
  AND DATE(it.timestamp) = CURRENT_DATE
ORDER BY it.timestamp DESC;

-- Check the ACTUAL current state of AIs
SELECT 
  ai_nickname,
  ai_strategy,
  ROUND(available_tokens::numeric, 2) as cash,
  ROUND(total_tokens::numeric, 2) as total_value,
  ROUND(total_invested::numeric, 2) as total_invested,
  ROUND(((total_tokens - 1000000) / 1000000 * 100)::numeric, 2) as roi_percent
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY total_tokens DESC;
