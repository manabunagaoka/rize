-- RESET ALL AI INVESTORS TO CLEAN STATE
-- Preserves transaction history for debugging
-- Run this to start fresh with controlled testing

-- 1. Archive current state for debugging (optional)
CREATE TABLE IF NOT EXISTS ai_investor_backup_nov9 AS
SELECT * FROM user_token_balances WHERE is_ai_investor = true;

CREATE TABLE IF NOT EXISTS ai_transactions_backup_nov9 AS
SELECT it.* FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true;

CREATE TABLE IF NOT EXISTS ai_investments_backup_nov9 AS
SELECT ui.* FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
WHERE utb.is_ai_investor = true;

-- 2. Clear all AI holdings
DELETE FROM user_investments
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 3. Reset AI balances to $1,000,000
UPDATE user_token_balances
SET 
  available_tokens = 1000000,
  total_tokens = 1000000,
  total_invested = 0,
  updated_at = NOW()
WHERE is_ai_investor = true;

-- 4. Optionally: Clear transaction history (comment out if you want to keep)
-- DELETE FROM investment_transactions
-- WHERE user_id IN (
--   SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
-- );

-- 5. Verify reset
SELECT 
  ai_nickname,
  ai_strategy,
  available_tokens as cash,
  total_tokens as portfolio_value,
  total_invested
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY ai_nickname;

-- Expected: All should have $1M cash, $1M total, $0 invested
