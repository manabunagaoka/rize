-- Check what prices are ACTUALLY in the database right now
SELECT pitch_id, current_price, updated_at
FROM pitch_market_data
ORDER BY pitch_id;

-- Check what holdings they have
SELECT 
  utb.ai_nickname,
  ui.pitch_id,
  ui.shares_owned,
  pmd.current_price,
  (ui.shares_owned * pmd.current_price) as holding_value
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
WHERE utb.ai_nickname IN ('Steady Eddie', 'The Oracle')
  AND ui.shares_owned > 0
ORDER BY utb.ai_nickname, ui.pitch_id;
