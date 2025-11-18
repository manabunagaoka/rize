-- Check if the cron trades at 00:41 UTC actually updated portfolios

-- 1. Check if Cloud Surfer now owns DBX shares
SELECT 
  'Cloud Surfer DBX Holdings' as check_item,
  ui.shares_owned,
  ui.total_invested,
  ui.last_trade_timestamp
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
WHERE utb.ai_nickname = 'Cloud Surfer'
  AND ui.pitch_id = 3; -- DBX = pitch_id 3

-- 2. Check recent trade history for all 9 successful trades
SELECT 
  th.user_id,
  utb.ai_nickname,
  th.pitch_id,
  arp.ticker,
  th.trade_type,
  th.shares,
  th.price_per_share,
  th.total_amount,
  th.timestamp
FROM trade_history th
JOIN user_token_balances utb ON th.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON th.pitch_id = arp.pitch_id
WHERE utb.is_ai_investor = true
  AND th.timestamp > '2025-11-18 00:40:00'
ORDER BY th.timestamp DESC;

-- 3. Check if token balances were updated (should have less available_tokens after buys)
SELECT 
  ai_nickname,
  available_tokens,
  total_tokens,
  updated_at
FROM user_token_balances
WHERE is_ai_investor = true
  AND ai_nickname IN ('Cloud Surfer', 'YOLO Kid', 'Hype Train', 'The Oracle', 'Diamond Hands', 'Silicon Brain', 'Steady Eddie', 'The Boomer', 'The Contrarian')
ORDER BY ai_nickname;
