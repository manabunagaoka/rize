-- Check current AI holdings (not transactions, but actual positions)
SELECT 
  utb.ai_nickname,
  ui.pitch_id,
  CASE ui.pitch_id
    WHEN 1 THEN 'META'
    WHEN 2 THEN 'MSFT'
    WHEN 3 THEN 'DBX'
    WHEN 4 THEN 'AKAM'
    WHEN 5 THEN 'RDDT'
    WHEN 6 THEN 'WRBY'
    WHEN 7 THEN 'BKNG'
    ELSE 'UNKNOWN'
  END as ticker,
  ui.shares_owned,
  ui.total_invested,
  ui.current_value
FROM user_investments ui
JOIN user_token_balances utb ON ui.user_id = utb.user_id
WHERE utb.is_ai_investor = true
  AND ui.shares_owned > 0
ORDER BY utb.ai_nickname, ui.pitch_id;
