-- Check for ALL duplicate investments (not just yours)
SELECT 
  user_id,
  pitch_id,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at) as record_ids,
  ARRAY_AGG(shares_owned ORDER BY created_at) as shares_list,
  ARRAY_AGG(created_at ORDER BY created_at) as created_dates
FROM user_investments
WHERE shares_owned > 0
GROUP BY user_id, pitch_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
