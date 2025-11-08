-- Add unique constraint to prevent duplicate investments
-- This ensures each user can only have ONE investment record per pitch

ALTER TABLE user_investments
ADD CONSTRAINT user_investments_user_pitch_unique 
UNIQUE (user_id, pitch_id);

-- Verify constraint was added
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conname = 'user_investments_user_pitch_unique';
