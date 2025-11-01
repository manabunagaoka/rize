-- Give AI investors random stock holdings across all indexes
-- Run this in Supabase SQL Editor

-- First, let's see what pitches/stocks are available
-- SELECT id, name FROM student_projects WHERE status = 'approved' LIMIT 20;

-- For now, let's manually assign some holdings to AI investors
-- This simulates them investing in various indexes (HM7, S&P7, etc.)

-- Note: You'll need to replace these pitch_ids with actual IDs from your student_projects table
-- Get real IDs by running: SELECT id, name FROM student_projects WHERE status = 'approved';

-- Example AI investment assignments (customize pitch_ids based on your data):

-- AI The Boomer - Conservative, diversified holdings
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_boomer',
  id,
  FLOOR(RANDOM() * 50 + 10)::DECIMAL, -- 10-60 shares
  FLOOR(RANDOM() * 50000 + 10000), -- $10K-60K invested
  100, -- $100 avg price
  FLOOR(RANDOM() * 60000 + 15000) -- Current value
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 5
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI Steady Eddie - Balanced portfolio
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_steady',
  id,
  FLOOR(RANDOM() * 40 + 15)::DECIMAL,
  FLOOR(RANDOM() * 45000 + 15000),
  100,
  FLOOR(RANDOM() * 55000 + 20000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 6
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI YOLO Kid - Concentrated, high risk
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_yolo',
  id,
  FLOOR(RANDOM() * 100 + 50)::DECIMAL, -- Bigger positions
  FLOOR(RANDOM() * 100000 + 50000),
  150,
  FLOOR(RANDOM() * 150000 + 60000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 3 -- Fewer holdings, more concentrated
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI Diamond Hands - Long-term holds
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_diamond',
  id,
  FLOOR(RANDOM() * 60 + 20)::DECIMAL,
  FLOOR(RANDOM() * 60000 + 20000),
  80, -- Low avg price (bought early)
  FLOOR(RANDOM() * 80000 + 30000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 7
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI Silicon Brain - Tech focused
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_silicon',
  id,
  FLOOR(RANDOM() * 70 + 30)::DECIMAL,
  FLOOR(RANDOM() * 70000 + 30000),
  120,
  FLOOR(RANDOM() * 90000 + 40000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 4
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI Cloud Surfer - SaaS focused
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_cloud',
  id,
  FLOOR(RANDOM() * 55 + 25)::DECIMAL,
  FLOOR(RANDOM() * 55000 + 25000),
  110,
  FLOOR(RANDOM() * 70000 + 35000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 5
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI FOMO Master - Momentum trades
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_fomo',
  id,
  FLOOR(RANDOM() * 80 + 40)::DECIMAL,
  FLOOR(RANDOM() * 80000 + 40000),
  140,
  FLOOR(RANDOM() * 100000 + 50000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 4
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI Hype Train - Trend follower
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_hype',
  id,
  FLOOR(RANDOM() * 65 + 35)::DECIMAL,
  FLOOR(RANDOM() * 65000 + 35000),
  130,
  FLOOR(RANDOM() * 85000 + 45000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 5
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI The Contrarian - Contrarian picks
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_contrarian',
  id,
  FLOOR(RANDOM() * 45 + 20)::DECIMAL,
  FLOOR(RANDOM() * 45000 + 20000),
  95,
  FLOOR(RANDOM() * 60000 + 30000)
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 6
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- AI The Oracle - Perfect timing (best performance)
INSERT INTO user_investments (user_id, pitch_id, shares_owned, total_invested, avg_purchase_price, current_value)
SELECT 
  'ai_oracle',
  id,
  FLOOR(RANDOM() * 50 + 25)::DECIMAL,
  FLOOR(RANDOM() * 50000 + 25000),
  70, -- Very low avg price (perfect entries)
  FLOOR(RANDOM() * 120000 + 60000) -- High current value
FROM student_projects 
WHERE status = 'approved' 
ORDER BY RANDOM() 
LIMIT 7
ON CONFLICT (user_id, pitch_id) DO NOTHING;

-- Update their cash balances to reflect investments
UPDATE user_token_balances utb
SET available_tokens = total_tokens - COALESCE(
  (SELECT SUM(total_invested) FROM user_investments WHERE user_id = utb.user_id),
  0
)
WHERE is_ai_investor = true;

-- Verify the results
SELECT 
  utb.user_id,
  utb.username,
  utb.available_tokens as cash,
  COUNT(ui.id) as num_holdings,
  SUM(ui.current_value) as holdings_value,
  utb.available_tokens + SUM(ui.current_value) as total_portfolio
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id
WHERE utb.is_ai_investor = true
GROUP BY utb.user_id, utb.username, utb.available_tokens
ORDER BY total_portfolio DESC;
