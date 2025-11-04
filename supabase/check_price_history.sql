-- Check price history - $100 is the DEFAULT starting price!

SELECT 
  pitch_id,
  current_price,
  price_change_24h,
  updated_at
FROM pitch_market_data
ORDER BY pitch_id;

-- Check ALL transactions to see if prices were $100 when AI bought
SELECT 
  it.timestamp,
  utb.user_email,
  it.transaction_type,
  it.pitch_id,
  it.shares,
  it.price_per_share,
  it.total_amount,
  pmd.current_price as current_market_price
FROM investment_transactions it
JOIN user_token_balances utb ON it.user_id = utb.user_id
JOIN pitch_market_data pmd ON it.pitch_id = pmd.pitch_id
WHERE utb.is_ai_investor = true
ORDER BY it.timestamp DESC
LIMIT 20;
