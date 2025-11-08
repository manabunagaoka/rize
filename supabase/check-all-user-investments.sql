-- Find ALL investment records including zero shares
SELECT 
  id,
  pitch_id,
  shares_owned,
  total_invested,
  current_value,
  created_at,
  updated_at
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
ORDER BY pitch_id, shares_owned DESC;

-- Check if there are records not being filtered by shares_owned > 0
SELECT 
  'Active (shares > 0)' as type,
  COUNT(*) as count,
  ARRAY_AGG(pitch_id ORDER BY pitch_id) as pitch_ids,
  ARRAY_AGG(shares_owned ORDER BY pitch_id) as shares_list
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  AND shares_owned > 0

UNION ALL

SELECT 
  'Zero or negative' as type,
  COUNT(*) as count,
  ARRAY_AGG(pitch_id ORDER BY pitch_id) as pitch_ids,
  ARRAY_AGG(shares_owned ORDER BY pitch_id) as shares_list
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  AND shares_owned <= 0;
