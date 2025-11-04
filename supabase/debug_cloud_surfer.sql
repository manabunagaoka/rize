-- Investigate Cloud Surfer's cash balance issue

-- Step 1: Check ALL transactions for Cloud Surfer
SELECT 
  timestamp,
  transaction_type,
  pitch_id,
  shares,
  price_per_share,
  total_amount,
  balance_before,
  balance_after
FROM investment_transactions
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_cloud@rize.manaboodle.com')
ORDER BY timestamp ASC;

-- Step 2: Check current balance vs what it should be
SELECT 
  user_email,
  total_tokens as starting_balance,
  available_tokens as current_cash,
  total_invested,
  portfolio_value,
  (available_tokens + total_invested) as cash_plus_cost,
  (available_tokens + portfolio_value) as total_value
FROM user_token_balances
WHERE user_email = 'ai_cloud@rize.manaboodle.com';

-- Step 3: Check current holdings
SELECT 
  pitch_id,
  shares_owned,
  avg_purchase_price,
  total_invested,
  current_value
FROM user_investments
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'ai_cloud@rize.manaboodle.com')
  AND shares_owned > 0;

-- Expected: If bought 10K shares at $19.57 = $195,700 cost
-- Should have: $1,000,000 - $195,700 = $804,300 cash remaining
