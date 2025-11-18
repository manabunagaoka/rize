-- Investigate why FOMO Master's trade failed

-- 1. Get FOMO Master's decision and error from ai_trading_logs
SELECT 
  execution_timestamp,
  ai_nickname,
  cash_before,
  decision_action,
  arp.ticker,
  decision_shares,
  decision_reasoning,
  execution_success,
  execution_error,
  execution_message
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'FOMO Master'
  AND atl.triggered_by = 'cron'
  AND atl.execution_timestamp > '2025-11-18 00:40:00'
ORDER BY atl.execution_timestamp DESC;

-- 2. Check FOMO Master's balance at time of trade
SELECT 
  ai_nickname,
  available_tokens as current_cash,
  portfolio_value,
  total_tokens as total_value,
  updated_at
FROM user_token_balances
WHERE ai_nickname = 'FOMO Master';

-- 3. Calculate if FOMO Master had enough money for the AKAM trade
-- They tried to buy 2076 shares of AKAM at $87.62 = $181,891.12
-- But they only had ~$65k cash
SELECT 
  'FOMO Master Trade Analysis' as analysis,
  2076 as shares_attempted,
  87.62 as akam_price,
  2076 * 87.62 as total_cost,
  65091 as cash_available,
  65091 - (2076 * 87.62) as shortfall,
  FLOOR(65091 / 87.62) as max_shares_affordable;
