-- Status Tier System for Investors and Founders
-- Adds tier rankings, retirement status, and auto-award logic

-- ============================================
-- 1. ADD TIER COLUMNS TO user_token_balances
-- ============================================

ALTER TABLE user_token_balances 
ADD COLUMN IF NOT EXISTS investor_tier TEXT,
ADD COLUMN IF NOT EXISTS founder_tier TEXT,
ADD COLUMN IF NOT EXISTS investor_tier_earned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS founder_tier_earned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS ai_retirement_goal BIGINT,
ADD COLUMN IF NOT EXISTS ai_retirement_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_personality_prompt TEXT;

-- Add check constraints
ALTER TABLE user_token_balances
ADD CONSTRAINT check_investor_tier 
  CHECK (investor_tier IN ('TITAN', 'ORACLE', 'ALCHEMIST', NULL));

ALTER TABLE user_token_balances
ADD CONSTRAINT check_founder_tier 
  CHECK (founder_tier IN ('UNICORN', 'PHOENIX', 'DRAGON', NULL));

ALTER TABLE user_token_balances
ADD CONSTRAINT check_ai_status 
  CHECK (ai_status IN ('ACTIVE', 'RETIRED', 'LEGENDARY', 'PAUSED'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_tier ON user_token_balances(investor_tier) WHERE investor_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_status ON user_token_balances(ai_status) WHERE is_ai_investor = true;

-- ============================================
-- 2. FUNCTION: Auto-Award Investor Tiers
-- ============================================

CREATE OR REPLACE FUNCTION award_investor_tiers()
RETURNS void AS $$
BEGIN
  -- Reset all investor tiers first
  UPDATE user_token_balances 
  SET investor_tier = NULL 
  WHERE investor_tier IS NOT NULL;
  
  -- Award top 3 based on portfolio value (AI + Human investors combined)
  WITH ranked_investors AS (
    SELECT 
      user_id, 
      portfolio_value,
      ROW_NUMBER() OVER (ORDER BY portfolio_value DESC) as rank
    FROM user_token_balances
    WHERE (is_ai_investor = true OR username IS NOT NULL)
      AND ai_status IN ('ACTIVE', 'LEGENDARY') -- Exclude retired/paused
  )
  UPDATE user_token_balances utb
  SET 
    investor_tier = CASE 
      WHEN ri.rank = 1 THEN 'TITAN'
      WHEN ri.rank = 2 THEN 'ORACLE'
      WHEN ri.rank = 3 THEN 'ALCHEMIST'
      ELSE NULL
    END,
    investor_tier_earned_at = CASE 
      WHEN ri.rank <= 3 AND utb.investor_tier IS NULL THEN NOW()
      ELSE utb.investor_tier_earned_at
    END
  FROM ranked_investors ri
  WHERE utb.user_id = ri.user_id AND ri.rank <= 3;
  
  RAISE NOTICE 'Investor tiers awarded to top 3 performers';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. FUNCTION: Auto-Award Founder Tiers
-- ============================================
-- Founder tiers based on STARTUP VALUATION (total capital raised)
-- Investor tiers based on PERSONAL PORTFOLIO VALUE (net worth)

CREATE OR REPLACE FUNCTION award_founder_tiers()
RETURNS void AS $$
BEGIN
  -- Reset all founder tiers first
  UPDATE user_token_balances 
  SET founder_tier = NULL 
  WHERE founder_tier IS NOT NULL;
  
  -- Award top 3 founders based on their startup's total investment raised
  -- This measures startup valuation/success, not personal wealth
  -- NOTE: This will work once H2026 launches with approved student projects
  -- For now, no founder tiers will be awarded (no approved projects yet)
  WITH founder_rankings AS (
    SELECT 
      sp.user_id,
      SUM(ui.total_invested) as total_raised,
      ROW_NUMBER() OVER (ORDER BY SUM(ui.total_invested) DESC) as rank
    FROM student_projects sp
    LEFT JOIN user_investments ui ON ui.pitch_id = sp.id::integer
    WHERE sp.status = 'approved'
    GROUP BY sp.user_id
  )
  UPDATE user_token_balances utb
  SET 
    founder_tier = CASE 
      WHEN fr.rank = 1 THEN 'UNICORN'
      WHEN fr.rank = 2 THEN 'PHOENIX'
      WHEN fr.rank = 3 THEN 'DRAGON'
      ELSE NULL
    END,
    founder_tier_earned_at = CASE 
      WHEN fr.rank <= 3 AND utb.founder_tier IS NULL THEN NOW()
      ELSE utb.founder_tier_earned_at
    END
  FROM founder_rankings fr
  WHERE utb.user_id = fr.user_id AND fr.rank <= 3;
  
  RAISE NOTICE 'Founder tiers awarded to top 3 startups';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. FUNCTION: Check AI Retirement Goals
-- ============================================

CREATE OR REPLACE FUNCTION check_ai_retirement()
RETURNS void AS $$
DECLARE
  ai_record RECORD;
BEGIN
  FOR ai_record IN 
    SELECT user_id, ai_nickname, portfolio_value, ai_retirement_goal
    FROM user_token_balances
    WHERE is_ai_investor = true
      AND ai_status = 'ACTIVE'
      AND ai_retirement_goal IS NOT NULL
      AND portfolio_value >= ai_retirement_goal
  LOOP
    -- Retire the AI
    UPDATE user_token_balances
    SET 
      ai_status = 'RETIRED',
      ai_retirement_date = NOW(),
      ai_catchphrase = ai_catchphrase || ' 🎉 RETIRED AS A LEGEND!'
    WHERE user_id = ai_record.user_id;
    
    -- Post retirement announcement
    INSERT INTO news (title, content, type, published, created_at)
    VALUES (
      ai_record.ai_nickname || ' Retires!',
      ai_record.ai_nickname || ' has achieved their retirement goal of $' || 
        (ai_record.ai_retirement_goal / 1000000)::text || 'M and is retiring as a legend! Final portfolio: $' ||
        (ai_record.portfolio_value / 1000000)::text || 'M',
      'ADMIN',
      true,
      NOW()
    );
    
    RAISE NOTICE 'AI % retired with $%', ai_record.ai_nickname, ai_record.portfolio_value;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER: Award Tiers After Portfolio Updates
-- ============================================

CREATE OR REPLACE FUNCTION trigger_award_tiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Award tiers whenever portfolio values change
  PERFORM award_investor_tiers();
  PERFORM check_ai_retirement();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS after_portfolio_update ON user_token_balances;

-- Create trigger on portfolio_value updates
CREATE TRIGGER after_portfolio_update
  AFTER UPDATE OF portfolio_value ON user_token_balances
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- ============================================
-- 6. INITIALIZE: Award Current Tiers
-- ============================================

-- Award tiers for existing users
SELECT award_investor_tiers();
SELECT award_founder_tiers();

-- NOTE: AI retirement goals are NULL by default
-- Set them manually via admin interface when ready

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- View current tier standings (Top 10 by portfolio value)
-- Shows both investor and founder tiers since one person can have both
SELECT 
  COALESCE(username, ai_nickname) as name,
  CASE 
    WHEN is_ai_investor THEN 'AI'
    ELSE 'Human'
  END as type,
  investor_tier,
  CASE 
    WHEN investor_tier IS NOT NULL AND investor_tier_earned_at IS NOT NULL
    THEN EXTRACT(DAY FROM NOW() - investor_tier_earned_at)::integer 
    ELSE NULL 
  END as investor_days,
  founder_tier,
  CASE 
    WHEN founder_tier IS NOT NULL AND founder_tier_earned_at IS NOT NULL
    THEN EXTRACT(DAY FROM NOW() - founder_tier_earned_at)::integer 
    ELSE NULL 
  END as founder_days,
  ai_status,
  portfolio_value
FROM user_token_balances
WHERE (is_ai_investor = true OR username IS NOT NULL)
  AND (ai_status IN ('ACTIVE', 'LEGENDARY') OR ai_status IS NULL)
ORDER BY portfolio_value DESC
LIMIT 10;

-- View AI retirement goals
SELECT 
  ai_nickname,
  ai_strategy,
  portfolio_value,
  ai_retirement_goal,
  ai_status,
  ROUND((portfolio_value::numeric / ai_retirement_goal::numeric) * 100, 1) as progress_pct
FROM user_token_balances
WHERE is_ai_investor = true
  AND ai_retirement_goal IS NOT NULL
ORDER BY progress_pct DESC;
