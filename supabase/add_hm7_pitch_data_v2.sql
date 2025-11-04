-- Add pitch content for AI analysis - FLEXIBLE DESIGN
-- HM7 companies: Fixed UUIDs matching pitch_market_data (pitch_id 1-7)
-- Student projects: Auto-generated UUIDs, filled during signup
-- Investors: Access via class code, guest pass, or SSO

-- Step 1: Add columns for rich pitch content
ALTER TABLE student_projects
ADD COLUMN IF NOT EXISTS fun_fact TEXT,
ADD COLUMN IF NOT EXISTS founder_story TEXT,
ADD COLUMN IF NOT EXISTS year_founded INTEGER,
ADD COLUMN IF NOT EXISTS ticker TEXT;  -- Stock ticker (HM7 only)

-- Step 2: Create helper function to map UUID→pitch_id for HM7 companies
CREATE OR REPLACE FUNCTION get_pitch_id_from_uuid(project_uuid UUID) RETURNS INTEGER AS $$
BEGIN
  CASE project_uuid::text
    WHEN '00000000-0000-0000-0000-000000000001' THEN RETURN 1;
    WHEN '00000000-0000-0000-0000-000000000002' THEN RETURN 2;
    WHEN '00000000-0000-0000-0000-000000000003' THEN RETURN 3;
    WHEN '00000000-0000-0000-0000-000000000004' THEN RETURN 4;
    WHEN '00000000-0000-0000-0000-000000000005' THEN RETURN 5;
    WHEN '00000000-0000-0000-0000-000000000006' THEN RETURN 6;
    WHEN '00000000-0000-0000-0000-000000000007' THEN RETURN 7;
    ELSE RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Insert HM7 legendary companies (fixed UUIDs)
INSERT INTO student_projects (
  id, user_id, user_email, startup_name, one_liner, elevator_pitch, 
  category, founders, stage, fun_fact, founder_story, year_founded, ticker, status
)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'hm7_meta', 'hm7@rize.ai', 
   'Facebook', 'Connecting the world', 
   'An online directory that connects people through social networks at colleges.',
   'Social Impact', 'Mark Zuckerberg', 'Launched',
   'Started as "TheFacebook" - exclusive to Harvard students with a .edu email.',
   'Mark Zuckerberg built it in his Harvard dorm room in 2004.',
   2004, 'META', 'approved'),
   
  ('00000000-0000-0000-0000-000000000002'::uuid, 'hm7_msft', 'hm7@rize.ai',
   'Microsoft', 'A computer on every desk', 
   'A computer on every desk and in every home, running our software.',
   'Enterprise/B2B', 'Bill Gates & Paul Allen', 'Launched',
   'Gates wrote a BASIC interpreter in his dorm. Sold it before testing - it worked.',
   'Bill Gates dropped out of Harvard to start Microsoft with Paul Allen in 1975.',
   1975, 'MSFT', 'approved'),
   
  ('00000000-0000-0000-0000-000000000003'::uuid, 'hm7_dbx', 'hm7@rize.ai',
   'Dropbox', 'Your files, anywhere', 
   'Your files, anywhere. One folder that syncs across all your devices.',
   'Enterprise/B2B', 'Drew Houston', 'Launched',
   'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride.',
   'Drew Houston was a Harvard student frustrated by forgetting USB drives.',
   2007, 'DBX', 'approved'),
   
  ('00000000-0000-0000-0000-000000000004'::uuid, 'hm7_akam', 'hm7@rize.ai',
   'Akamai', 'Making the internet fast', 
   'Make the internet faster by serving content from servers closer to users.',
   'Enterprise/B2B', 'Tom Leighton & Danny Lewin', 'Launched',
   'Started as MIT/Harvard math project. Now delivers 30% of all web traffic.',
   'Tom Leighton (MIT) and Danny Lewin (Harvard) solved internet congestion.',
   1998, 'AKAM', 'approved'),
   
  ('00000000-0000-0000-0000-000000000005'::uuid, 'hm7_rddt', 'hm7@rize.ai',
   'Reddit', 'Front page of the internet', 
   'The front page of the internet - where communities create and share content.',
   'Social Impact', 'Steve Huffman & Alexis Ohanian', 'Launched',
   'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks.',
   'Steve Huffman and Alexis Ohanian were college roommates at University of Virginia.',
   2005, 'RDDT', 'approved'),
   
  ('00000000-0000-0000-0000-000000000006'::uuid, 'hm7_wrby', 'hm7@rize.ai',
   'Warby Parker', 'Eyewear for everyone', 
   'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
   'Consumer', 'Neil Blumenthal & team', 'Launched',
   'Started because founder lost glasses and was shocked by $500 price. Buy a pair, give a pair.',
   'Four Harvard Business School students frustrated by expensive glasses.',
   2010, 'WRBY', 'approved'),
   
  ('00000000-0000-0000-0000-000000000007'::uuid, 'hm7_bkng', 'hm7@rize.ai',
   'Booking.com', 'Book anywhere, instantly', 
   'Book accommodations anywhere in the world with instant confirmation.',
   'Consumer', 'Geert-Jan Bruinsma', 'Launched',
   'Started in Amsterdam, expanded with Harvard MBA insights. 1.5M room nights/day.',
   'Founded in Amsterdam 1996, grew with Harvard Business School strategy.',
   1996, 'BKNG', 'approved')
ON CONFLICT (id) DO UPDATE SET
  elevator_pitch = EXCLUDED.elevator_pitch,
  fun_fact = EXCLUDED.fun_fact,
  founder_story = EXCLUDED.founder_story,
  year_founded = EXCLUDED.year_founded,
  ticker = EXCLUDED.ticker;

-- Step 4: Create AI-readable view (works for HM7 + future student projects)
CREATE OR REPLACE VIEW ai_readable_pitches AS
SELECT 
  get_pitch_id_from_uuid(sp.id) as pitch_id,
  sp.startup_name as company_name,
  sp.ticker,
  sp.elevator_pitch,
  sp.fun_fact,
  sp.founder_story,
  sp.category,
  sp.year_founded,
  sp.founders,
  sp.stage,
  pmd.current_price,
  pmd.price_change_24h,
  pmd.updated_at as price_updated_at
FROM student_projects sp
LEFT JOIN pitch_market_data pmd ON get_pitch_id_from_uuid(sp.id) = pmd.pitch_id
WHERE sp.ticker IS NOT NULL  -- Only tradeable companies (HM7 for now)
  AND sp.status = 'approved'
ORDER BY get_pitch_id_from_uuid(sp.id);

-- Step 5: Grant access
GRANT SELECT ON ai_readable_pitches TO anon, authenticated;

-- Step 6: Verify
SELECT pitch_id, company_name, ticker, category, 
       LEFT(elevator_pitch, 40) as pitch,
       current_price
FROM ai_readable_pitches
ORDER BY pitch_id;

-- FUTURE: When students submit, their projects will:
-- 1. Get auto-generated UUID (not fixed like HM7)
-- 2. Fill elevator_pitch, category, founders during signup
-- 3. Optionally add fun_fact, founder_story later
-- 4. Get ticker=NULL (not tradeable unless admin approves for IPO)
