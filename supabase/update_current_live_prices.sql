-- Update with CURRENT LIVE prices (Nov 5, 2025)
UPDATE pitch_market_data SET current_price = 627.32, updated_at = NOW() WHERE pitch_id = 1;  -- META
UPDATE pitch_market_data SET current_price = 514.33, updated_at = NOW() WHERE pitch_id = 2;  -- MSFT
UPDATE pitch_market_data SET current_price = 28.97, updated_at = NOW() WHERE pitch_id = 3;   -- DBX
UPDATE pitch_market_data SET current_price = 71.97, updated_at = NOW() WHERE pitch_id = 4;   -- AKAM
UPDATE pitch_market_data SET current_price = 187.77, updated_at = NOW() WHERE pitch_id = 5;  -- RDDT
UPDATE pitch_market_data SET current_price = 19.65, updated_at = NOW() WHERE pitch_id = 6;   -- WRBY
UPDATE pitch_market_data SET current_price = 4991.76, updated_at = NOW() WHERE pitch_id = 7; -- BKNG

-- Trigger should auto-recalculate, but let's manually call it too
SELECT award_investor_tiers();

-- Verify NEW rankings
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
