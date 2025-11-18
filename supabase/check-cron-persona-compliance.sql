-- Check if the latest cron trades match AI personas
-- Run after each cron execution to verify behavior

-- Show each AI's trade with their persona constraint
SELECT 
  atl.ai_nickname,
  ai.ai_strategy,
  atl.decision_action,
  arp.ticker,
  arp.startup_name,
  atl.decision_shares,
  atl.execution_success,
  -- Check compliance
  CASE ai.ai_strategy
    WHEN 'SAAS_ONLY' THEN 
      CASE WHEN arp.ticker IN ('DBX', 'MSFT') OR atl.decision_action = 'HOLD' 
        THEN '✅ COMPLIANT' 
        ELSE '❌ VIOLATED: Non-SaaS' 
      END
    WHEN 'TECH_GIANTS' THEN 
      CASE WHEN arp.ticker IN ('GOOGL', 'MSFT', 'AAPL', 'AMZN') OR atl.decision_action = 'HOLD'
        THEN '✅ COMPLIANT' 
        ELSE '❌ VIOLATED: Not a tech giant' 
      END
    WHEN 'HOLD_FOREVER' THEN 
      CASE WHEN atl.decision_action != 'SELL' 
        THEN '✅ COMPLIANT' 
        ELSE '❌ VIOLATED: Sold' 
      END
    WHEN 'MOMENTUM' THEN '✅ N/A (no hard constraints)'
    WHEN 'VALUE' THEN '✅ N/A (no hard constraints)'
    WHEN 'CONTRARIAN' THEN '✅ N/A (no hard constraints)'
    WHEN 'YOLO' THEN '✅ N/A (no hard constraints)'
    WHEN 'FOMO' THEN '✅ N/A (no hard constraints)'
    WHEN 'HYPE' THEN '✅ N/A (no hard constraints)'
    WHEN 'STEADY' THEN '✅ N/A (no hard constraints)'
    ELSE '⚠️ UNKNOWN STRATEGY'
  END as persona_compliance,
  LEFT(atl.decision_reasoning, 100) as reasoning_preview
FROM ai_trading_logs atl
JOIN ai_investors ai ON atl.ai_nickname = ai.ai_nickname
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.triggered_by = 'cron'
  AND atl.execution_timestamp > NOW() - INTERVAL '10 minutes'
ORDER BY atl.execution_timestamp DESC;
