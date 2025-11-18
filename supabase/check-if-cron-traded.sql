-- Quick check: Did automated trading execute?
-- Run this anytime to see if cron trades happened

-- 1. Check if any cron trades happened today or yesterday
SELECT 
  DATE(execution_timestamp AT TIME ZONE 'America/New_York') as trade_date,
  TO_CHAR(execution_timestamp AT TIME ZONE 'America/New_York', 'Day HH12:MI AM') as time_est,
  COUNT(DISTINCT ai_nickname) as ais_traded,
  COUNT(CASE WHEN decision_action = 'BUY' THEN 1 END) as buys,
  COUNT(CASE WHEN decision_action = 'SELL' THEN 1 END) as sells,
  COUNT(CASE WHEN decision_action = 'HOLD' THEN 1 END) as holds
FROM ai_trading_logs
WHERE triggered_by = 'cron'
  AND execution_timestamp > CURRENT_DATE - INTERVAL '2 days'
GROUP BY DATE(execution_timestamp AT TIME ZONE 'America/New_York'), 
         TO_CHAR(execution_timestamp AT TIME ZONE 'America/New_York', 'Day HH12:MI AM')
ORDER BY trade_date DESC, time_est DESC;

-- 2. If trades happened, show details
SELECT 
  TO_CHAR(execution_timestamp AT TIME ZONE 'America/New_York', 'MM/DD HH12:MI AM') as time_est,
  ai_nickname,
  decision_action,
  arp.ticker,
  decision_shares,
  ROUND((cash_before - cash_after)::numeric, 0) as spent,
  execution_success
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE triggered_by = 'cron'
  AND execution_timestamp > CURRENT_DATE - INTERVAL '2 days'
ORDER BY execution_timestamp DESC;
