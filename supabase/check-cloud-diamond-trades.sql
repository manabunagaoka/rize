-- Check Cloud Surfer and Diamond Hands recent activity
-- Shows: trades, reasoning, holdings, and balance changes

-- Most recent trades
SELECT 
  execution_timestamp,
  ai_nickname,
  decision_action,
  arp.company_name,
  arp.ticker,
  decision_shares,
  cash_before,
  cash_after,
  (cash_before - cash_after) as spent,
  decision_reasoning
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE ai_nickname IN ('Cloud Surfer', 'Diamond Hands')
  AND execution_timestamp > NOW() - INTERVAL '15 minutes'
ORDER BY execution_timestamp DESC;

-- Current holdings
SELECT 
  utb.ai_nickname,
  arp.company_name,
  arp.ticker,
  ui.shares_owned,
  ui.total_invested,
  ui.current_value,
  (ui.current_value - ui.total_invested) as unrealized_gain
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
JOIN ai_readable_pitches arp ON ui.pitch_id = arp.pitch_id
WHERE utb.user_id IN ('ai_cloud', 'ai_diamond')
  AND ui.shares_owned > 0
ORDER BY utb.ai_nickname, arp.company_name;

-- Current balances
SELECT 
  ai_nickname,
  available_tokens as cash,
  (total_tokens - available_tokens) as invested,
  total_tokens as portfolio_value
FROM user_token_balances
WHERE user_id IN ('ai_cloud', 'ai_diamond');
