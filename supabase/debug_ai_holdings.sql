-- Debug: Check what AI investors are holding

-- 1. Check AI investor balances
SELECT 
  ai_nickname,
  ai_strategy,
  available_tokens,
  total_invested,
  portfolio_value
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY user_id;

-- 2. Check AI investor holdings
SELECT 
  utb.ai_nickname,
  ui.pitch_id,
  ui.shares_owned,
  ui.total_invested,
  ui.current_value
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
WHERE utb.is_ai_investor = true
ORDER BY utb.ai_nickname, ui.pitch_id;

-- 3. Check what pitches exist in market data
SELECT 
  pitch_id,
  current_price,
  total_volume,
  unique_investors
FROM pitch_market_data
ORDER BY pitch_id;

-- 4. Check recent AI trading activity
SELECT 
  utb.ai_nickname,
  it.transaction_type,
  it.pitch_id,
  it.shares,
  it.total_amount,
  it.timestamp
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true
ORDER BY it.timestamp DESC
LIMIT 20;
