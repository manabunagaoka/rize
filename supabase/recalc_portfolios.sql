-- Recalculate portfolio values from actual holdings at current prices

-- Step 1: Update current_value in user_investments based on real prices
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id;

-- Step 2: Recalculate portfolio_value in user_token_balances
UPDATE user_token_balances utb
SET portfolio_value = COALESCE((
  SELECT SUM(current_value)
  FROM user_investments
  WHERE user_id = utb.user_id
    AND shares_owned > 0
), 0);

-- Step 3: Recalculate all_time_gain_loss (AFTER portfolio_value is correct)
UPDATE user_token_balances
SET all_time_gain_loss = (available_tokens + portfolio_value) - total_tokens;

-- Step 4: Verify the numbers make sense
SELECT 
  user_email,
  available_tokens,
  total_invested,
  portfolio_value,
  (available_tokens + portfolio_value) as total_value,
  all_time_gain_loss,
  ROUND((all_time_gain_loss / total_tokens * 100)::NUMERIC, 2) as gain_loss_pct
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC;

-- Step 5: Show holdings breakdown for Cloud Surfer (the problematic one)
SELECT 
  ui.pitch_id,
  pmd.current_price,
  ui.shares_owned,
  ui.avg_purchase_price,
  ui.current_value,
  ui.total_invested,
  (ui.current_value - ui.total_invested) as profit_loss
FROM user_investments ui
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE ui.user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_cloud@rize.manaboodle.com')
  AND ui.shares_owned > 0
ORDER BY ui.pitch_id;
