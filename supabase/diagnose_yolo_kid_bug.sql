-- ========================================
-- YOLO KID BUG DIAGNOSTIC QUERIES
-- Date: November 18, 2025
-- ========================================

-- Query 1: Get YOLO Kid's exact decision from this morning's cron
SELECT 
  execution_timestamp AT TIME ZONE 'America/New_York' as est_time,
  ai_nickname,
  decision_action,
  decision_shares,
  decision_pitch_id,
  decision_reasoning
FROM ai_trading_logs
WHERE ai_nickname = 'YOLO Kid'
AND triggered_by = 'cron'
AND execution_timestamp >= '2025-11-18 14:20:00+00'
ORDER BY execution_timestamp DESC
LIMIT 1;

-- Query 2: Check YOLO Kid's current balance
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value,
  available_tokens + portfolio_value as total_value,
  ROUND((portfolio_value / NULLIF(available_tokens + portfolio_value, 0) * 100), 1) as portfolio_pct
FROM user_token_balances
WHERE ai_nickname = 'YOLO Kid';

-- Query 3: Check YOLO Kid's transaction history (last 5)
SELECT 
  timestamp AT TIME ZONE 'America/New_York' as est_time,
  transaction_type,
  shares,
  price_per_share,
  total_amount,
  balance_before,
  balance_after
FROM investment_transactions
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE ai_nickname = 'YOLO Kid')
ORDER BY timestamp DESC
LIMIT 5;

-- Query 4: Check YOLO Kid's current holdings
SELECT 
  ui.pitch_id,
  arp.ticker,
  arp.company_name,
  ui.shares_owned,
  ui.avg_purchase_price,
  arp.current_price,
  ui.current_value,
  ROUND(((arp.current_price - ui.avg_purchase_price) / ui.avg_purchase_price * 100), 2) as gain_loss_pct
FROM user_investments ui
JOIN ai_readable_pitches arp ON ui.pitch_id = arp.pitch_id
WHERE ui.user_id = (SELECT user_id FROM user_token_balances WHERE ai_nickname = 'YOLO Kid')
ORDER BY ui.current_value DESC;

-- Query 5: Compare YOLO Kid with other AIs (portfolio allocation)
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value,
  available_tokens + portfolio_value as total,
  ROUND((available_tokens / NULLIF(available_tokens + portfolio_value, 0) * 100), 1) as cash_pct,
  ROUND((portfolio_value / NULLIF(available_tokens + portfolio_value, 0) * 100), 1) as portfolio_pct
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY total DESC;

-- Query 6: Check if YOLO Kid has had null shares issues before
SELECT 
  execution_timestamp AT TIME ZONE 'America/New_York' as est_time,
  triggered_by,
  decision_action,
  decision_shares,
  LEFT(decision_reasoning, 100) as reasoning
FROM ai_trading_logs
WHERE ai_nickname = 'YOLO Kid'
AND (decision_shares IS NULL OR decision_shares = 0)
ORDER BY execution_timestamp DESC
LIMIT 10;

-- ========================================
-- WHAT TO LOOK FOR:
-- ========================================

/*
In Query 1 (gpt_raw_response):
- Check if GPT actually returned "shares": null
- Or if it returned a number but it got lost in parsing
- Look at the exact JSON structure

In Query 2 (current balance):
- YOLO Kid should have ~80-95% in portfolio
- If cash is $9, something definitely went wrong

In Query 3 (transaction history):
- Look for failed BUY transactions
- Check if there was a recent trade that depleted cash

In Query 4 (current holdings):
- Should show ONE major position (YOLO strategy)
- If diversified, YOLO Kid isn't YOLOing

In Query 5 (comparison):
- YOLO Kid should have lowest cash % (highest risk)
- If similar to others, strategy isn't working

In Query 6 (historical null shares):
- If this happens often, it's a systematic issue
- If rare, might be GPT hallucination
*/
