-- Check for zero-share investment records
SELECT 
  id,
  pitch_id,
  shares_owned,
  total_invested,
  avg_purchase_price,
  created_at,
  updated_at
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
ORDER BY pitch_id, created_at;

-- Count active vs inactive investments
SELECT 
  CASE 
    WHEN shares_owned > 0 THEN 'Active'
    ELSE 'Sold/Zero'
  END as status,
  COUNT(*) as count,
  ARRAY_AGG(pitch_id ORDER BY pitch_id) as pitch_ids
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
GROUP BY CASE WHEN shares_owned > 0 THEN 'Active' ELSE 'Sold/Zero' END;
