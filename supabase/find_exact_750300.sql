-- Check ALL records for Cloud Surfer (in case there are multiple)
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
WHERE (username ILIKE '%cloud%' AND username ILIKE '%surfer%')
   OR (ai_nickname ILIKE '%cloud%' AND ai_nickname ILIKE '%surfer%')
ORDER BY updated_at DESC;

-- Check if there's a record with exactly $750,300.83
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  total_invested,
  is_ai_investor,
  updated_at
FROM user_token_balances
WHERE ROUND(available_tokens::numeric, 2) = 750300.83
ORDER BY updated_at DESC;
