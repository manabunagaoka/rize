-- Add is_active column to control AI trading
-- Inactive AIs will be skipped during trading execution

ALTER TABLE user_token_balances 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing AI investors to be active
UPDATE user_token_balances 
SET is_active = true 
WHERE is_ai_investor = true;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_token_balances_active 
ON user_token_balances(is_active) 
WHERE is_ai_investor = true;

-- Verify
SELECT 
  ai_nickname,
  ai_strategy,
  is_active,
  available_tokens as cash
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY ai_nickname;
