-- Quick check: Did any AI overspend (spend more than they had)?

SELECT 
  utb.ai_nickname,
  it.transaction_type,
  it.balance_before,
  it.total_amount,
  it.balance_after,
  it.timestamp AT TIME ZONE 'America/New_York' as time_est,
  CASE 
    WHEN it.transaction_type = 'BUY' AND it.balance_after < 0 THEN '🚨 NEGATIVE!'
    WHEN it.transaction_type = 'BUY' AND it.total_amount > it.balance_before THEN '🚨 OVERSPENT!'
    WHEN it.balance_after < 0 THEN '🚨 NEGATIVE BALANCE!'
    ELSE '✅ OK'
  END as status
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
ORDER BY it.timestamp DESC
LIMIT 20;
