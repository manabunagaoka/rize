-- Add pitch content columns to student_projects for AI analysis
-- This allows AI to read elevator pitches, fun facts, and founder stories

-- Step 1: Add NEW columns to student_projects table (elevator_pitch already exists)
ALTER TABLE student_projects
ADD COLUMN IF NOT EXISTS fun_fact TEXT,
ADD COLUMN IF NOT EXISTS founder_story TEXT,
ADD COLUMN IF NOT EXISTS year_founded INTEGER;

-- Note: elevator_pitch and category columns already exist in student_projects

-- Step 2: Insert HM7 legendary company data
-- Map to existing student_projects columns: startup_name, elevator_pitch, founders, category

INSERT INTO student_projects (
  id, user_id, user_email, user_name, startup_name, one_liner, elevator_pitch, 
  category, founders, stage, fun_fact, founder_story, year_founded, 
  status, created_at
)
VALUES
  (1, 'hm7_meta', 'hm7@rize.ai', 'HM7', 'Facebook', 'Connecting the world', 
   'An online directory that connects people through social networks at colleges.',
   'Social Impact', 'Mark Zuckerberg', 'Launched',
   'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
   'Mark Zuckerberg built it in his Harvard dorm room in 2004. Originally just a hot-or-not style site for rating classmates.',
   2004, 'approved', NOW()),
   
  (2, 'hm7_msft', 'hm7@rize.ai', 'HM7', 'Microsoft', 'A computer on every desk', 
   'A computer on every desk and in every home, running our software.',
   'Enterprise/B2B', 'Bill Gates & Paul Allen', 'Launched',
   'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
   'Bill Gates dropped out of Harvard to start Microsoft with Paul Allen in 1975. They wanted to democratize computing.',
   1975, 'approved', NOW()),
   
  (3, 'hm7_dbx', 'hm7@rize.ai', 'HM7', 'Dropbox', 'Your files, anywhere', 
   'Your files, anywhere. One folder that syncs across all your devices.',
   'Enterprise/B2B', 'Drew Houston', 'Launched',
   'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
   'Drew Houston was a Harvard student who got frustrated forgetting USB drives. Built Dropbox to solve his own problem.',
   2007, 'approved', NOW()),
   
  (4, 'hm7_akam', 'hm7@rize.ai', 'HM7', 'Akamai', 'Making the internet fast', 
   'Make the internet faster by serving content from servers closer to users.',
   'Enterprise/B2B', 'Tom Leighton & Danny Lewin', 'Launched',
   'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
   'Tom Leighton (MIT professor) and Danny Lewin (Harvard grad student) solved internet congestion with distributed algorithms.',
   1998, 'approved', NOW()),
   
  (5, 'hm7_rddt', 'hm7@rize.ai', 'HM7', 'Reddit', 'The front page of the internet', 
   'The front page of the internet - where communities create and share content.',
   'Social Impact', 'Steve Huffman & Alexis Ohanian', 'Launched',
   'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',
   'Steve Huffman and Alexis Ohanian were college roommates who wanted to order food by text. Y Combinator told them to build Reddit instead.',
   2005, 'approved', NOW()),
   
  (6, 'hm7_wrby', 'hm7@rize.ai', 'HM7', 'Warby Parker', 'Eyewear for everyone', 
   'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
   'Consumer', 'Neil Blumenthal & team', 'Launched',
   'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',
   'Four Harvard Business School students frustrated by expensive glasses. Built a socially-conscious brand that disrupted the industry.',
   2010, 'approved', NOW()),
   
  (7, 'hm7_bkng', 'hm7@rize.ai', 'HM7', 'Booking.com', 'Book anywhere, instantly', 
   'Book accommodations anywhere in the world with instant confirmation.',
   'Consumer', 'Geert-Jan Bruinsma', 'Launched',
   'Started in Amsterdam, but expanded with Harvard MBA insights. Now books 1.5M room nights per day globally.',
   'Founded in Amsterdam 1996, grew with Harvard Business School strategy. Now the world''s largest accommodation booking platform.',
   1996, 'approved', NOW())
ON CONFLICT (id) DO UPDATE SET
  elevator_pitch = EXCLUDED.elevator_pitch,
  fun_fact = EXCLUDED.fun_fact,
  founder_story = EXCLUDED.founder_story,
  year_founded = EXCLUDED.year_founded;

-- Step 3: Create view for AI to query pitch data
CREATE OR REPLACE VIEW ai_readable_pitches AS
SELECT 
  sp.id::integer as pitch_id,
  sp.startup_name as company_name,
  CASE 
    WHEN sp.id::text = '1' THEN 'META'
    WHEN sp.id::text = '2' THEN 'MSFT'
    WHEN sp.id::text = '3' THEN 'DBX'
    WHEN sp.id::text = '4' THEN 'AKAM'
    WHEN sp.id::text = '5' THEN 'RDDT'
    WHEN sp.id::text = '6' THEN 'WRBY'
    WHEN sp.id::text = '7' THEN 'BKNG'
    ELSE NULL
  END as ticker,
  sp.elevator_pitch,
  sp.fun_fact,
  sp.founder_story,
  sp.category,
  sp.year_founded,
  pmd.current_price,
  pmd.price_change_24h,
  pmd.updated_at as price_updated_at
FROM student_projects sp
LEFT JOIN pitch_market_data pmd ON sp.id::integer = pmd.pitch_id
WHERE sp.id::integer BETWEEN 1 AND 7  -- Only HM7 companies
ORDER BY sp.id;

-- Step 4: Grant access to the view
GRANT SELECT ON ai_readable_pitches TO anon, authenticated;

-- Step 5: Verify the data
SELECT pitch_id, company_name, ticker, category, 
       LEFT(elevator_pitch, 50) as pitch_preview,
       current_price
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
ORDER BY pitch_id;
