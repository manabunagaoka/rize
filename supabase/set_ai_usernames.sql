-- Set usernames for existing AI investors
-- Copy and run this entire SQL in Supabase

-- First, check what nicknames we have
SELECT user_id, ai_nickname, username 
FROM user_token_balances 
WHERE is_ai_investor = true
ORDER BY ai_nickname;

-- Update AI investors one by one to ensure unique usernames
-- Using exact ai_nickname matches from the database
-- Adding "AI" prefix so users can see these are bots on the leaderboard
UPDATE user_token_balances 
SET username = 'AI The Boomer', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'The Boomer';

UPDATE user_token_balances 
SET username = 'AI Steady Eddie', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'Steady Eddie';

UPDATE user_token_balances 
SET username = 'AI YOLO Kid', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'YOLO Kid';

UPDATE user_token_balances 
SET username = 'AI Diamond Hands', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'Diamond Hands';

UPDATE user_token_balances 
SET username = 'AI Silicon Brain', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'Silicon Brain';

UPDATE user_token_balances 
SET username = 'AI Cloud Surfer', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'Cloud Surfer';

UPDATE user_token_balances 
SET username = 'AI FOMO Master', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'FOMO Master';

UPDATE user_token_balances 
SET username = 'AI Hype Train', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'Hype Train';

UPDATE user_token_balances 
SET username = 'AI The Contrarian', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'The Contrarian';

UPDATE user_token_balances 
SET username = 'AI The Oracle', username_set_at = NOW()
WHERE is_ai_investor = true AND ai_nickname = 'The Oracle';

-- Verify the updates worked
SELECT user_id, ai_nickname, username, username_set_at
FROM user_token_balances 
WHERE is_ai_investor = true
ORDER BY username;


