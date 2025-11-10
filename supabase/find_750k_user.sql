-- Check if there's a user with $750,300 cash
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  is_ai_investor,
  updated_at
FROM user_token_balances
WHERE available_tokens BETWEEN 750000 AND 751000
ORDER BY available_tokens DESC;

-- Also check if somehow Cloud Surfer's record got corrupted
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  total_invested,
  is_ai_investor,
  created_at,
  updated_at
FROM user_token_balances
WHERE user_id = 'ai_cloud';
