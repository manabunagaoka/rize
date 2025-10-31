-- Add username system to users table
-- Run this migration in your Supabase SQL editor

-- Add username column (allows spaces, max 50 chars)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Add timestamp for when username was set
ALTER TABLE users ADD COLUMN IF NOT EXISTS username_set_at TIMESTAMP;

-- Create unique index for case-insensitive username lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
ON users (LOWER(username));

-- Set username for current user (ManaMana)
-- Replace 'your-email@manaboodle.com' with your actual Manaboodle email
UPDATE users 
SET username = 'ManaMana', 
    username_set_at = NOW()
WHERE email = 'your-email@manaboodle.com';

-- Verify the update
SELECT id, email, username, username_set_at 
FROM users 
WHERE username = 'ManaMana';

-- Optional: Set usernames for AI investors (will create these later)
-- UPDATE users SET username = 'AI Warren', username_set_at = NOW() WHERE email = 'ai.warren@rize.ai';
-- UPDATE users SET username = 'AI Cathie', username_set_at = NOW() WHERE email = 'ai.cathie@rize.ai';
-- UPDATE users SET username = 'AI Peter', username_set_at = NOW() WHERE email = 'ai.peter@rize.ai';
-- UPDATE users SET username = 'AI Ray', username_set_at = NOW() WHERE email = 'ai.ray@rize.ai';
-- UPDATE users SET username = 'AI Charlie', username_set_at = NOW() WHERE email = 'ai.charlie@rize.ai';
-- UPDATE users SET username = 'AI Benjamin', username_set_at = NOW() WHERE email = 'ai.benjamin@rize.ai';
-- UPDATE users SET username = 'AI Michael', username_set_at = NOW() WHERE email = 'ai.michael@rize.ai';
