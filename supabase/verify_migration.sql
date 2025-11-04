-- Verify the competition_founder_leaderboard view structure
SELECT 
  column_name, 
  data_type,
  ordinal_position
FROM information_schema.columns
WHERE table_name = 'competition_founder_leaderboard'
ORDER BY ordinal_position;

-- Check if the view exists
SELECT COUNT(*) as view_exists 
FROM information_schema.views 
WHERE table_name = 'competition_founder_leaderboard';

-- Try to query the view (this will fail if startup_name column exists and references sp.title)
SELECT * FROM competition_founder_leaderboard LIMIT 1;
