-- Check ALL investment records including zero-share ones
SELECT 
  id,
  pitch_id,
  shares_owned,
  total_invested,
  avg_purchase_price,
  current_value,
  unrealized_gain_loss,
  created_at,
  updated_at
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
ORDER BY pitch_id, created_at;

-- Calculate portfolio value manually
SELECT 
  SUM(CASE 
    WHEN pitch_id = 1 THEN shares_owned * 618.0
    WHEN pitch_id = 2 THEN shares_owned * 496.0
    WHEN pitch_id = 3 THEN shares_owned * 30.87
    WHEN pitch_id = 4 THEN shares_owned * 83.74
    WHEN pitch_id = 5 THEN shares_owned * 194.58
    WHEN pitch_id = 6 THEN shares_owned * 17.22
    WHEN pitch_id = 7 THEN shares_owned * 4940.0
    ELSE 0
  END)::integer as estimated_holdings_value
FROM user_investments
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
  AND shares_owned > 0;

-- Get cash balance
SELECT 
  available_tokens as cash,
  available_tokens + (
    SELECT SUM(CASE 
      WHEN pitch_id = 1 THEN shares_owned * 618.0
      WHEN pitch_id = 2 THEN shares_owned * 496.0
      WHEN pitch_id = 3 THEN shares_owned * 30.87
      WHEN pitch_id = 4 THEN shares_owned * 83.74
      WHEN pitch_id = 5 THEN shares_owned * 194.58
      WHEN pitch_id = 6 THEN shares_owned * 17.22
      WHEN pitch_id = 7 THEN shares_owned * 4940.0
      ELSE 0
    END)::integer
    FROM user_investments
    WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85'
      AND shares_owned > 0
  ) as estimated_total_portfolio
FROM user_token_balances
WHERE user_id = '19be07bc-28d0-4ac6-956b-714eef1ccc85';
