-- Simple check: Show ALL cron trades ever
SELECT 
  execution_timestamp,
  ai_nickname,
  decision_action,
  arp.ticker,
  decision_shares,
  execution_success
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE triggered_by = 'cron'
ORDER BY execution_timestamp DESC
LIMIT 20;
