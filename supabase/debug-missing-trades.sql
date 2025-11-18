-- Debug: Check ALL tables that should have been updated by the cron trades

-- 1. investment_transactions (trade log)
SELECT 
  'investment_transactions' as table_name,
  COUNT(*) as records_found,
  STRING_AGG(DISTINCT transaction_type, ', ') as transaction_types
FROM investment_transactions
WHERE timestamp > '2025-11-18 00:40:00'
  AND user_id IN (
    SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
  );

-- 2. user_investments (current holdings)
SELECT 
  'user_investments' as table_name,
  COUNT(*) as ai_investor_holdings,
  SUM(shares_owned) as total_shares,
  SUM(current_value) as total_value
FROM user_investments ui
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 3. Show the actual investment_transactions from cron run
SELECT 
  it.timestamp,
  utb.ai_nickname,
  it.transaction_type,
  arp.ticker,
  it.shares,
  it.price_per_share,
  it.total_amount,
  it.balance_after
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON it.pitch_id = arp.pitch_id
WHERE it.timestamp > '2025-11-18 00:40:00'
  AND utb.is_ai_investor = true
ORDER BY it.timestamp DESC;
