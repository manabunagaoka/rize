-- Create the trigger wrapper function (was missing!)
CREATE OR REPLACE FUNCTION trigger_award_tiers()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_investor_tiers();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Now recreate triggers
DROP TRIGGER IF EXISTS after_price_update ON pitch_market_data;
DROP TRIGGER IF EXISTS after_portfolio_update ON user_token_balances;

-- Trigger when market prices change
CREATE TRIGGER after_price_update
  AFTER UPDATE OF current_price ON pitch_market_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- Trigger when portfolio changes (trades happen)
CREATE TRIGGER after_portfolio_update
  AFTER UPDATE OF available_tokens ON user_token_balances
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- Test it works
SELECT award_investor_tiers();

-- Verify
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
