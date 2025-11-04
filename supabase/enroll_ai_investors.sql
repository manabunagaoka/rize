-- ============================================
-- FIX: Change competition_participants.user_id to TEXT
-- This allows both real users (UUIDs) and AI investors (text IDs) to participate
-- ============================================

-- Drop ALL views that depend on competition_participants.user_id
DROP VIEW IF EXISTS competition_investor_leaderboard CASCADE;
DROP VIEW IF EXISTS competition_stats CASCADE;
DROP VIEW IF EXISTS competition_founder_leaderboard CASCADE;

-- Change user_id from UUID to TEXT to support AI investors
ALTER TABLE competition_participants 
ALTER COLUMN user_id TYPE TEXT;

-- Recreate the founder leaderboard view
CREATE OR REPLACE VIEW competition_founder_leaderboard AS
SELECT 
  sc.competition_id,
  sp.id as startup_id,
  sp.user_id as founder_id,
  0::BIGINT as market_cap,
  RANK() OVER (PARTITION BY sc.competition_id ORDER BY sp.created_at DESC) as rank
FROM startup_competitions sc
JOIN student_projects sp ON sp.id = sc.startup_id
WHERE sc.is_active = true;

-- Recreate the investor leaderboard view with TEXT user_id
CREATE OR REPLACE VIEW competition_investor_leaderboard AS
SELECT 
  cp.competition_id,
  cp.user_id,
  utb.total_tokens as balance,
  RANK() OVER (PARTITION BY cp.competition_id ORDER BY utb.total_tokens DESC) as rank
FROM competition_participants cp
JOIN user_token_balances utb ON utb.user_id = cp.user_id
WHERE cp.role IN ('investor', 'both');

-- Recreate the competition stats view
CREATE OR REPLACE VIEW competition_stats AS
SELECT 
  c.id as competition_id,
  c.name,
  c.slug,
  c.status,
  COUNT(DISTINCT sc.startup_id) as startup_count,
  COUNT(DISTINCT cp.user_id) as participant_count,
  COUNT(DISTINCT CASE WHEN cp.role IN ('founder', 'both') THEN cp.user_id END) as founder_count,
  COUNT(DISTINCT CASE WHEN cp.role IN ('investor', 'both') THEN cp.user_id END) as investor_count
FROM competitions c
LEFT JOIN startup_competitions sc ON sc.competition_id = c.id AND sc.is_active = true
LEFT JOIN competition_participants cp ON cp.competition_id = c.id
GROUP BY c.id, c.name, c.slug, c.status;

-- Now insert all AI investors into HM7 competition
INSERT INTO competition_participants (user_id, competition_id, role)
SELECT 
  utb.user_id,
  c.id,
  'investor'
FROM user_token_balances utb
CROSS JOIN competitions c
WHERE utb.is_ai_investor = true
  AND c.slug = 'hm7-fall-2025'
ON CONFLICT (user_id, competition_id) DO NOTHING;

-- Verify AI investors are enrolled
SELECT 
  cp.user_id,
  utb.ai_nickname,
  utb.ai_strategy,
  utb.total_tokens,
  c.name as competition
FROM competition_participants cp
JOIN user_token_balances utb ON utb.user_id = cp.user_id
JOIN competitions c ON c.id = cp.competition_id
WHERE utb.is_ai_investor = true
  AND c.slug = 'hm7-fall-2025'
ORDER BY utb.total_tokens DESC;

-- Check updated competition stats
SELECT * FROM competition_stats WHERE slug = 'hm7-fall-2025';

-- View the HM7 investor leaderboard (should show 10 AI investors)
SELECT 
  c.name as competition,
  utb.ai_nickname as nickname,
  utb.ai_emoji as emoji,
  utb.ai_strategy as strategy,
  cil.balance,
  cil.rank
FROM competition_investor_leaderboard cil
JOIN competitions c ON c.id = cil.competition_id
JOIN user_token_balances utb ON utb.user_id = cil.user_id
WHERE c.slug = 'hm7-fall-2025'
  AND utb.is_ai_investor = true
ORDER BY cil.rank;
