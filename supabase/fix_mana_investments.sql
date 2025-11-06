-- Fix ManaMana's investments - delete the sold positions
-- User sold all 1000 META shares and all 10 MSFT shares on Nov 6
-- But the user_investments table wasn't updated due to Supabase caching bug

-- BEFORE: Check current investments
SELECT 'BEFORE DELETE:' as status;
SELECT 
  pitch_id,
  shares_owned,
  current_value,
  total_invested
FROM user_investments 
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'manabunagaoka@gse.harvard.edu')
ORDER BY pitch_id;

-- Delete the stale investment records for META (1) and MSFT (2)
DELETE FROM user_investments 
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'manabunagaoka@gse.harvard.edu')
AND pitch_id IN (1, 2);

-- AFTER: Verify remaining investments (should be 5: AKAM=4, BKNG=7, DBX=3, RDDT=5, WRBY=6)
SELECT 'AFTER DELETE:' as status;
SELECT 
  pitch_id,
  shares_owned,
  current_value,
  total_invested,
  unrealized_gain_loss
FROM user_investments 
WHERE user_id = (SELECT user_id FROM user_token_balances WHERE user_email = 'manabunagaoka@gse.harvard.edu')
ORDER BY pitch_id;
