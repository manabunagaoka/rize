-- Reset AI investors to starting state (1M MTK, no trades)
-- Use this for testing the AI trading system

-- Delete all AI investor transactions
DELETE FROM investment_transactions
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- Delete all AI investor investments  
DELETE FROM user_investments
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- Reset AI investor balances to 1M MTK
UPDATE user_token_balances
SET 
  available_tokens = 1000000,
  total_invested = 0,
  portfolio_value = 0,
  all_time_gain_loss = 0,
  updated_at = NOW()
WHERE is_ai_investor = true;

-- Verify the reset
SELECT 
  ai_nickname,
  ai_strategy,
  available_tokens,
  total_invested,
  portfolio_value
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY user_id;
