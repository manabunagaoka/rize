-- Debug Trading Not Showing Issue
-- Run this to see current state of investment data

-- 1. Check all user_investments for human users (non-AI)
SELECT 
  'USER INVESTMENTS (Human Users)' as section,
  user_id,
  pitch_id,
  shares_owned,
  total_invested,
  created_at,
  updated_at
FROM user_investments
WHERE user_id NOT LIKE 'ai_%'
ORDER BY updated_at DESC
LIMIT 20;

-- 2. Check recent transactions
SELECT 
  'RECENT TRANSACTIONS' as section,
  user_id,
  pitch_id,
  transaction_type,
  shares,
  price_per_share,
  total_amount,
  timestamp
FROM investment_transactions
WHERE user_id NOT LIKE 'ai_%'
ORDER BY timestamp DESC
LIMIT 20;

-- 3. Check user token balances for human users
SELECT 
  'USER BALANCES' as section,
  user_id,
  user_email,
  available_tokens,
  portfolio_value,
  total_invested,
  updated_at
FROM user_token_balances
WHERE is_ai_investor = false
ORDER BY updated_at DESC;

-- 4. Check for duplicate investment records
SELECT 
  'DUPLICATE CHECK' as section,
  user_id,
  pitch_id,
  COUNT(*) as record_count
FROM user_investments
GROUP BY user_id, pitch_id
HAVING COUNT(*) > 1;

-- 5. Check market data state
SELECT 
  'MARKET DATA' as section,
  pitch_id,
  current_price,
  total_volume,
  total_shares_issued,
  unique_investors,
  updated_at
FROM pitch_market_data
ORDER BY pitch_id;
