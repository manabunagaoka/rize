-- Check ALL ai_trading_logs to see if cron has EVER executed
SELECT 
  triggered_by,
  COUNT(*) as total_trades,
  MIN(execution_timestamp) as first_trade,
  MAX(execution_timestamp) as last_trade
FROM ai_trading_logs
GROUP BY triggered_by
ORDER BY triggered_by;

-- Check if there are ANY logs from today at all
SELECT 
  COUNT(*) as logs_today,
  MIN(execution_timestamp) as earliest,
  MAX(execution_timestamp) as latest
FROM ai_trading_logs
WHERE DATE(execution_timestamp) = CURRENT_DATE;

-- Check most recent logs regardless of date
SELECT 
  execution_timestamp,
  ai_nickname,
  triggered_by,
  decision_action
FROM ai_trading_logs
ORDER BY execution_timestamp DESC
LIMIT 10;
