-- Add username system to user_token_balances table
-- Run this migration in your Supabase SQL editor

-- Add username column (allows spaces, max 50 chars)
ALTER TABLE user_token_balances ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Add timestamp for when username was set
ALTER TABLE user_token_balances ADD COLUMN IF NOT EXISTS username_set_at TIMESTAMP;

-- Create unique index for case-insensitive username lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_token_balances_username_lower 
ON user_token_balances (LOWER(username));

-- Set username for current user (ManaMana)
-- Replace 'your-email@harvard.edu' with your actual Harvard email
UPDATE user_token_balances 
SET username = 'ManaMana', 
    username_set_at = NOW()
WHERE user_email = 'manabunagaoka@gse.harvard.edu';

-- Verify the update
SELECT user_id, user_email, username, username_set_at 
FROM user_token_balances 
WHERE username = 'ManaMana';

-- Optional: Set usernames for AI investors (will create these later)
-- UPDATE user_token_balances SET username = 'AI Warren', username_set_at = NOW() WHERE user_email = 'ai.warren@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Cathie', username_set_at = NOW() WHERE user_email = 'ai.cathie@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Peter', username_set_at = NOW() WHERE user_email = 'ai.peter@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Ray', username_set_at = NOW() WHERE user_email = 'ai.ray@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Charlie', username_set_at = NOW() WHERE user_email = 'ai.charlie@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Benjamin', username_set_at = NOW() WHERE user_email = 'ai.benjamin@rize.ai';
-- UPDATE user_token_balances SET username = 'AI Michael', username_set_at = NOW() WHERE user_email = 'ai.michael@rize.ai';
