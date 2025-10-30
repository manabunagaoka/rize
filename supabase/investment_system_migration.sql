-- RIZE Investment System Migration
-- Replaces voting system with Manaboodle Token (MTK) investment mechanics
-- Created: 2025-10-29

-- ============================================
-- 1. USER TOKEN BALANCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  user_email TEXT NOT NULL,
  total_tokens BIGINT NOT NULL DEFAULT 1000000, -- Starting balance: $1M MTK
  available_tokens BIGINT NOT NULL DEFAULT 1000000, -- Available to invest
  total_invested BIGINT NOT NULL DEFAULT 0,
  portfolio_value BIGINT NOT NULL DEFAULT 0,
  all_time_gain_loss BIGINT NOT NULL DEFAULT 0,
  is_ai_investor BOOLEAN NOT NULL DEFAULT false,
  ai_strategy TEXT, -- Strategy name for AI investors
  ai_nickname TEXT, -- Display nickname for AI
  ai_emoji TEXT, -- Emoji avatar
  ai_catchphrase TEXT, -- Personality catchphrase
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_user_token_balances_user_id ON user_token_balances(user_id);
CREATE INDEX idx_user_token_balances_ai ON user_token_balances(is_ai_investor) WHERE is_ai_investor = true;

-- ============================================
-- 2. USER INVESTMENTS (Portfolio Holdings)
-- ============================================
CREATE TABLE IF NOT EXISTS user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pitch_id INTEGER NOT NULL,
  shares_owned DECIMAL(20, 6) NOT NULL DEFAULT 0,
  total_invested BIGINT NOT NULL DEFAULT 0, -- Total MTK spent
  avg_purchase_price DECIMAL(20, 2) NOT NULL, -- Average price per share
  current_value BIGINT NOT NULL DEFAULT 0,
  unrealized_gain_loss BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pitch_id)
);

-- Indexes
CREATE INDEX idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX idx_user_investments_pitch_id ON user_investments(pitch_id);

-- ============================================
-- 3. INVESTMENT TRANSACTIONS (History)
-- ============================================
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pitch_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  shares DECIMAL(20, 6) NOT NULL,
  price_per_share DECIMAL(20, 2) NOT NULL,
  total_amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for history queries
CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_pitch_id ON investment_transactions(pitch_id);
CREATE INDEX idx_investment_transactions_timestamp ON investment_transactions(timestamp DESC);

-- ============================================
-- 4. PITCH MARKET DATA (Real-time pricing)
-- ============================================
CREATE TABLE IF NOT EXISTS pitch_market_data (
  pitch_id INTEGER PRIMARY KEY,
  current_price DECIMAL(20, 2) NOT NULL DEFAULT 100.00, -- Starting price: $100
  total_volume BIGINT NOT NULL DEFAULT 0, -- Total MTK invested
  total_shares_issued DECIMAL(20, 6) NOT NULL DEFAULT 0,
  unique_investors INTEGER NOT NULL DEFAULT 0,
  price_change_24h DECIMAL(10, 2) NOT NULL DEFAULT 0,
  market_rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize market data for 10 Harvard Legends pitches
INSERT INTO pitch_market_data (pitch_id, current_price, total_volume, total_shares_issued, unique_investors, market_rank)
VALUES 
  (1, 100.00, 0, 0, 0, 1),  -- Facebook
  (2, 100.00, 0, 0, 0, 2),  -- Microsoft
  (3, 100.00, 0, 0, 0, 3),  -- Dropbox
  (4, 100.00, 0, 0, 0, 4),  -- Akamai
  (5, 100.00, 0, 0, 0, 5),  -- Reddit
  (6, 100.00, 0, 0, 0, 6),  -- Priceonomics
  (7, 100.00, 0, 0, 0, 7),  -- Quora
  (8, 100.00, 0, 0, 0, 8),  -- Warby Parker
  (9, 100.00, 0, 0, 0, 9),  -- Typeform
  (10, 100.00, 0, 0, 0, 10) -- Booking.com
ON CONFLICT (pitch_id) DO NOTHING;

-- ============================================
-- 5. SEED AI INVESTORS
-- ============================================
INSERT INTO user_token_balances (
  user_id, 
  user_email, 
  total_tokens, 
  available_tokens, 
  is_ai_investor, 
  ai_strategy, 
  ai_nickname, 
  ai_emoji, 
  ai_catchphrase
) VALUES 
  ('ai_boomer', 'ai_boomer@rize.manaboodle.com', 1000000, 1000000, true, 'CONSERVATIVE', 'The Boomer', '', 'I invested in 1975 and never looked back'),
  ('ai_steady', 'ai_steady@rize.manaboodle.com', 1000000, 1000000, true, 'DIVERSIFIED', 'Steady Eddie', '', 'Tortoise beats the hare every time'),
  ('ai_yolo', 'ai_yolo@rize.manaboodle.com', 1000000, 1000000, true, 'ALL_IN', 'YOLO Kid', '', 'Go big or go home!'),
  ('ai_diamond', 'ai_diamond@rize.manaboodle.com', 1000000, 1000000, true, 'HOLD_FOREVER', 'Diamond Hands', '', 'HODL to the moon!'),
  ('ai_silicon', 'ai_silicon@rize.manaboodle.com', 1000000, 1000000, true, 'TECH_ONLY', 'Silicon Brain', '', 'Code is eating the world'),
  ('ai_cloud', 'ai_cloud@rize.manaboodle.com', 1000000, 1000000, true, 'SAAS_ONLY', 'Cloud Surfer', '', 'Subscription > Everything'),
  ('ai_fomo', 'ai_fomo@rize.manaboodle.com', 1000000, 1000000, true, 'MOMENTUM', 'FOMO Master', '', 'Can''t miss the next big thing!'),
  ('ai_hype', 'ai_hype@rize.manaboodle.com', 1000000, 1000000, true, 'TREND_FOLLOW', 'Hype Train', '', 'I ride the wave!'),
  ('ai_contrarian', 'ai_contrarian@rize.manaboodle.com', 1000000, 1000000, true, 'CONTRARIAN', 'The Contrarian', '', 'When others are greedy, I''m fearful'),
  ('ai_oracle', 'ai_oracle@rize.manaboodle.com', 1000000, 1000000, true, 'PERFECT_TIMING', 'The Oracle', '', 'I see what you don''t...')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to calculate share price based on volume
CREATE OR REPLACE FUNCTION calculate_share_price(pitch_id_param INTEGER)
RETURNS DECIMAL(20, 2) AS $$
DECLARE
  base_price DECIMAL(20, 2) := 100.00;
  total_invested BIGINT;
  price_multiplier DECIMAL(10, 6);
BEGIN
  SELECT total_volume INTO total_invested
  FROM pitch_market_data
  WHERE pitch_id = pitch_id_param;
  
  -- Price increases with total investment
  -- Formula: price = 100 * (1 + total_invested / 1000000)
  price_multiplier := 1.0 + (total_invested::DECIMAL / 1000000.0);
  
  RETURN base_price * price_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to update portfolio values
CREATE OR REPLACE FUNCTION update_portfolio_values()
RETURNS void AS $$
BEGIN
  -- Update current value and gain/loss for all investments
  UPDATE user_investments ui
  SET 
    current_value = (shares_owned * pmd.current_price)::BIGINT,
    unrealized_gain_loss = (shares_owned * pmd.current_price)::BIGINT - total_invested,
    updated_at = NOW()
  FROM pitch_market_data pmd
  WHERE ui.pitch_id = pmd.pitch_id
    AND ui.shares_owned > 0;
  
  -- Update user token balances
  UPDATE user_token_balances utb
  SET
    portfolio_value = COALESCE((
      SELECT SUM(current_value)
      FROM user_investments ui
      WHERE ui.user_id = utb.user_id
    ), 0),
    all_time_gain_loss = COALESCE((
      SELECT SUM(unrealized_gain_loss)
      FROM user_investments ui
      WHERE ui.user_id = utb.user_id
    ), 0),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. VIEWS FOR EASY QUERYING
-- ============================================

-- Leaderboard view (combines real + AI investors)
CREATE OR REPLACE VIEW investment_leaderboard AS
SELECT 
  utb.user_id,
  COALESCE(utb.ai_nickname, utb.user_email) as display_name,
  utb.ai_emoji,
  utb.ai_catchphrase,
  utb.is_ai_investor,
  utb.total_tokens,
  utb.available_tokens,
  utb.portfolio_value,
  utb.all_time_gain_loss,
  CASE 
    WHEN utb.total_invested > 0 
    THEN ROUND((utb.all_time_gain_loss::DECIMAL / utb.total_invested::DECIMAL) * 100, 2)
    ELSE 0
  END as gain_loss_percentage,
  COUNT(DISTINCT ui.pitch_id) as companies_invested,
  ROW_NUMBER() OVER (ORDER BY (utb.available_tokens + utb.portfolio_value) DESC) as rank
FROM user_token_balances utb
LEFT JOIN user_investments ui ON utb.user_id = ui.user_id AND ui.shares_owned > 0
GROUP BY utb.user_id, utb.user_email, utb.ai_nickname, utb.ai_emoji, utb.ai_catchphrase, 
         utb.is_ai_investor, utb.total_tokens, utb.available_tokens, utb.portfolio_value, 
         utb.all_time_gain_loss, utb.total_invested;

-- Company rankings view
CREATE OR REPLACE VIEW company_rankings AS
SELECT 
  pmd.pitch_id,
  pmd.current_price,
  pmd.total_volume,
  pmd.total_shares_issued,
  pmd.unique_investors,
  pmd.price_change_24h,
  ROW_NUMBER() OVER (ORDER BY pmd.total_volume DESC) as market_rank,
  pmd.updated_at
FROM pitch_market_data pmd
ORDER BY pmd.total_volume DESC;

-- ============================================
-- 8. UPDATE TRIGGERS
-- ============================================

-- Trigger to update portfolio values after investment changes
CREATE OR REPLACE FUNCTION trigger_update_portfolio_values()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_portfolio_values();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_investment_change
AFTER INSERT OR UPDATE OR DELETE ON user_investments
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_portfolio_values();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Update API routes to use new investment tables
-- 2. Update UI to show investment interface
-- 3. Create admin endpoint to trigger AI investor trades
