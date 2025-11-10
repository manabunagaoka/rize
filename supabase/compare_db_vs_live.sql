-- Compare database stored values vs what they SHOULD be with current prices
-- This shows why APIs return different numbers than database

SELECT 
  'Cloud Surfer Comparison' as analysis,
  
  -- Database stored values (STALE from yesterday)
  491643.18 as db_cash,
  299006.82 as db_dbx_value,
  418700.00 as db_akam_value,
  1209350.00 as db_total,
  
  -- Current market prices (example - need to fetch from API)
  -- DBX current price: let's say $31.125
  -- AKAM current price: let's say $86.20
  9686 as dbx_shares,
  31.125 as dbx_current_price,
  FLOOR(9686 * 31.125) as live_dbx_value,
  
  5000 as akam_shares,
  86.20 as akam_current_price,
  FLOOR(5000 * 86.20) as live_akam_value,
  
  -- Live calculation (what APIs should return)
  491643.18 + FLOOR(9686 * 31.125) + FLOOR(5000 * 86.20) as live_total,
  
  -- Difference
  (491643.18 + FLOOR(9686 * 31.125) + FLOOR(5000 * 86.20)) - 1209350.00 as difference;
