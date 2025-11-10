-- Find ALL users with "Cloud" or "Surfer" in their name
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  total_invested,
  is_ai_investor,
  updated_at
FROM user_token_balances
WHERE username ILIKE '%cloud%' 
   OR username ILIKE '%surfer%'
   OR ai_nickname ILIKE '%cloud%'
   OR ai_nickname ILIKE '%surfer%'
ORDER BY ai_nickname, username;
