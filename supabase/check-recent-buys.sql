-- Check what each AI bought in most recent trades
SELECT 
  atl.execution_timestamp,
  atl.ai_nickname,
  atl.decision_action,
  atl.decision_pitch_id,
  arp.company_name,
  arp.ticker,
  atl.decision_shares,
  atl.decision_amount,
  atl.decision_reasoning
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.execution_timestamp > NOW() - INTERVAL '10 minutes'
  AND atl.decision_action = 'BUY'
ORDER BY atl.execution_timestamp DESC;
