-- ========================================
-- IMMEDIATE FIXES FOR NOV 18, 2025
-- Fix #1: Categories + Fix #3: Add Sector System
-- ========================================

-- ========================================
-- FIX #1: RECATEGORIZE META & RDDT
-- ========================================

-- Fix incorrect Social Impact categorization
-- NOTE: ai_readable_pitches is a VIEW - must update base table (student_projects)
UPDATE student_projects 
SET category = 'Consumer' 
WHERE ticker IN ('META', 'RDDT');

-- Verify the fix (query the view)
SELECT 
  category,
  COUNT(*) as companies,
  STRING_AGG(ticker, ', ' ORDER BY ticker) as tickers
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
GROUP BY category
ORDER BY category;

-- ========================================
-- FIX #3: ADD SECTOR DIMENSION
-- ========================================

-- Add sector column to base table (student_projects)
ALTER TABLE student_projects 
ADD COLUMN IF NOT EXISTS sector TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_student_projects_sector 
ON student_projects(sector);

-- Populate sectors for existing HM7 companies
UPDATE student_projects SET sector = 'Technology' WHERE ticker IN ('MSFT', 'DBX', 'AKAM');
UPDATE student_projects SET sector = 'Media & Social' WHERE ticker IN ('META', 'RDDT');
UPDATE student_projects SET sector = 'Travel & Hospitality' WHERE ticker = 'BKNG';
UPDATE student_projects SET sector = 'Consumer Goods' WHERE ticker = 'WRBY';

-- Update VIEW to include sector column
-- Must drop and recreate to change column order
DROP VIEW IF EXISTS ai_readable_pitches;

CREATE VIEW ai_readable_pitches AS
SELECT 
  get_pitch_id_from_uuid(sp.id) as pitch_id,
  sp.startup_name as company_name,
  sp.ticker,
  sp.elevator_pitch,
  sp.fun_fact,
  sp.founder_story,
  sp.category,
  sp.sector,  -- NEW: Include sector
  sp.year_founded,
  sp.founders,
  sp.stage,
  pmd.current_price,
  pmd.price_change_24h,
  pmd.updated_at as price_updated_at
FROM student_projects sp
LEFT JOIN pitch_market_data pmd ON get_pitch_id_from_uuid(sp.id) = pmd.pitch_id
WHERE sp.ticker IS NOT NULL
  AND sp.status = 'approved'
ORDER BY get_pitch_id_from_uuid(sp.id);

-- Restore permissions
GRANT SELECT ON ai_readable_pitches TO anon, authenticated;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check category distribution (should be more balanced now)
SELECT 
  category,
  COUNT(*) as companies,
  STRING_AGG(ticker, ', ' ORDER BY ticker) as tickers
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
GROUP BY category
ORDER BY category;

-- Check new sector + category combination
SELECT 
  ticker,
  company_name,
  category,
  sector,
  current_price
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
ORDER BY sector, category, ticker;

-- Summary view
SELECT 
  category,
  sector,
  COUNT(*) as companies,
  STRING_AGG(ticker, ', ' ORDER BY ticker) as tickers
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
GROUP BY category, sector
ORDER BY category, sector;

-- ========================================
-- EXPECTED RESULTS
-- ========================================

/*
CATEGORY DISTRIBUTION (After Fix):
- Consumer: 4 companies (BKNG, WRBY, META, RDDT)
- Enterprise/B2B: 3 companies (MSFT, DBX, AKAM)
- Social Impact: 0 companies (awaiting HSV7)

SECTOR DISTRIBUTION (After Fix):
- Technology: 3 companies (MSFT, DBX, AKAM)
- Media & Social: 2 companies (META, RDDT)
- Travel & Hospitality: 1 company (BKNG)
- Consumer Goods: 1 company (WRBY)

DUAL DIMENSION:
- Enterprise/B2B + Technology: MSFT, DBX, AKAM
- Consumer + Media & Social: META, RDDT
- Consumer + Travel & Hospitality: BKNG
- Consumer + Consumer Goods: WRBY
*/
