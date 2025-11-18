-- Show the 20 most recent trades regardless of trigger
SELECT 
  execution_timestamp,
  triggered_by,
  ai_nickname,
  decision_action,
  arp.ticker
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
ORDER BY execution_timestamp DESC
LIMIT 20;
