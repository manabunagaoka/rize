-- INVESTIGATION: Why are all AIs trading uncontrollably?
-- Run these queries to understand what happened

-- 1. Check trading frequency (last hour)
SELECT 
  utb.ai_nickname,
  COUNT(*) as trades_last_hour,
  MIN(it.timestamp) as first_trade,
  MAX(it.timestamp) as last_trade
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
  AND it.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY utb.ai_nickname
ORDER BY trades_last_hour DESC;

-- 2. Check if trades came from cron or manual
SELECT 
  triggered_by,
  COUNT(*) as count,
  MIN(execution_timestamp) as first,
  MAX(execution_timestamp) as last
FROM ai_trading_logs
WHERE execution_timestamp > NOW() - INTERVAL '1 hour'
GROUP BY triggered_by;

-- 3. Check transaction amounts (are they exceeding balances?)
SELECT 
  utb.ai_nickname,
  it.transaction_type,
  it.total_amount,
  it.balance_before,
  it.balance_after,
  it.timestamp,
  CASE 
    WHEN it.transaction_type = 'BUY' AND it.balance_after < 0 THEN '🚨 NEGATIVE BALANCE!'
    WHEN it.transaction_type = 'BUY' AND it.total_amount > it.balance_before THEN '🚨 OVERSPENT!'
    ELSE '✅ OK'
  END as status
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
  AND it.timestamp > NOW() - INTERVAL '1 hour'
ORDER BY it.timestamp DESC
LIMIT 50;

-- 4. Current AI balances vs expected
SELECT 
  ai_nickname,
  available_tokens as current_cash,
  total_tokens as current_total,
  total_invested,
  CASE 
    WHEN available_tokens < 0 THEN '🚨 NEGATIVE CASH'
    WHEN total_tokens > 2000000 THEN '🚨 OVER 200% ROI'
    WHEN available_tokens > 1500000 THEN '🚨 MORE THAN STARTED WITH'
    ELSE '✅ Seems reasonable'
  END as status
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY total_tokens DESC;

-- 5. Check for duplicate/rapid trades (same AI, same stock, within seconds)
SELECT 
  utb.ai_nickname,
  it.pitch_id,
  it.transaction_type,
  COUNT(*) as rapid_trades,
  STRING_AGG(it.timestamp::text, ', ' ORDER BY it.timestamp) as trade_times
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
  AND it.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY utb.ai_nickname, it.pitch_id, it.transaction_type
HAVING COUNT(*) > 1
ORDER BY rapid_trades DESC;

-- 6. Total trades per AI (all time)
SELECT 
  utb.ai_nickname,
  COUNT(*) as total_trades,
  SUM(CASE WHEN it.transaction_type = 'BUY' THEN 1 ELSE 0 END) as buys,
  SUM(CASE WHEN it.transaction_type = 'SELL' THEN 1 ELSE 0 END) as sells
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
GROUP BY utb.ai_nickname
ORDER BY total_trades DESC;
