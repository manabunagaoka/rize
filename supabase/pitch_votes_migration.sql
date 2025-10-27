-- Migration: Add legendary_pitch_votes table
-- This tracks which legendary Harvard startup pitches students vote for

-- Drop existing table if exists
DROP TABLE IF EXISTS legendary_pitch_votes CASCADE;

-- Create legendary_pitch_votes table
CREATE TABLE legendary_pitch_votes (
  id BIGSERIAL PRIMARY KEY,
  
  -- Which pitch was voted for (1-10 matching SUCCESS_STORIES array)
  pitch_id INTEGER NOT NULL,
  
  -- Who voted (from Manaboodle SSO)
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  
  -- Harvard class (e.g., "2026")
  class_code TEXT NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each user can only vote once per pitch
  CONSTRAINT unique_user_pitch UNIQUE (user_id, pitch_id)
);

-- Index for fast lookups
CREATE INDEX idx_legendary_pitch_votes_pitch_id ON legendary_pitch_votes(pitch_id);
CREATE INDEX idx_legendary_pitch_votes_user_id ON legendary_pitch_votes(user_id);
CREATE INDEX idx_legendary_pitch_votes_created_at ON legendary_pitch_votes(created_at DESC);

-- Create a view for pitch rankings
CREATE OR REPLACE VIEW legendary_pitch_rankings AS
SELECT 
  pitch_id,
  COUNT(*) as vote_count,
  COUNT(DISTINCT user_id) as unique_voters,
  COUNT(DISTINCT class_code) as classes_voting
FROM legendary_pitch_votes
GROUP BY pitch_id
ORDER BY vote_count DESC;

-- Grant permissions
GRANT SELECT, INSERT ON legendary_pitch_votes TO anon;
GRANT SELECT ON legendary_pitch_rankings TO anon;
GRANT USAGE ON SEQUENCE legendary_pitch_votes_id_seq TO anon;
