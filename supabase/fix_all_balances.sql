-- Check ALL AI investors' cash vs holdings to find the bug

SELECT 
  utb.user_email,
  utb.available_tokens as cash,
  utb.total_invested as cost_basis,
  utb.portfolio_value as current_holdings_value,
  (utb.available_tokens + utb.total_invested) as cash_plus_cost,
  utb.total_tokens as starting_balance,
  -- This should equal starting_balance if no errors
  (utb.available_tokens + utb.total_invested) - utb.total_tokens as discrepancy
FROM user_token_balances utb
WHERE utb.is_ai_investor = true
ORDER BY discrepancy DESC;

-- Show detailed holdings for everyone
SELECT 
  utb.user_email,
  ui.pitch_id,
  ui.shares_owned,
  ui.avg_purchase_price,
  ui.total_invested as cost,
  ui.current_value,
  pmd.current_price
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
ORDER BY utb.user_email, ui.pitch_id;

-- The issue: available_tokens should be total_tokens - total_invested
-- Let's recalculate it correctly
UPDATE user_token_balances
SET available_tokens = total_tokens - total_invested
WHERE is_ai_investor = true;

-- Verify after fix
SELECT 
  user_email,
  total_tokens as started_with,
  total_invested as spent,
  available_tokens as should_have_cash,
  portfolio_value as holdings_value,
  (available_tokens + portfolio_value) as total_now
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC;
