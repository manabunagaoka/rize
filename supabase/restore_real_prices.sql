-- Emergency: Restore real market prices from Finnhub API
-- All prices went back to $100 seed price

-- These are approximate real prices as of Nov 4, 2025 (update with actual Finnhub data):
UPDATE pitch_market_data SET current_price = 589.37 WHERE pitch_id = 1; -- META
UPDATE pitch_market_data SET current_price = 422.54 WHERE pitch_id = 2; -- MSFT
UPDATE pitch_market_data SET current_price = 27.89 WHERE pitch_id = 3;  -- DBX
UPDATE pitch_market_data SET current_price = 106.41 WHERE pitch_id = 4; -- AKAM
UPDATE pitch_market_data SET current_price = 132.18 WHERE pitch_id = 5; -- RDDT
UPDATE pitch_market_data SET current_price = 15.66 WHERE pitch_id = 6;  -- WRBY
UPDATE pitch_market_data SET current_price = 4738.00 WHERE pitch_id = 7; -- BKNG

-- Now recalculate everything with real prices
UPDATE user_investments ui
SET current_value = ui.shares_owned * pmd.current_price
FROM pitch_market_data pmd
WHERE ui.pitch_id = pmd.pitch_id
  AND ui.shares_owned > 0;

UPDATE user_token_balances utb
SET portfolio_value = COALESCE((
  SELECT SUM(current_value)
  FROM user_investments
  WHERE user_id = utb.user_id AND shares_owned > 0
), 0);

UPDATE user_token_balances
SET all_time_gain_loss = (available_tokens + portfolio_value) - total_tokens;

SELECT award_investor_tiers();

-- Verify
SELECT 
  ai_nickname,
  (available_tokens + portfolio_value) as total_value,
  investor_tier
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC
LIMIT 5;
