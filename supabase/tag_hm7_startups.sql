-- ============================================
-- TAG HM7 STARTUPS
-- Link ALL existing student_projects to HM7 competition
-- ============================================

-- Insert ALL current startups into HM7 competition
INSERT INTO startup_competitions (startup_id, competition_id)
SELECT 
  sp.id,
  c.id
FROM student_projects sp
CROSS JOIN competitions c
WHERE c.slug = 'hm7-fall-2025'
ON CONFLICT (startup_id, competition_id) DO NOTHING;

-- Verify the insertions
SELECT 
  c.name as competition,
  sp.startup_name,
  sp.user_name as founder,
  sc.joined_at
FROM startup_competitions sc
JOIN competitions c ON c.id = sc.competition_id
JOIN student_projects sp ON sp.id = sc.startup_id
WHERE c.slug = 'hm7-fall-2025'
ORDER BY sc.joined_at;

-- Check the competition stats view
SELECT * FROM competition_stats WHERE slug = 'hm7-fall-2025';

-- Check the founder leaderboard for HM7
SELECT 
  c.name as competition,
  sp.startup_name,
  sp.user_name as founder,
  cfl.market_cap,
  cfl.rank
FROM competition_founder_leaderboard cfl
JOIN competitions c ON c.id = cfl.competition_id
JOIN student_projects sp ON sp.id = cfl.startup_id
WHERE c.slug = 'hm7-fall-2025'
ORDER BY cfl.rank;
