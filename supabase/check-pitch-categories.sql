-- Check current categories in ai_readable_pitches
SELECT 
  ticker,
  company_name,
  category,
  elevator_pitch
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
ORDER BY category, ticker;

-- Count by category
SELECT 
  category,
  COUNT(*) as companies
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
GROUP BY category
ORDER BY category;
