-- Find user with cash around $258,657
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  is_ai_investor
FROM user_token_balances
WHERE available_tokens BETWEEN 258000 AND 259000
ORDER BY available_tokens DESC;

-- Or check if it's total_invested
SELECT 
  user_id,
  username,
  ai_nickname,
  available_tokens as cash,
  total_invested,
  is_ai_investor
FROM user_token_balances
WHERE total_invested BETWEEN 258000 AND 259000
   OR available_tokens + total_invested BETWEEN 750000 AND 751000
ORDER BY available_tokens DESC;
