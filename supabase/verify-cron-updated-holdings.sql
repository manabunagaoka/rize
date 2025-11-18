-- Verify that the cron trades INCREASED the existing holdings

-- Show investment updates around the cron time (00:41 UTC)
SELECT 
  utb.ai_nickname,
  arp.ticker,
  ui.shares_owned as current_shares,
  ui.total_invested,
  ui.updated_at,
  -- Check if updated during cron window
  CASE 
    WHEN ui.updated_at > '2025-11-18 00:40:00' AND ui.updated_at < '2025-11-18 00:45:00'
    THEN '✅ Updated by cron'
    ELSE '❌ Not updated recently'
  END as update_status
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON ui.pitch_id = arp.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
  AND arp.ticker IN ('DBX', 'AKAM')
ORDER BY ui.updated_at DESC;

-- Compare: Show which AIs bought DBX/AKAM in the cron run
SELECT 
  'Expected from cron logs' as source,
  atl.ai_nickname,
  arp.ticker,
  atl.decision_shares as shares_bought,
  atl.execution_success
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.triggered_by = 'cron'
  AND atl.execution_timestamp > '2025-11-18 00:40:00'
ORDER BY atl.ai_nickname;
