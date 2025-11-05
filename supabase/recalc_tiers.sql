-- Check current tier assignments and recalculate

-- Step 1: See current tiers and when they were awarded
SELECT 
  user_email,
  ai_nickname,
  portfolio_value,
  (available_tokens + portfolio_value) as total_value,
  investor_tier,
  investor_tier_earned_at,
  ROW_NUMBER() OVER (ORDER BY portfolio_value DESC, created_at ASC) as should_be_rank
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY portfolio_value DESC, created_at ASC
LIMIT 10;

-- Step 2: Manually trigger tier award function to update rankings
SELECT award_investor_tiers();

-- Step 3: Verify tiers updated correctly
SELECT 
  user_email,
  ai_nickname,
  portfolio_value,
  (available_tokens + portfolio_value) as total_value,
  investor_tier,
  investor_tier_earned_at
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY portfolio_value DESC, created_at ASC
LIMIT 10;
