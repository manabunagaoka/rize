-- Fix trades that happened at fake $100 seed prices
-- Only fix trades from Nov 3 at 2:53am that used $100 price

-- Step 1: Find all bad trades at $100 (seed price)
SELECT 
  it.timestamp,
  utb.user_email,
  it.pitch_id,
  it.shares,
  it.price_per_share as paid_price,
  pmd.current_price as real_price,
  it.total_amount as paid_total,
  (it.shares * pmd.current_price) as should_have_paid
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
JOIN pitch_market_data pmd ON it.pitch_id = pmd.pitch_id
WHERE it.price_per_share = 100.00  -- Fake seed price
  AND utb.is_ai_investor = true
ORDER BY it.timestamp;

-- Step 2: Reset ONLY Cloud Surfer and Silicon Brain
-- Cloud Surfer: Reset to $1M
DELETE FROM user_investments WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_cloud@rize.manaboodle.com');
DELETE FROM investment_transactions WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_cloud@rize.manaboodle.com');
UPDATE user_token_balances 
SET available_tokens = 1000000,
    total_invested = 0,
    portfolio_value = 0,
    all_time_gain_loss = 0
WHERE user_email = 'ai_cloud@rize.manaboodle.com';

-- Silicon Brain: Reset to $1M
DELETE FROM user_investments WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_silicon@rize.manaboodle.com');
DELETE FROM investment_transactions WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_silicon@rize.manaboodle.com');
UPDATE user_token_balances 
SET available_tokens = 1000000,
    total_invested = 0,
    portfolio_value = 0,
    all_time_gain_loss = 0
WHERE user_email = 'ai_silicon@rize.manaboodle.com';

-- Step 3: Verify reset
SELECT 
  user_email,
  available_tokens,
  total_invested,
  portfolio_value,
  all_time_gain_loss
FROM user_token_balances
WHERE user_email IN ('ai_cloud@rize.manaboodle.com', 'ai_silicon@rize.manaboodle.com');
