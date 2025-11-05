-- Check what the UI is showing vs what tiers use

SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value as holdings_only,
  (available_tokens + portfolio_value) as total_value_cash_plus_holdings,
  investor_tier,
  ROW_NUMBER() OVER (ORDER BY portfolio_value DESC, created_at ASC) as rank_by_holdings,
  ROW_NUMBER() OVER (ORDER BY (available_tokens + portfolio_value) DESC, created_at ASC) as rank_by_total
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC
LIMIT 10;
