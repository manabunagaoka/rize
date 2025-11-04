-- Create HM7 legendary pitches and initialize market data
-- These are Harvard-founded companies that form the HM7 index

-- Update market data for HM7 pitches with realistic starting prices
-- Using placeholder prices - will be updated by Finnhub API integration later

UPDATE pitch_market_data
SET 
  current_price = CASE pitch_id
    WHEN 1 THEN 385.00  -- Facebook/Meta (~$385 per share)
    WHEN 2 THEN 415.00  -- Microsoft (~$415 per share)
    WHEN 3 THEN 25.00   -- Dropbox (~$25 per share)
    WHEN 4 THEN 65.00   -- Reddit (~$65 per share)
    WHEN 5 THEN 100.00  -- Quora (private, estimated)
    WHEN 6 THEN 100.00  -- Khan Academy (nonprofit, estimated value)
    WHEN 7 THEN 15.00   -- Snapchat (~$15 per share)
  END,
  price_change_24h = CASE pitch_id
    WHEN 1 THEN 2.5
    WHEN 2 THEN 1.2
    WHEN 3 THEN -0.8
    WHEN 4 THEN 5.3
    WHEN 5 THEN 0.0
    WHEN 6 THEN 0.0
    WHEN 7 THEN -2.1
  END,
  updated_at = NOW()
WHERE pitch_id BETWEEN 1 AND 7;

-- Verify the data
SELECT 
  pitch_id,
  current_price,
  price_change_24h,
  total_volume,
  unique_investors
FROM pitch_market_data
WHERE pitch_id BETWEEN 1 AND 7
ORDER BY pitch_id;
