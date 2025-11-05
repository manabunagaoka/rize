-- Check each AI's strategy and recent trades

SELECT 
  utb.user_email,
  utb.ai_nickname,
  utb.ai_strategy,
  utb.available_tokens as cash,
  utb.portfolio_value as holdings,
  (utb.available_tokens + utb.portfolio_value) as total_value,
  utb.all_time_gain_loss,
  ROUND((utb.all_time_gain_loss / utb.total_tokens * 100)::NUMERIC, 2) as gain_pct
FROM user_token_balances utb
WHERE utb.is_ai_investor = true
ORDER BY (utb.available_tokens + utb.portfolio_value) DESC;

-- Show what each AI is holding
SELECT 
  utb.ai_nickname,
  utb.ai_strategy,
  ui.pitch_id,
  sp.startup_name,
  ui.shares_owned,
  ui.avg_purchase_price,
  pmd.current_price,
  ui.current_value,
  (ui.current_value - ui.total_invested) as profit_loss
FROM user_token_balances utb
JOIN user_investments ui ON utb.user_id = ui.user_id
JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
JOIN student_projects sp ON get_pitch_id_from_uuid(sp.id) = ui.pitch_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
ORDER BY utb.ai_nickname, ui.pitch_id;

-- Show last 3 trades for each AI
SELECT 
  utb.ai_nickname,
  it.timestamp,
  it.transaction_type,
  sp.startup_name,
  it.shares,
  it.price_per_share,
  it.total_amount
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
JOIN student_projects sp ON get_pitch_id_from_uuid(sp.id) = it.pitch_id
WHERE utb.is_ai_investor = true
  AND it.timestamp > NOW() - INTERVAL '1 hour'
ORDER BY it.timestamp DESC
LIMIT 30;
