-- QUERY 1: Get Cloud Surfer's cash from user_token_balances
SELECT 
  user_id,
  ai_nickname,
  available_tokens as cash,
  total_invested,
  updated_at
FROM user_token_balances
WHERE ai_nickname ILIKE '%cloud%' OR ai_nickname ILIKE '%surfer%';

-- QUERY 2: Get ALL investment rows for Cloud Surfer (including duplicates)
SELECT 
  ui.pitch_id,
  ui.shares_owned,
  ui.avg_purchase_price,
  ui.total_invested,
  ui.current_value,
  ui.updated_at,
  ui.created_at,
  ROW_NUMBER() OVER (PARTITION BY ui.pitch_id ORDER BY ui.updated_at DESC) as row_num
FROM user_investments ui
WHERE ui.user_id = (
  SELECT user_id 
  FROM user_token_balances 
  WHERE ai_nickname ILIKE '%cloud%' OR ai_nickname ILIKE '%surfer%'
)
ORDER BY ui.pitch_id, ui.updated_at DESC;

-- QUERY 3: Calculate using MOST RECENT row per pitch_id (what our deduplication logic does)
WITH deduplicated AS (
  SELECT DISTINCT ON (ui.pitch_id)
    ui.pitch_id,
    ui.shares_owned,
    ui.current_value,
    ui.updated_at
  FROM user_investments ui
  WHERE ui.user_id = (
    SELECT user_id 
    FROM user_token_balances 
    WHERE ai_nickname ILIKE '%cloud%' OR ai_nickname ILIKE '%surfer%'
  )
  AND ui.shares_owned > 0
  ORDER BY ui.pitch_id, ui.updated_at DESC
)
SELECT 
  'Cloud Surfer - Database Calculation' as source,
  utb.available_tokens as cash,
  SUM(d.shares_owned) as total_shares,
  SUM(d.current_value) as holdings_value,
  utb.available_tokens + SUM(d.current_value) as total_value,
  jsonb_agg(
    jsonb_build_object(
      'pitch_id', d.pitch_id,
      'shares', d.shares_owned,
      'db_value', d.current_value
    ) ORDER BY d.pitch_id
  ) as investments
FROM user_token_balances utb
LEFT JOIN deduplicated d ON true
WHERE utb.ai_nickname ILIKE '%cloud%' OR utb.ai_nickname ILIKE '%surfer%'
GROUP BY utb.user_id, utb.available_tokens;
