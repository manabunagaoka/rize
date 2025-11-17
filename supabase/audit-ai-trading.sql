-- Comprehensive AI Trading Audit Report
-- Checks if AIs traded on schedule and followed their personas

-- ==============================================
-- 1. TODAY'S CRON EXECUTION SUMMARY
-- ==============================================
-- Expected: 2 runs at 9:30am EST and 3:30pm EST (2:30pm and 8:30pm UTC)
SELECT 
  DATE_TRUNC('hour', execution_timestamp) as trade_hour,
  TO_CHAR(execution_timestamp, 'HH24:MI TZ') as exact_time,
  COUNT(DISTINCT ai_nickname) as ais_traded,
  COUNT(*) as total_decisions,
  COUNT(CASE WHEN decision_action = 'BUY' THEN 1 END) as buys,
  COUNT(CASE WHEN decision_action = 'SELL' THEN 1 END) as sells,
  COUNT(CASE WHEN decision_action = 'HOLD' THEN 1 END) as holds
FROM ai_trading_logs
WHERE DATE(execution_timestamp) = CURRENT_DATE
  AND triggered_by = 'cron'
GROUP BY DATE_TRUNC('hour', execution_timestamp), TO_CHAR(execution_timestamp, 'HH24:MI TZ')
ORDER BY trade_hour;

-- ==============================================
-- 2. PERSONA COMPLIANCE CHECK
-- ==============================================

-- Cloud Surfer (SAAS_ONLY) - Should ONLY buy SaaS companies
SELECT 
  'Cloud Surfer' as investor,
  'SAAS_ONLY: Should only buy DBX, MSFT' as rule,
  CASE 
    WHEN COUNT(CASE WHEN arp.ticker NOT IN ('DBX', 'MSFT') THEN 1 END) = 0 THEN '✅ COMPLIANT'
    ELSE '❌ VIOLATED: Bought non-SaaS'
  END as compliance,
  STRING_AGG(DISTINCT arp.ticker, ', ') as bought_tickers
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'Cloud Surfer'
  AND atl.decision_action = 'BUY'
  AND DATE(atl.execution_timestamp) = CURRENT_DATE

UNION ALL

-- Diamond Hands (HOLD_FOREVER) - Should NEVER sell
SELECT 
  'Diamond Hands',
  'HOLD_FOREVER: Should NEVER sell',
  CASE 
    WHEN COUNT(CASE WHEN decision_action = 'SELL' THEN 1 END) = 0 THEN '✅ COMPLIANT'
    ELSE '❌ VIOLATED: Sold ' || COUNT(CASE WHEN decision_action = 'SELL' THEN 1 END) || ' times'
  END,
  'N/A'
FROM ai_trading_logs
WHERE ai_nickname = 'Diamond Hands'
  AND DATE(execution_timestamp) = CURRENT_DATE

UNION ALL

-- Silicon Brain (TECH_ONLY) - Should ONLY buy tech stocks
SELECT 
  'Silicon Brain' as investor,
  'TECH_ONLY: Should only buy META, MSFT, DBX, AKAM, RDDT' as rule,
  CASE 
    WHEN COUNT(CASE WHEN arp.ticker NOT IN ('META', 'MSFT', 'DBX', 'AKAM', 'RDDT') THEN 1 END) = 0 THEN '✅ COMPLIANT'
    ELSE '❌ VIOLATED: Bought non-tech'
  END as compliance,
  STRING_AGG(DISTINCT arp.ticker, ', ') as bought_tickers
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'Silicon Brain'
  AND atl.decision_action = 'BUY'
  AND DATE(atl.execution_timestamp) = CURRENT_DATE

UNION ALL

-- FOMO Master (MOMENTUM) - Should buy stocks rising >2%
SELECT 
  'FOMO Master' as investor,
  'MOMENTUM: Should buy stocks rising >2%, avoid falling >2%' as rule,
  CASE 
    WHEN COUNT(CASE WHEN decision_action = 'BUY' AND arp.price_change_24h < 2 THEN 1 END) = 0 THEN '✅ COMPLIANT'
    WHEN COUNT(CASE WHEN decision_action = 'BUY' AND arp.price_change_24h < 2 THEN 1 END) > 0 THEN '⚠️ WEAK: Bought flat/falling stocks'
    ELSE '✅ COMPLIANT'
  END as compliance,
  STRING_AGG(DISTINCT arp.ticker || ' (' || arp.price_change_24h || '%)', ', ') as bought_tickers
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'FOMO Master'
  AND atl.decision_action = 'BUY'
  AND DATE(atl.execution_timestamp) = CURRENT_DATE

UNION ALL

-- The Contrarian - Should ONLY buy stocks falling or flat (<2%)
SELECT 
  'The Contrarian' as investor,
  'CONTRARIAN: Should NEVER buy stocks rising >2%' as rule,
  CASE 
    WHEN COUNT(CASE WHEN decision_action = 'BUY' AND arp.price_change_24h > 2 THEN 1 END) = 0 THEN '✅ COMPLIANT'
    ELSE '❌ VIOLATED: Bought rising stocks'
  END as compliance,
  STRING_AGG(DISTINCT arp.ticker || ' (' || arp.price_change_24h || '%)', ', ') as bought_tickers
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'The Contrarian'
  AND atl.decision_action = 'BUY'
  AND DATE(atl.execution_timestamp) = CURRENT_DATE

UNION ALL

-- YOLO Kid (ALL_IN) - Should use 80-95% of cash
SELECT 
  'YOLO Kid' as investor,
  'ALL_IN: Should invest 80-95% per trade' as rule,
  CASE 
    WHEN AVG((cash_before - cash_after) / NULLIF(cash_before, 0) * 100) BETWEEN 75 AND 100 THEN '✅ COMPLIANT'
    WHEN AVG((cash_before - cash_after) / NULLIF(cash_before, 0) * 100) < 75 THEN '❌ TOO CAUTIOUS: Only ' || ROUND(AVG((cash_before - cash_after) / NULLIF(cash_before, 0) * 100), 1) || '%'
    ELSE '⚠️ CHECK'
  END as compliance,
  ROUND(AVG((cash_before - cash_after) / NULLIF(cash_before, 0) * 100), 1)::TEXT || '% invested' as bought_tickers
FROM ai_trading_logs
WHERE ai_nickname = 'YOLO Kid'
  AND decision_action = 'BUY'
  AND DATE(execution_timestamp) = CURRENT_DATE
  AND cash_before > 0

UNION ALL

-- The Boomer (CONSERVATIVE) - Should only buy proven companies (META, MSFT)
SELECT 
  'The Boomer' as investor,
  'CONSERVATIVE: Prefers proven giants (META, MSFT, BKNG)' as rule,
  CASE 
    WHEN COUNT(CASE WHEN arp.ticker NOT IN ('META', 'MSFT', 'BKNG') THEN 1 END) = 0 THEN '✅ COMPLIANT'
    ELSE '⚠️ RISKY: Bought startups'
  END as compliance,
  STRING_AGG(DISTINCT arp.ticker, ', ') as bought_tickers
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE atl.ai_nickname = 'The Boomer'
  AND atl.decision_action = 'BUY'
  AND DATE(atl.execution_timestamp) = CURRENT_DATE;

-- ==============================================
-- 3. INDIVIDUAL AI ACTIVITY TODAY
-- ==============================================
SELECT 
  atl.ai_nickname,
  utb.ai_strategy,
  COUNT(*) as decisions_made,
  COUNT(CASE WHEN decision_action = 'BUY' THEN 1 END) as buys,
  COUNT(CASE WHEN decision_action = 'SELL' THEN 1 END) as sells,
  COUNT(CASE WHEN decision_action = 'HOLD' THEN 1 END) as holds,
  STRING_AGG(DISTINCT arp.ticker, ', ' ORDER BY arp.ticker) as tickers_bought
FROM ai_trading_logs atl
LEFT JOIN user_token_balances utb ON atl.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id AND atl.decision_action = 'BUY'
WHERE DATE(atl.execution_timestamp) = CURRENT_DATE
  AND atl.triggered_by = 'cron'
GROUP BY atl.ai_nickname, utb.ai_strategy
ORDER BY atl.ai_nickname;

-- ==============================================
-- 4. MISSED EXECUTIONS (Expected 10 AIs per run)
-- ==============================================
SELECT 
  utb.ai_nickname,
  utb.is_active,
  COALESCE(COUNT(atl.id), 0) as trades_today,
  CASE 
    WHEN utb.is_active = true AND COALESCE(COUNT(atl.id), 0) < 2 THEN '⚠️ MISSING TRADES'
    WHEN utb.is_active = false THEN '🔴 INACTIVE'
    ELSE '✅ OK'
  END as status
FROM user_token_balances utb
LEFT JOIN ai_trading_logs atl ON utb.user_id = atl.user_id 
  AND DATE(atl.execution_timestamp) = CURRENT_DATE
  AND atl.triggered_by = 'cron'
WHERE utb.is_ai_investor = true
GROUP BY utb.ai_nickname, utb.is_active
ORDER BY status DESC, utb.ai_nickname;

-- ==============================================
-- 5. DETAILED TRADE LOG WITH REASONING
-- ==============================================
SELECT 
  TO_CHAR(atl.execution_timestamp, 'HH24:MI') as time,
  atl.ai_nickname,
  atl.decision_action,
  arp.company_name,
  arp.ticker,
  arp.price_change_24h as momentum,
  atl.decision_shares,
  ROUND((atl.cash_before - atl.cash_after)::numeric, 0) as spent,
  LEFT(atl.decision_reasoning, 100) || '...' as reasoning_preview
FROM ai_trading_logs atl
LEFT JOIN ai_readable_pitches arp ON atl.decision_pitch_id = arp.pitch_id
WHERE DATE(atl.execution_timestamp) = CURRENT_DATE
  AND atl.triggered_by = 'cron'
ORDER BY atl.execution_timestamp DESC, atl.ai_nickname;
