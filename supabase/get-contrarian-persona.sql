-- Get The Contrarian's full persona to fix
SELECT 
  user_id,
  ai_nickname,
  ai_personality_prompt
FROM user_token_balances
WHERE user_id = 'ai_contrarian';
