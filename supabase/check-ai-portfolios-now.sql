-- Check if AI investors' portfolios show the new DBX/AKAM holdings

-- 1. Show Cloud Surfer's current portfolio (should have DBX now)
SELECT 
  'Cloud Surfer Portfolio' as investor,
  arp.ticker,
  ui.shares_owned,
  ui.avg_purchase_price,
  ui.current_value,
  ui.updated_at as last_updated
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON ui.pitch_id = arp.pitch_id
WHERE utb.ai_nickname = 'Cloud Surfer'
  AND ui.shares_owned > 0
ORDER BY ui.current_value DESC;

-- 2. Check all AI investors' balances (should show reduced cash after buys)
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value,
  available_tokens + portfolio_value as total_value,
  updated_at as balance_updated_at
FROM user_token_balances
WHERE is_ai_investor = true
  AND ai_nickname IN (
    'Cloud Surfer', 'YOLO Kid', 'Hype Train', 'The Oracle', 
    'Diamond Hands', 'Silicon Brain', 'Steady Eddie', 
    'The Boomer', 'The Contrarian'
  )
ORDER BY ai_nickname;

-- 3. Count holdings by ticker (should show 8 AIs with DBX, 2 with AKAM)
SELECT 
  arp.ticker,
  COUNT(DISTINCT utb.ai_nickname) as ai_owners,
  SUM(ui.shares_owned) as total_shares
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
LEFT JOIN ai_readable_pitches arp ON ui.pitch_id = arp.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
GROUP BY arp.ticker
ORDER BY ai_owners DESC;
