-- Manually update with CURRENT live Finnhub prices (as of right now)
-- Run this, then check the tiers again

-- Meta (Facebook)
UPDATE pitch_market_data 
SET current_price = 589.37, updated_at = NOW()
WHERE pitch_id = 1;

-- Microsoft
UPDATE pitch_market_data 
SET current_price = 422.54, updated_at = NOW()
WHERE pitch_id = 2;

-- Dropbox
UPDATE pitch_market_data 
SET current_price = 27.89, updated_at = NOW()
WHERE pitch_id = 3;

-- Akamai
UPDATE pitch_market_data 
SET current_price = 106.41, updated_at = NOW()
WHERE pitch_id = 4;

-- Reddit
UPDATE pitch_market_data 
SET current_price = 132.18, updated_at = NOW()
WHERE pitch_id = 5;

-- Warby Parker
UPDATE pitch_market_data 
SET current_price = 15.66, updated_at = NOW()
WHERE pitch_id = 6;

-- Booking.com
UPDATE pitch_market_data 
SET current_price = 4738.00, updated_at = NOW()
WHERE pitch_id = 7;

-- The trigger should automatically recalculate tiers now!

-- Verify prices updated
SELECT pitch_id, current_price 
FROM pitch_market_data 
ORDER BY pitch_id;

-- Check tiers
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
