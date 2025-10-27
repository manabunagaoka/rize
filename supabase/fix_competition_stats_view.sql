-- Fix: Add created_at column to competition_stats view
-- This fixes the "column competition_stats.created_at does not exist" error

DROP VIEW IF EXISTS competition_stats CASCADE;

CREATE OR REPLACE VIEW competition_stats AS
SELECT 
  c.id,
  c.name,
  c.status,
  c.icon,
  c.created_at,
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

-- Verify the fix
SELECT * FROM competition_stats;
