-- Check if AI investors are marked as active
SELECT 
  user_id,
  ai_nickname,
  ai_strategy,
  is_active,
  available_tokens,
  total_tokens,
  CASE 
    WHEN ai_personality_prompt IS NOT NULL THEN 'Has persona'
    ELSE 'NO PERSONA'
  END as persona_status
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY user_id;
