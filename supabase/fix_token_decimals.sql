-- Fix: Change available_tokens from BIGINT to NUMERIC to support decimal values
-- Stock prices have decimals, so balances must too!

-- Step 1: Drop triggers and views that depend on these columns
DROP TRIGGER IF EXISTS after_portfolio_update ON user_token_balances;
DROP VIEW IF EXISTS investment_leaderboard CASCADE;
DROP VIEW IF EXISTS company_rankings CASCADE;

-- Step 2: Change column types to support decimals
ALTER TABLE user_token_balances
ALTER COLUMN available_tokens TYPE NUMERIC(20, 2),
ALTER COLUMN total_invested TYPE NUMERIC(20, 2),
ALTER COLUMN portfolio_value TYPE NUMERIC(20, 2),
ALTER COLUMN all_time_gain_loss TYPE NUMERIC(20, 2);

ALTER TABLE user_investments
ALTER COLUMN shares_owned TYPE NUMERIC(20, 6),
ALTER COLUMN avg_purchase_price TYPE NUMERIC(20, 2),
ALTER COLUMN total_invested TYPE NUMERIC(20, 2),
ALTER COLUMN current_value TYPE NUMERIC(20, 2);

ALTER TABLE investment_transactions
ALTER COLUMN shares TYPE NUMERIC(20, 6),
ALTER COLUMN price_per_share TYPE NUMERIC(20, 2),
ALTER COLUMN total_amount TYPE NUMERIC(20, 2),
ALTER COLUMN balance_before TYPE NUMERIC(20, 2),
ALTER COLUMN balance_after TYPE NUMERIC(20, 2);

-- Step 3: Recreate the views
CREATE OR REPLACE VIEW investment_leaderboard AS
SELECT 
  utb.user_id,
  COALESCE(utb.ai_nickname, utb.user_email) as display_name,
  utb.ai_emoji,
  utb.ai_catchphrase,
  utb.is_ai_investor,
  utb.total_tokens,
  utb.available_tokens,
  utb.portfolio_value,
  utb.all_time_gain_loss,
  CASE 
    WHEN utb.total_invested > 0 
    THEN ROUND((utb.all_time_gain_loss::DECIMAL / utb.total_invested::DECIMAL) * 100, 2)
    ELSE 0
  END as gain_loss_percentage,
  COUNT(DISTINCT ui.pitch_id) as companies_invested,
  ROW_NUMBER() OVER (ORDER BY (utb.available_tokens + utb.portfolio_value) DESC) as rank
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id AND ui.shares_owned > 0
GROUP BY utb.user_id, utb.user_email, utb.ai_nickname, utb.ai_emoji, utb.ai_catchphrase, 
         utb.is_ai_investor, utb.total_tokens, utb.available_tokens, utb.portfolio_value, 
         utb.all_time_gain_loss, utb.total_invested;

-- Step 4: Recreate the trigger for tier awards
CREATE TRIGGER after_portfolio_update
  AFTER UPDATE OF portfolio_value ON user_token_balances
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- Verify
SELECT user_email, available_tokens, total_invested, portfolio_value
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY portfolio_value DESC;
