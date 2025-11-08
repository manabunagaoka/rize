-- Comprehensive duplicate fix for ALL investments
-- This will consolidate any duplicate records for each user+pitch combination

DO $$
DECLARE
  dup_record RECORD;
  v_keep_id uuid;
  v_total_shares numeric;
  v_total_invested numeric;
  v_new_avg_price numeric;
BEGIN
  -- Find all duplicate user+pitch combinations
  FOR dup_record IN 
    SELECT 
      user_id,
      pitch_id,
      COUNT(*) as dup_count,
      ARRAY_AGG(id ORDER BY created_at ASC) as all_ids,
      ARRAY_AGG(shares_owned ORDER BY created_at ASC) as all_shares
    FROM user_investments
    WHERE shares_owned > 0
    GROUP BY user_id, pitch_id
    HAVING COUNT(*) > 1
  LOOP
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Found duplicate: user_id=%, pitch_id=%, count=%', 
      dup_record.user_id, dup_record.pitch_id, dup_record.dup_count;
    RAISE NOTICE 'Record IDs: %', dup_record.all_ids;
    RAISE NOTICE 'Shares: %', dup_record.all_shares;
    
    -- Keep the oldest record (first in array)
    v_keep_id := dup_record.all_ids[1];
    
    -- Calculate totals from all duplicate records
    SELECT 
      SUM(shares_owned),
      SUM(total_invested)
    INTO v_total_shares, v_total_invested
    FROM user_investments
    WHERE user_id = dup_record.user_id
      AND pitch_id = dup_record.pitch_id
      AND shares_owned > 0;
    
    v_new_avg_price := v_total_invested / v_total_shares;
    
    RAISE NOTICE 'Consolidating into ID: %', v_keep_id;
    RAISE NOTICE '  Total shares: %', v_total_shares;
    RAISE NOTICE '  Total invested: %', v_total_invested;
    RAISE NOTICE '  New avg price: %', v_new_avg_price;
    
    -- Update the record we're keeping
    UPDATE user_investments
    SET 
      shares_owned = v_total_shares,
      total_invested = v_total_invested,
      avg_purchase_price = v_new_avg_price,
      updated_at = NOW()
    WHERE id = v_keep_id;
    
    -- Delete all other duplicate records
    DELETE FROM user_investments
    WHERE user_id = dup_record.user_id
      AND pitch_id = dup_record.pitch_id
      AND id != v_keep_id;
    
    RAISE NOTICE 'Consolidated successfully!';
  END LOOP;
  
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'All duplicates consolidated!';
END $$;

-- Verify: Show any remaining duplicates (should be none)
SELECT 
  user_id,
  pitch_id,
  COUNT(*) as count,
  ARRAY_AGG(id) as ids
FROM user_investments
WHERE shares_owned > 0
GROUP BY user_id, pitch_id
HAVING COUNT(*) > 1;

-- Show final state for your account
SELECT 
  pitch_id,
  shares_owned,
  total_invested,
  avg_purchase_price,
  created_at
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  AND shares_owned > 0
ORDER BY pitch_id;
