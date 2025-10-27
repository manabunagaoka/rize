-- Migration: Multi-Competition Platform
-- This adds competitions table and links existing data to competitions

-- ============================================
-- 1. CREATE COMPETITIONS TABLE
-- ============================================

DROP TABLE IF EXISTS competitions CASCADE;

CREATE TABLE competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('inspiration', 'class', 'custom')),
  
  -- Access control
  class_code TEXT,
  graduation_year INTEGER,
  is_public BOOLEAN DEFAULT true,
  
  -- Voting rules
  allow_voting BOOLEAN DEFAULT true,
  allow_submissions BOOLEAN DEFAULT true,
  voting_start TIMESTAMPTZ,
  voting_end TIMESTAMPTZ,
  
  -- Competition state
  status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'archived')),
  
  -- Metadata
  icon TEXT DEFAULT '🎓',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_class ON competitions(class_code, graduation_year);
CREATE INDEX idx_competitions_created_by ON competitions(created_by);

-- ============================================
-- 2. SEED INITIAL COMPETITIONS
-- ============================================

INSERT INTO competitions (id, name, description, type, class_code, graduation_year, is_public, allow_voting, allow_submissions, voting_start, voting_end, status, icon, created_by) VALUES
  (
    'legendary',
    'Legendary Harvard Pitches',
    'Vote on pitches from Harvard founders who turned dorm room ideas into billion-dollar companies',
    'inspiration',
    NULL,
    NULL,
    true,
    true,
    false,
    NOW(),
    NULL,
    'active',
    '🏆',
    'system'
  ),
  (
    'harvard-2026-main',
    'Harvard Class of 2026',
    'Vote for your classmates'' startups',
    'class',
    'CS50',
    2026,
    true,
    true,
    true,
    NOW(),
    NULL,
    'active',
    '🎓',
    'system'
  ),
  (
    'harvard-2025-main',
    'Harvard Class of 2025',
    'Coming soon - Voting opens January 2026',
    'class',
    'CS50',
    2025,
    true,
    false,
    false,
    '2026-01-01 00:00:00',
    NULL,
    'upcoming',
    '🎓',
    'system'
  );

-- ============================================
-- 3. UPDATE EXISTING TABLES
-- ============================================

-- Add competition_id to legendary_pitch_votes
ALTER TABLE legendary_pitch_votes 
  ADD COLUMN IF NOT EXISTS competition_id TEXT DEFAULT 'legendary' REFERENCES competitions(id);

-- Add competition_id to student_projects
ALTER TABLE student_projects
  ADD COLUMN IF NOT EXISTS competition_id TEXT DEFAULT 'harvard-2026-main' REFERENCES competitions(id);

-- Add competition_id to project_votes
ALTER TABLE project_votes
  ADD COLUMN IF NOT EXISTS competition_id TEXT DEFAULT 'harvard-2026-main' REFERENCES competitions(id);

-- Indexes for competition filtering
CREATE INDEX IF NOT EXISTS idx_legendary_votes_competition ON legendary_pitch_votes(competition_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_competition ON student_projects(competition_id);
CREATE INDEX IF NOT EXISTS idx_project_votes_competition ON project_votes(competition_id);

-- ============================================
-- 4. UPDATE VIEWS FOR COMPETITION FILTERING
-- ============================================

-- Update legendary_pitch_rankings to filter by competition
DROP VIEW IF EXISTS legendary_pitch_rankings CASCADE;

CREATE VIEW legendary_pitch_rankings AS
SELECT 
  competition_id,
  pitch_id,
  COUNT(*) as vote_count,
  COUNT(DISTINCT user_id) as unique_voters,
  COUNT(DISTINCT class_code) as classes_voting
FROM legendary_pitch_votes
GROUP BY competition_id, pitch_id
ORDER BY competition_id, vote_count DESC;

-- Update project_rankings to filter by competition
DROP VIEW IF EXISTS project_rankings CASCADE;

CREATE VIEW project_rankings AS
SELECT 
  sp.id,
  sp.competition_id,
  sp.startup_name,
  sp.one_liner,
  sp.founders,
  sp.category,
  sp.logo_url,
  COUNT(DISTINCT pv.id) as vote_count,
  AVG(pv.market_opportunity) as avg_market_opportunity,
  AVG(pv.innovation) as avg_innovation,
  AVG(pv.execution_difficulty) as avg_execution_difficulty,
  AVG(pv.scalability) as avg_scalability,
  AVG(pv.social_impact) as avg_social_impact,
  (
    AVG(pv.market_opportunity) +
    AVG(pv.innovation) +
    AVG(pv.execution_difficulty) +
    AVG(pv.scalability) +
    AVG(pv.social_impact)
  ) / 5.0 as overall_score
FROM student_projects sp
LEFT JOIN project_votes pv ON sp.id = pv.project_id
WHERE sp.status = 'approved'
GROUP BY sp.id, sp.competition_id, sp.startup_name, sp.one_liner, sp.founders, sp.category, sp.logo_url
ORDER BY sp.competition_id, overall_score DESC NULLS LAST, vote_count DESC;

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON competitions TO anon;
GRANT SELECT ON legendary_pitch_rankings TO anon;
GRANT SELECT ON project_rankings TO anon;

-- ============================================
-- 6. HELPER VIEWS FOR COMPETITION STATS
-- ============================================

-- Competition statistics view
CREATE OR REPLACE VIEW competition_stats AS
SELECT 
  c.id,
  c.name,
  c.status,
  c.icon,
  COALESCE(pitch_stats.vote_count, 0) + COALESCE(project_stats.vote_count, 0) as total_votes,
  COALESCE(pitch_stats.entry_count, 0) + COALESCE(project_stats.entry_count, 0) as total_entries,
  COALESCE(pitch_stats.voter_count, 0) + COALESCE(project_stats.voter_count, 0) as unique_voters,
  COALESCE(pending_count, 0) as pending_submissions
FROM competitions c
LEFT JOIN (
  SELECT 
    competition_id,
    COUNT(*) as vote_count,
    COUNT(DISTINCT pitch_id) as entry_count,
    COUNT(DISTINCT user_id) as voter_count
  FROM legendary_pitch_votes
  GROUP BY competition_id
) pitch_stats ON c.id = pitch_stats.competition_id
LEFT JOIN (
  SELECT 
    sp.competition_id,
    COUNT(DISTINCT pv.id) as vote_count,
    COUNT(DISTINCT sp.id) as entry_count,
    COUNT(DISTINCT pv.user_id) as voter_count
  FROM student_projects sp
  LEFT JOIN project_votes pv ON sp.id = pv.project_id
  WHERE sp.status = 'approved'
  GROUP BY sp.competition_id
) project_stats ON c.id = project_stats.competition_id
LEFT JOIN (
  SELECT 
    competition_id,
    COUNT(*) as pending_count
  FROM student_projects
  WHERE status = 'pending'
  GROUP BY competition_id
) pending ON c.id = pending.competition_id
ORDER BY c.created_at;

GRANT SELECT ON competition_stats TO anon;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migrations
SELECT 'Competitions created:' as status, COUNT(*) as count FROM competitions;
SELECT 'Legendary votes linked:' as status, COUNT(*) as count FROM legendary_pitch_votes WHERE competition_id IS NOT NULL;
SELECT 'Student projects linked:' as status, COUNT(*) as count FROM student_projects WHERE competition_id IS NOT NULL;
