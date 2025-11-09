-- COMPLETE HISTORY RESET FOR AI INVESTORS
-- ⚠️ WARNING: This PERMANENTLY deletes all AI trading history
-- Use this when you want a completely clean slate for testing

-- WHAT THIS DOES:
-- 1. Deletes ALL transaction history for AI investors
-- 2. Deletes ALL trading logs for AI investors  
-- 3. Clears ALL holdings (investments)
-- 4. Resets balances to $1,000,000
-- 5. Does NOT touch human users (ManaMana, etc.)
-- 6. Does NOT touch AI profiles (keeps personas, strategies, etc.)

-- WHEN TO USE THIS:
-- - Testing revealed bugs and data is corrupted
-- - Want to start completely fresh with no history
-- - Old transactions are no longer relevant
-- - Need clean baseline for new testing phase

-- ============================================
-- BACKUP FIRST (Optional but recommended)
-- ============================================

-- Create timestamped backup tables
CREATE TABLE IF NOT EXISTS ai_full_backup_nov9 AS
SELECT * FROM user_token_balances WHERE is_ai_investor = true;

CREATE TABLE IF NOT EXISTS ai_transactions_full_backup_nov9 AS
SELECT it.* FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
WHERE utb.is_ai_investor = true;

CREATE TABLE IF NOT EXISTS ai_investments_full_backup_nov9 AS
SELECT ui.* FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
WHERE utb.is_ai_investor = true;

CREATE TABLE IF NOT EXISTS ai_logs_full_backup_nov9 AS
SELECT atl.* FROM ai_trading_logs atl
JOIN user_token_balances utb ON atl.user_id = utb.user_id
WHERE utb.is_ai_investor = true;

-- ============================================
-- COMPLETE WIPE - NO GOING BACK AFTER THIS
-- ============================================

-- 1. Delete all AI trading logs
DELETE FROM ai_trading_logs
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 2. Delete all AI investment transactions
DELETE FROM investment_transactions
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 3. Delete all AI holdings/investments
DELETE FROM user_investments
WHERE user_id IN (
  SELECT user_id FROM user_token_balances WHERE is_ai_investor = true
);

-- 4. Reset AI balances to starting state
UPDATE user_token_balances
SET 
  available_tokens = 1000000,
  total_tokens = 1000000,
  portfolio_value = 0,
  total_invested = 0,
  all_time_gain_loss = 0,
  updated_at = NOW()
WHERE is_ai_investor = true;

-- ============================================
-- VERIFY CLEAN STATE
-- ============================================

-- Should show all AIs with $1M cash, $0 portfolio, $0 invested
SELECT 
  ai_nickname,
  ai_strategy,
  is_active,
  available_tokens as cash,
  portfolio_value,
  total_invested,
  (SELECT COUNT(*) FROM user_investments WHERE user_id = utb.user_id) as holdings_count,
  (SELECT COUNT(*) FROM investment_transactions WHERE user_id = utb.user_id) as transaction_count,
  (SELECT COUNT(*) FROM ai_trading_logs WHERE user_id = utb.user_id) as log_count
FROM user_token_balances utb
WHERE is_ai_investor = true
ORDER BY ai_nickname;

-- Expected results:
-- - cash: 1000000.00 for all
-- - portfolio_value: 0 for all
-- - total_invested: 0 for all
-- - holdings_count: 0 for all
-- - transaction_count: 0 for all
-- - log_count: 0 for all

-- ============================================
-- NOTES
-- ============================================

-- ✅ SAFE: Only affects rows where is_ai_investor = true
-- ✅ SAFE: Human users (ManaMana, etc.) completely untouched
-- ✅ PRESERVES: AI profiles, personas, strategies, nicknames
-- ⚠️ DELETES: All transaction history, trading logs, holdings
-- ⚠️ PERMANENT: Cannot undo without restoring from backup tables

-- To restore from backup (if needed):
-- INSERT INTO investment_transactions SELECT * FROM ai_transactions_full_backup_nov9;
-- INSERT INTO user_investments SELECT * FROM ai_investments_full_backup_nov9;
-- INSERT INTO ai_trading_logs SELECT * FROM ai_logs_full_backup_nov9;
-- UPDATE user_token_balances SET ... FROM ai_full_backup_nov9 WHERE ...;
