-- Check if HM7 companies are in ai_readable_pitches
SELECT 
  pitch_id,
  company_name,
  ticker,
  current_price,
  price_change_24h,
  elevator_pitch,
  fun_fact
FROM ai_readable_pitches
WHERE pitch_id IN (1,2,3,4,5,6,7)
ORDER BY pitch_id;

-- Also check pitch_market_data for prices
SELECT 
  pitch_id,
  current_price,
  price_change_24h
FROM pitch_market_data
WHERE pitch_id IN (1,2,3,4,5,6,7)
ORDER BY pitch_id;
