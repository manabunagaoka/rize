-- Manual tier recalculation to fix status indicators
-- Reset all tiers and recalculate based on current rankings

-- Step 1: Clear all investor tiers
UPDATE user_token_balances 
SET investor_tier = NULL 
WHERE investor_tier IS NOT NULL;

-- Step 2: Assign TITAN to rank 1
UPDATE user_token_balances
SET investor_tier = 'TITAN'
WHERE user_id = (
  WITH real_time_portfolios AS (
    SELECT 
      utb.user_id,
      utb.available_tokens,
      utb.created_at,
      COALESCE(
        (SELECT SUM(ui.shares_owned * pmd.current_price)
         FROM user_investments ui
         JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
         WHERE ui.user_id = utb.user_id AND ui.shares_owned > 0),
        0
      ) as holdings_value
    FROM user_token_balances utb
    WHERE (utb.is_ai_investor = true OR utb.username IS NOT NULL)
      AND (utb.ai_status IN ('ACTIVE', 'LEGENDARY') OR utb.ai_status IS NULL)
  )
  SELECT user_id 
  FROM real_time_portfolios
  ORDER BY (available_tokens + holdings_value) DESC, created_at ASC
  LIMIT 1
);

-- Step 3: Assign ORACLE to rank 2  
UPDATE user_token_balances
SET investor_tier = 'ORACLE'
WHERE user_id = (
  WITH real_time_portfolios AS (
    SELECT 
      utb.user_id,
      utb.available_tokens,
      utb.created_at,
      COALESCE(
        (SELECT SUM(ui.shares_owned * pmd.current_price)
         FROM user_investments ui
         JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
         WHERE ui.user_id = utb.user_id AND ui.shares_owned > 0),
        0
      ) as holdings_value
    FROM user_token_balances utb
    WHERE (utb.is_ai_investor = true OR utb.username IS NOT NULL)
      AND (utb.ai_status IN ('ACTIVE', 'LEGENDARY') OR utb.ai_status IS NULL)
  )
  SELECT user_id 
  FROM real_time_portfolios
  ORDER BY (available_tokens + holdings_value) DESC, created_at ASC
  LIMIT 1 OFFSET 1
);

-- Step 4: Assign ALCHEMIST to rank 3
UPDATE user_token_balances
SET investor_tier = 'ALCHEMIST'
WHERE user_id = (
  WITH real_time_portfolios AS (
    SELECT 
      utb.user_id,
      utb.available_tokens,
      utb.created_at,
      COALESCE(
        (SELECT SUM(ui.shares_owned * pmd.current_price)
         FROM user_investments ui
         JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
         WHERE ui.user_id = utb.user_id AND ui.shares_owned > 0),
        0
      ) as holdings_value
    FROM user_token_balances utb
    WHERE (utb.is_ai_investor = true OR utb.username IS NOT NULL)
      AND (utb.ai_status IN ('ACTIVE', 'LEGENDARY') OR utb.ai_status IS NULL)
  )
  SELECT user_id 
  FROM real_time_portfolios
  ORDER BY (available_tokens + holdings_value) DESC, created_at ASC
  LIMIT 1 OFFSET 2
);

-- Verify tier assignments
SELECT 
  utb.username,
  utb.investor_tier,
  utb.available_tokens + COALESCE(
    (SELECT SUM(ui.shares_owned * pmd.current_price)
     FROM user_investments ui
     JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
     WHERE ui.user_id = utb.user_id AND ui.shares_owned > 0),
    0
  ) as total_portfolio
FROM user_token_balances utb
WHERE utb.investor_tier IS NOT NULL
ORDER BY total_portfolio DESC;
