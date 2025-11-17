-- Reset all AI investors to 1M MTK starting balance
-- Run this before testing new personas

-- 1. Delete all AI investment transactions
DELETE FROM investment_transactions
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 2. Delete all AI holdings
DELETE FROM user_investments
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 3. Reset AI balances to 1M MTK
UPDATE user_token_balances
SET 
  available_tokens = 1000000,
  total_tokens = 1000000,
  total_invested = 0,
  updated_at = NOW()
WHERE is_ai_investor = true;

-- 4. Verify reset
SELECT 
  ai_nickname,
  available_tokens as cash,
  total_invested,
  (SELECT COUNT(*) FROM user_investments WHERE user_investments.user_id = user_token_balances.user_id) as num_holdings
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY ai_nickname;
