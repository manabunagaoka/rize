-- ============================================
-- UNICORN COMPETITIONS SYSTEM
-- Multi-competition support with notifications
-- ============================================

-- ============================================
-- 1. COMPETITIONS TABLE
-- ============================================
-- Check if table exists and add missing columns
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'competitions') THEN
    CREATE TABLE competitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      is_global_market BOOLEAN DEFAULT false,
      registration_start TIMESTAMP,
      registration_end TIMESTAMP,
      trading_start TIMESTAMP,
      trading_end TIMESTAMP,
      judging_date TIMESTAMP,
      status VARCHAR(20) DEFAULT 'draft',
      prize_description TEXT,
      is_featured BOOLEAN DEFAULT false,
      banner_image_url TEXT,
      created_by UUID,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'slug') THEN
      ALTER TABLE competitions ADD COLUMN slug VARCHAR(100);
      -- Generate slugs for existing rows
      UPDATE competitions SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
      ALTER TABLE competitions ALTER COLUMN slug SET NOT NULL;
      ALTER TABLE competitions ADD CONSTRAINT competitions_slug_unique UNIQUE (slug);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'is_global_market') THEN
      ALTER TABLE competitions ADD COLUMN is_global_market BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'prize_description') THEN
      ALTER TABLE competitions ADD COLUMN prize_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'is_featured') THEN
      ALTER TABLE competitions ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'banner_image_url') THEN
      ALTER TABLE competitions ADD COLUMN banner_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'trading_start') THEN
      ALTER TABLE competitions ADD COLUMN trading_start TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'trading_end') THEN
      ALTER TABLE competitions ADD COLUMN trading_end TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'judging_date') THEN
      ALTER TABLE competitions ADD COLUMN judging_date TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'registration_start') THEN
      ALTER TABLE competitions ADD COLUMN registration_start TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'registration_end') THEN
      ALTER TABLE competitions ADD COLUMN registration_end TIMESTAMP;
    END IF;
    
    -- Add type column with default if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'type') THEN
      ALTER TABLE competitions ADD COLUMN type VARCHAR(50) DEFAULT 'competition';
    END IF;
    
    -- Make created_by nullable if it exists and is NOT NULL
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'competitions' 
      AND column_name = 'created_by'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE competitions ALTER COLUMN created_by DROP NOT NULL;
    END IF;
    
    -- Drop existing type check constraint if it exists
    IF EXISTS (
      SELECT FROM information_schema.constraint_column_usage 
      WHERE table_name = 'competitions' 
      AND constraint_name = 'competitions_type_check'
    ) THEN
      ALTER TABLE competitions DROP CONSTRAINT competitions_type_check;
    END IF;
    
    -- Drop existing status check constraint if it exists
    IF EXISTS (
      SELECT FROM information_schema.constraint_column_usage 
      WHERE table_name = 'competitions' 
      AND constraint_name = 'competitions_status_check'
    ) THEN
      ALTER TABLE competitions DROP CONSTRAINT competitions_status_check;
    END IF;
  END IF;
END $$;

-- Ensure id column has correct type and default UUID generation
DO $$
DECLARE
  id_type TEXT;
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'id') THEN
    -- Check current data type of id column
    SELECT data_type INTO id_type
    FROM information_schema.columns 
    WHERE table_name = 'competitions' 
    AND column_name = 'id';
    
    -- If id is TEXT, convert it to UUID
    IF id_type = 'text' THEN
      -- Drop dependent views first (including any that use competition_id in related tables)
      DROP VIEW IF EXISTS competition_stats CASCADE;
      DROP VIEW IF EXISTS competition_founder_leaderboard CASCADE;
      DROP VIEW IF EXISTS competition_investor_leaderboard CASCADE;
      DROP VIEW IF EXISTS legendary_pitch_rankings CASCADE;
      DROP VIEW IF EXISTS project_vote_summary CASCADE;
      DROP VIEW IF EXISTS competition_leaderboard CASCADE;
      DROP VIEW IF EXISTS project_rankings CASCADE;
      
      -- Drop foreign key constraints that reference competitions.id
      ALTER TABLE IF EXISTS legendary_pitch_votes DROP CONSTRAINT IF EXISTS legendary_pitch_votes_competition_id_fkey;
      ALTER TABLE IF EXISTS startup_competitions DROP CONSTRAINT IF EXISTS startup_competitions_competition_id_fkey;
      ALTER TABLE IF EXISTS competition_participants DROP CONSTRAINT IF EXISTS competition_participants_competition_id_fkey;
      ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_competition_id_fkey;
      ALTER TABLE IF EXISTS student_projects DROP CONSTRAINT IF EXISTS student_projects_competition_id_fkey;
      ALTER TABLE IF EXISTS project_votes DROP CONSTRAINT IF EXISTS project_votes_competition_id_fkey;
      
      -- Create temporary mapping table to preserve relationships
      CREATE TEMP TABLE IF NOT EXISTS competition_id_mapping (
        old_id TEXT PRIMARY KEY,
        new_id UUID DEFAULT gen_random_uuid()
      );
      
      -- Map all existing competition IDs to new UUIDs
      INSERT INTO competition_id_mapping (old_id)
      SELECT DISTINCT id FROM competitions
      ON CONFLICT (old_id) DO NOTHING;
      
      -- Update competitions table with new UUIDs
      UPDATE competitions c
      SET id = m.new_id::text
      FROM competition_id_mapping m
      WHERE c.id = m.old_id;
      
      -- Update foreign key columns in related tables using the mapping
      UPDATE legendary_pitch_votes lpv
      SET competition_id = m.new_id::text
      FROM competition_id_mapping m
      WHERE lpv.competition_id = m.old_id;
      
      UPDATE student_projects sp
      SET competition_id = m.new_id::text
      FROM competition_id_mapping m
      WHERE sp.competition_id = m.old_id;
      
      UPDATE project_votes pv
      SET competition_id = m.new_id::text
      FROM competition_id_mapping m
      WHERE pv.competition_id = m.old_id;
      
      -- Now convert column types from TEXT to UUID
      ALTER TABLE competitions ALTER COLUMN id TYPE UUID USING id::uuid;
      ALTER TABLE competitions ALTER COLUMN id SET DEFAULT gen_random_uuid();
      
      -- Drop defaults on foreign key columns before converting (they may not be UUID-compatible)
      ALTER TABLE IF EXISTS legendary_pitch_votes ALTER COLUMN competition_id DROP DEFAULT;
      ALTER TABLE IF EXISTS startup_competitions ALTER COLUMN competition_id DROP DEFAULT;
      ALTER TABLE IF EXISTS competition_participants ALTER COLUMN competition_id DROP DEFAULT;
      ALTER TABLE IF EXISTS notifications ALTER COLUMN competition_id DROP DEFAULT;
      ALTER TABLE IF EXISTS student_projects ALTER COLUMN competition_id DROP DEFAULT;
      ALTER TABLE IF EXISTS project_votes ALTER COLUMN competition_id DROP DEFAULT;
      
      -- Convert foreign key columns in related tables
      ALTER TABLE IF EXISTS legendary_pitch_votes ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      ALTER TABLE IF EXISTS startup_competitions ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      ALTER TABLE IF EXISTS competition_participants ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      ALTER TABLE IF EXISTS notifications ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      ALTER TABLE IF EXISTS student_projects ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      ALTER TABLE IF EXISTS project_votes ALTER COLUMN competition_id TYPE UUID USING competition_id::uuid;
      
      -- Recreate foreign key constraints
      ALTER TABLE IF EXISTS legendary_pitch_votes ADD CONSTRAINT legendary_pitch_votes_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
      ALTER TABLE IF EXISTS startup_competitions ADD CONSTRAINT startup_competitions_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
      ALTER TABLE IF EXISTS competition_participants ADD CONSTRAINT competition_participants_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
      ALTER TABLE IF EXISTS notifications ADD CONSTRAINT notifications_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id);
      ALTER TABLE IF EXISTS student_projects ADD CONSTRAINT student_projects_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL;
      ALTER TABLE IF EXISTS project_votes ADD CONSTRAINT project_votes_competition_id_fkey 
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
    ELSIF id_type = 'uuid' THEN
      -- Check if id has default value
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'competitions' 
        AND column_name = 'id' 
        AND column_default IS NOT NULL
      ) THEN
        ALTER TABLE competitions ALTER COLUMN id SET DEFAULT gen_random_uuid();
      END IF;
    END IF;
  END IF;
END $$;

-- Create the special "Global Market" competition
INSERT INTO competitions (id, name, slug, is_global_market, status, description, type)
VALUES (
  gen_random_uuid(),
  'Global Market',
  'global',
  true,
  'active',
  'Trade startups from all competitions. No prizes, just market exposure.',
  'market'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. STARTUP-COMPETITION RELATIONSHIP
-- ============================================
CREATE TABLE IF NOT EXISTS startup_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES student_projects(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  
  -- Tracking
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Unique constraint: startup can only join competition once
  UNIQUE(startup_id, competition_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_startup_competitions_startup ON startup_competitions(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_competitions_competition ON startup_competitions(competition_id);

-- ============================================
-- 3. COMPETITION PARTICIPANTS
-- ============================================
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  
  -- Role: 'founder', 'investor', 'both'
  role VARCHAR(20) DEFAULT 'investor',
  
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_comp ON competition_participants(competition_id);

-- ============================================
-- 4. NOTIFICATIONS SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type: 'new_competition', 'competition_opening', 'competition_reminder', 'new_startup', 'startup_update'
  type VARCHAR(50) NOT NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Targeting: 'all', 'founders', 'investors', 'students', 'competition_participants'
  target_audience VARCHAR(50) DEFAULT 'all',
  competition_id UUID REFERENCES competitions(id), -- If competition-specific
  
  -- Action
  action_url VARCHAR(255),
  action_text VARCHAR(100),
  
  -- Scheduling
  send_at TIMESTAMP DEFAULT NOW(),
  sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent, send_at);

-- ============================================
-- 5. USER NOTIFICATIONS (Inbox)
-- ============================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, notification_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, read_at);

-- ============================================
-- 6. NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id UUID PRIMARY KEY,
  
  -- Email preferences
  email_new_competitions BOOLEAN DEFAULT true,
  email_competition_reminders BOOLEAN DEFAULT true,
  email_new_startups BOOLEAN DEFAULT false,
  email_weekly_digest BOOLEAN DEFAULT true,
  
  -- In-app preferences
  notify_new_competitions BOOLEAN DEFAULT true,
  notify_competition_updates BOOLEAN DEFAULT true,
  notify_startup_updates BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. VIEWS FOR EASY QUERIES
-- ============================================

-- Competition leaderboard (founders by market cap)
-- Note: Market cap calculation depends on whether pitch_market_data exists for the startup
-- For now, we'll use a placeholder of 0 since we need to join with pitch_market_data
-- which uses INTEGER pitch_id (not UUID student_project id)
CREATE OR REPLACE VIEW competition_founder_leaderboard AS
SELECT 
  sc.competition_id,
  sp.id as startup_id,
  sp.user_id as founder_id,
  0::BIGINT as market_cap,  -- Placeholder: will calculate from pitch_market_data later
  RANK() OVER (PARTITION BY sc.competition_id ORDER BY sp.created_at DESC) as rank
FROM startup_competitions sc
JOIN student_projects sp ON sp.id = sc.startup_id
WHERE sc.is_active = true;

-- Competition leaderboard (investors by balance)
CREATE OR REPLACE VIEW competition_investor_leaderboard AS
SELECT 
  cp.competition_id,
  cp.user_id,
  utb.total_tokens as balance,
  RANK() OVER (PARTITION BY cp.competition_id ORDER BY utb.total_tokens DESC) as rank
FROM competition_participants cp
JOIN user_token_balances utb ON utb.user_id = cp.user_id::TEXT
WHERE cp.role IN ('investor', 'both');

-- Competition stats
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

-- ============================================
-- 8. FUNCTIONS
-- ============================================

-- Function: Auto-add founder as participant when joining competition
CREATE OR REPLACE FUNCTION add_founder_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  -- When startup joins competition, add founder as participant with role 'founder'
  INSERT INTO competition_participants (user_id, competition_id, role)
  SELECT sp.user_id, NEW.competition_id, 'founder'
  FROM student_projects sp
  WHERE sp.id = NEW.startup_id
  ON CONFLICT (user_id, competition_id) DO UPDATE
  SET role = CASE 
    WHEN competition_participants.role = 'investor' THEN 'both'
    ELSE competition_participants.role
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_founder_as_participant
AFTER INSERT ON startup_competitions
FOR EACH ROW
EXECUTE FUNCTION add_founder_as_participant();

-- Function: Create notification for all users
CREATE OR REPLACE FUNCTION create_notifications_for_users(
  p_notification_id UUID,
  p_target_audience VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  -- Insert notification for all users based on preferences
  -- Note: This function requires users table to exist
  -- For now, just return 0 if users table doesn't exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT DISTINCT u.id, p_notification_id
    FROM users u
    JOIN user_notification_settings uns ON uns.user_id = u.id
    WHERE 
      CASE 
        WHEN p_target_audience = 'all' THEN uns.notify_new_competitions = true
        WHEN p_target_audience = 'founders' THEN true -- Add more logic later
        WHEN p_target_audience = 'investors' THEN true
        ELSE true
      END;
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
  END IF;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. SEED COMPETITIONS
-- ============================================

-- HM7 Fall 2025 (existing startups)
INSERT INTO competitions (
  id, name, slug, status, description, is_featured,
  trading_start, trading_end,
  prize_description, type
)
VALUES (
  gen_random_uuid(),
  'HM7 - Fall 2025',
  'hm7-fall-2025',
  'active',
  'Trade 7 Harvard startups competing for market leadership. Live competition testing investor sentiment.',
  true,
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '45 days',
  'Recognition as top investor. Bragging rights among Harvard students.',
  'competition'
)
ON CONFLICT (slug) DO NOTHING;

-- President's Innovation Challenge 2026
INSERT INTO competitions (
  id, name, slug, status, description, is_featured,
  registration_start, registration_end, trading_start, judging_date,
  prize_description, type
)
VALUES (
  gen_random_uuid(),
  'President''s Innovation Challenge 2026',
  'presidents-2026',
  'upcoming',
  'Harvard''s premier startup competition. Open to all Harvard students. Compete for funding, mentorship, and recognition.',
  true,
  '2026-01-15 09:00:00',
  '2026-01-31 23:59:59',
  '2026-02-01 00:00:00',
  '2026-05-01 00:00:00',
  'Grand Prize: $50,000 + Harvard Innovation Lab Membership | Runner-up: $10,000 each (3 teams)',
  'competition'
)
ON CONFLICT (slug) DO NOTHING;

-- HIVE 2026
INSERT INTO competitions (
  id, name, slug, status, description, is_featured,
  registration_start, registration_end, trading_start, judging_date,
  prize_description, type
)
VALUES (
  gen_random_uuid(),
  'HIVE 2026',
  'hive-2026',
  'upcoming',
  'Harvard Innovation and Ventures in Education. Education technology and innovation startups compete for funding and accelerator access.',
  true,
  '2026-02-01 09:00:00',
  '2026-02-15 23:59:59',
  '2026-02-16 00:00:00',
  '2026-05-15 00:00:00',
  'Grand Prize: $25,000 + EdTech Accelerator Access | Runner-up: $5,000 + Mentorship',
  'competition'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
