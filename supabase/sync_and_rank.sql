-- Fix: Recalculate portfolio values from current market prices, THEN update tiers

-- Step 1: Update current_value in all holdings
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id
  AND ui.shares_owned > 0;

-- Step 2: Recalculate portfolio_value in user_token_balances
UPDATE user_token_balances utb
SET portfolio_value = COALESCE((
  SELECT SUM(current_value)
  FROM user_investments
  WHERE user_id = utb.user_id AND shares_owned > 0
), 0);

-- Step 3: Recalculate all_time_gain_loss
UPDATE user_token_balances
SET all_time_gain_loss = (available_tokens + portfolio_value) - total_tokens;

-- Step 4: NOW award tiers based on fresh portfolio values
SELECT award_investor_tiers();

-- Step 5: Verify final rankings
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value as holdings,
  (available_tokens + portfolio_value) as total_value,
  investor_tier,
  all_time_gain_loss as gain_loss,
  ROUND((all_time_gain_loss / total_tokens * 100)::NUMERIC, 2) as gain_pct
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC
LIMIT 10;
