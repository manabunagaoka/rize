-- Find all AI investors and their cash to see if any combination equals 750,300
SELECT 
  user_id,
  ai_nickname,
  available_tokens as cash,
  ROUND(available_tokens, 0) as cash_rounded
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY available_tokens DESC;

-- Check if 750,300 is a sum of multiple users
WITH ai_cash AS (
  SELECT available_tokens FROM user_token_balances WHERE is_ai_investor = true
)
SELECT 
  a.available_tokens as user1_cash,
  b.available_tokens as user2_cash,
  a.available_tokens + b.available_tokens as sum
FROM ai_cash a, ai_cash b
WHERE ROUND(a.available_tokens + b.available_tokens, 0) = 750300
LIMIT 10;
