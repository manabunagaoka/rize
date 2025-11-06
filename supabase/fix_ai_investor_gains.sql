-- Fix AI investors' unrealistic gains by adjusting share counts
-- They bought shares at artificially low prices (e.g., META at $385)
-- Adjust their holdings to reflect what they could have bought at current real prices

-- Step 1: Show BEFORE state - AI investors with unrealistic gains
SELECT 
  'BEFORE ADJUSTMENT' as status,
  utb.username,
  ui.pitch_id,
  ui.shares_owned as current_shares,
  ui.total_invested as amount_spent,
  ui.avg_purchase_price as price_paid,
  pmd.current_price as real_current_price,
  ROUND(ui.total_invested / pmd.current_price, 2) as should_have_shares,
  ROUND(ui.shares_owned * pmd.current_price, 2) as current_value
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.avg_purchase_price < pmd.current_price * 0.9  -- Flag purchases >10% below current price
ORDER BY utb.username, ui.pitch_id;

-- Step 2: Adjust share counts for all AI investors
-- Formula: adjusted_shares = total_invested / current_real_price
-- This gives them credit for capital invested but at fair market prices

UPDATE user_investments ui
SET 
  shares_owned = ROUND(ui.total_invested / pmd.current_price, 6),
  avg_purchase_price = pmd.current_price,
  current_value = ROUND(ui.total_invested / pmd.current_price * pmd.current_price, 2),
  unrealized_gain_loss = 0,  -- Reset to 0 since we're repricing at current market
  updated_at = NOW()
FROM pitch_market_data pmd, user_token_balances utb
WHERE ui.pitch_id = pmd.pitch_id
  AND ui.user_id = utb.user_id
  AND utb.is_ai_investor = true
  AND ui.avg_purchase_price < pmd.current_price * 0.9;  -- Only adjust artificially cheap purchases

-- Step 3: Show AFTER state - verify adjustments
SELECT 
  'AFTER ADJUSTMENT' as status,
  utb.username,
  ui.pitch_id,
  ui.shares_owned as adjusted_shares,
  ui.total_invested as amount_spent,
  ui.avg_purchase_price as adjusted_price,
  pmd.current_price as real_current_price,
  ROUND(ui.shares_owned * pmd.current_price, 2) as current_value
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE utb.is_ai_investor = true
ORDER BY utb.username, ui.pitch_id;

-- Step 4: Summary - show portfolio changes
SELECT 
  utb.username,
  utb.available_tokens as cash,
  COUNT(ui.pitch_id) as holdings_count,
  SUM(ui.shares_owned * pmd.current_price) as holdings_value,
  utb.available_tokens + SUM(ui.shares_owned * pmd.current_price) as total_portfolio,
  ROUND((utb.available_tokens + SUM(ui.shares_owned * pmd.current_price) - 1000000) / 1000000 * 100, 2) as growth_percent
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id
LEFT JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE utb.is_ai_investor = true
GROUP BY utb.user_id, utb.username, utb.available_tokens
ORDER BY total_portfolio DESC;
