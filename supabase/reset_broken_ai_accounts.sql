-- Reset AI Investors with Negative Balances Back to $1M
-- Addresses over-leveraging bug where AI traded beyond available funds
-- Run this AFTER deploying the balance check fix in ai-trading/execute/route.ts

-- Affected AI Investors (as of debugging):
-- 1. Diamond Hands: -$2.1M loss, invested $2.8M on $1M account
-- 2. FOMO Master: -$1.3M loss, over-leveraged
-- 3. Hype Train: -$1M loss, over-leveraged

-- Step 1: Find the broken AI accounts (portfolio_value < 0 or all_time_gain_loss < -900000)
-- This query identifies AI with catastrophic losses indicating over-leveraging
SELECT 
  u.user_id,
  u.full_name,
  u.ai_nickname,
  utb.available_tokens,
  utb.total_invested,
  utb.portfolio_value,
  utb.all_time_gain_loss
FROM users u
JOIN user_token_balances utb ON u.user_id = utb.user_id
WHERE u.ai_status = 'active'
  AND (utb.portfolio_value < 0 OR utb.all_time_gain_loss < -900000)
ORDER BY utb.portfolio_value ASC;

-- Step 2: Delete all investments and transactions for broken AI accounts
-- This clears their trading history so they start fresh
DELETE FROM user_investments
WHERE user_id IN (
  SELECT u.user_id
  FROM users u
  JOIN user_token_balances utb ON u.user_id = utb.user_id
  WHERE u.ai_status = 'active'
    AND (utb.portfolio_value < 0 OR utb.all_time_gain_loss < -900000)
);

DELETE FROM investment_transactions
WHERE user_id IN (
  SELECT u.user_id
  FROM users u
  JOIN user_token_balances utb ON u.user_id = utb.user_id
  WHERE u.ai_status = 'active'
    AND (utb.portfolio_value < 0 OR utb.all_time_gain_loss < -900000)
);

-- Step 3: Reset their balances to starting conditions ($1M ManaBoodle tokens)
UPDATE user_token_balances
SET 
  available_tokens = 1000000,
  total_invested = 0,
  portfolio_value = 1000000,
  all_time_gain_loss = 0,
  updated_at = NOW()
WHERE user_id IN (
  SELECT u.user_id
  FROM users u
  JOIN user_token_balances utb ON u.user_id = utb.user_id
  WHERE u.ai_status = 'active'
    AND (utb.portfolio_value < 0 OR utb.all_time_gain_loss < -900000)
);

-- Step 4: Remove any tier badges from reset accounts (they need to earn them back)
UPDATE users
SET 
  investor_tier = NULL,
  investor_tier_earned_at = NULL,
  updated_at = NOW()
WHERE user_id IN (
  SELECT u.user_id
  FROM users u
  JOIN user_token_balances utb ON u.user_id = utb.user_id
  WHERE u.ai_status = 'active'
    AND (utb.portfolio_value < 0 OR utb.all_time_gain_loss < -900000)
);

-- Step 5: Verify the reset worked
SELECT 
  u.user_id,
  u.full_name,
  u.ai_nickname,
  u.investor_tier,
  utb.available_tokens,
  utb.total_invested,
  utb.portfolio_value,
  utb.all_time_gain_loss
FROM users u
JOIN user_token_balances utb ON u.user_id = utb.user_id
WHERE u.ai_status = 'active'
ORDER BY u.ai_nickname;

-- Expected Result:
-- All AI investors should have:
-- - available_tokens = 1000000
-- - total_invested = 0
-- - portfolio_value = 1000000
-- - all_time_gain_loss = 0
-- - investor_tier = NULL (for reset accounts)

-- Manual Alternative (if you want to target specific AI by nickname):
-- UPDATE user_token_balances
-- SET available_tokens = 1000000, total_invested = 0, portfolio_value = 1000000, all_time_gain_loss = 0
-- WHERE user_id IN (
--   SELECT user_id FROM users 
--   WHERE ai_nickname IN ('Diamond Hands', 'FOMO Master', 'Hype Train')
-- );
