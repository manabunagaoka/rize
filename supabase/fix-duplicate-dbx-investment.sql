-- FIX: Consolidate duplicate DBX investments for user
-- User has TWO separate records for pitch_id 3 (DBX):
-- 1. 500 shares (newer, id: 2b582100...)
-- 2. 1000 shares (older, id: 98735d28...)
-- We'll merge them into ONE record (keep the older one as primary)

DO $$
DECLARE
  v_older_id uuid;
  v_newer_id uuid;
  v_total_shares numeric;
  v_total_invested numeric;
  v_new_avg_price numeric;
BEGIN
  -- Find the two records for pitch_id 3
  SELECT id INTO v_older_id 
  FROM user_investments
  WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
    AND pitch_id = 3
  ORDER BY created_at ASC
  LIMIT 1;
  
  SELECT id INTO v_newer_id 
  FROM user_investments
  WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
    AND pitch_id = 3
    AND id != v_older_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate combined values
  SELECT 
    SUM(shares_owned),
    SUM(total_invested)
  INTO v_total_shares, v_total_invested
  FROM user_investments
  WHERE id IN (v_older_id, v_newer_id);
  
  v_new_avg_price := v_total_invested / v_total_shares;
  
  RAISE NOTICE 'Merging DBX investments:';
  RAISE NOTICE '  Older ID: %', v_older_id;
  RAISE NOTICE '  Newer ID: %', v_newer_id;
  RAISE NOTICE '  Total shares: %', v_total_shares;
  RAISE NOTICE '  Total invested: %', v_total_invested;
  RAISE NOTICE '  New avg price: %', v_new_avg_price;
  
  -- Update the older record with combined values
  UPDATE user_investments
  SET 
    shares_owned = v_total_shares,
    total_invested = v_total_invested,
    avg_purchase_price = v_new_avg_price,
    updated_at = NOW()
  WHERE id = v_older_id;
  
  -- Delete the newer duplicate record
  DELETE FROM user_investments
  WHERE id = v_newer_id;
  
  RAISE NOTICE 'Successfully merged duplicate DBX investments!';
END $$;

-- Verify the result
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
  AND pitch_id = 3;
