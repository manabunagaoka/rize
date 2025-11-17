-- Check most recent AI trading logs
SELECT 
  execution_timestamp,
  user_id,
  ai_nickname,
  decision_action,
  decision_pitch_id,
  decision_shares,
  decision_amount,
  execution_success,
  decision_reasoning,
  execution_error
FROM ai_trading_logs
ORDER BY execution_timestamp DESC
LIMIT 20;
