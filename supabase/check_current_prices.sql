-- Check current stock prices to see what changed

SELECT 
  pitch_id,
  current_price,
  price_change_24h,
  updated_at
FROM pitch_market_data
ORDER BY pitch_id;

-- Show who's holding what
SELECT 
  utb.ai_nickname,
  sp.startup_name,
  ui.shares_owned,
  pmd.current_price,
  ui.current_value,
  (ui.current_value - ui.total_invested) as profit_loss
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
JOIN student_projects sp ON get_pitch_id_from_uuid(sp.id) = ui.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
ORDER BY utb.ai_nickname, ui.pitch_id;
