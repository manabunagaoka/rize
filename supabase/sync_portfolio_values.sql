-- Sync Portfolio Values with Current Market Prices
-- This should be run periodically to keep database in sync with real-time prices
-- The leaderboard API calculates on-the-fly, but the tier system needs DB values

-- Step 1: Update current_value in user_investments based on latest market prices
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id
  AND ui.shares_owned > 0;

-- Step 2: Recalculate portfolio_value for all users
-- portfolio_value = available_tokens (cash) + sum of all holdings
UPDATE user_token_balances utb
SET 
  portfolio_value = utb.available_tokens + COALESCE(
    (SELECT SUM(current_value) 
     FROM user_investments 
     WHERE user_id = utb.user_id 
       AND shares_owned > 0),
    0
  );

-- Step 3: Update all_time_gain_loss (calculated AFTER portfolio_value)
UPDATE user_token_balances
SET all_time_gain_loss = portfolio_value - 1000000;

-- Step 4: Award tiers to current top 3
SELECT award_investor_tiers();

-- Step 5: Verify the results
SELECT 
  user_id,
  ai_nickname,
  available_tokens as cash,
  portfolio_value,
  all_time_gain_loss as profit,
  investor_tier
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY portfolio_value DESC;
