-- Manually recalculate tiers after price update
SELECT award_investor_tiers();

-- Verify tiers updated
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value as holdings,
  (available_tokens + portfolio_value) as total_value,
  investor_tier
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC
LIMIT 10;
