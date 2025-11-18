-- ========================================
-- MULTI-INDEX DATABASE SCHEMA MIGRATION
-- Date: November 18, 2025
-- Purpose: Support multiple investment indexes (HM7, HNP7, HP7, AF7)
-- ========================================

-- ========================================
-- STEP 1: ADD NEW COLUMNS TO ai_readable_pitches
-- ========================================

-- Add index_code column (which index this company belongs to)
ALTER TABLE ai_readable_pitches 
ADD COLUMN IF NOT EXISTS index_code TEXT DEFAULT 'HM7';

-- Add price_type column (real_stock vs simulated)
ALTER TABLE ai_readable_pitches 
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'real_stock';

-- Add additional context columns for non-profits and startups
ALTER TABLE ai_readable_pitches
ADD COLUMN IF NOT EXISTS founder_info TEXT,
ADD COLUMN IF NOT EXISTS impact_metrics TEXT,
ADD COLUMN IF NOT EXISTS mission_statement TEXT;

-- Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_pitches_index_code ON ai_readable_pitches(index_code);
CREATE INDEX IF NOT EXISTS idx_pitches_price_type ON ai_readable_pitches(price_type);
CREATE INDEX IF NOT EXISTS idx_pitches_ticker ON ai_readable_pitches(ticker);

-- ========================================
-- STEP 2: UPDATE EXISTING HM7 ENTRIES
-- ========================================

-- Mark all current entries as HM7 (Harvard Moguls 7) with real stock prices
UPDATE ai_readable_pitches 
SET 
    index_code = 'HM7',
    price_type = 'real_stock'
WHERE index_code IS NULL OR index_code = 'HM7';

-- Verify existing entries are properly tagged
SELECT ticker, company_name, index_code, price_type, category
FROM ai_readable_pitches
WHERE index_code = 'HM7'
ORDER BY ticker;

-- ========================================
-- STEP 3: UPDATE pitch_market_data TABLE
-- ========================================

-- Add price_type column to market data table
ALTER TABLE pitch_market_data
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'real_stock';

-- Add columns for simulated market tracking
ALTER TABLE pitch_market_data
ADD COLUMN IF NOT EXISTS total_buy_volume INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sell_volume INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_investors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10,2) DEFAULT 100.00;

-- Mark existing prices as real stock prices
UPDATE pitch_market_data
SET price_type = 'real_stock'
WHERE price_type IS NULL;

-- Add index for simulated price queries
CREATE INDEX IF NOT EXISTS idx_market_data_price_type ON pitch_market_data(price_type);

-- ========================================
-- STEP 4: CREATE SIMULATED MARKET TRACKING TABLE
-- ========================================

-- Track buy/sell orders for simulated pricing
CREATE TABLE IF NOT EXISTS simulated_market_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker TEXT NOT NULL,
    user_id UUID NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
    shares INTEGER NOT NULL,
    price_at_execution NUMERIC(10,2) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_ticker FOREIGN KEY (ticker) 
        REFERENCES ai_readable_pitches(ticker) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES user_token_balances(user_id) ON DELETE CASCADE
);

-- Indexes for market order queries
CREATE INDEX IF NOT EXISTS idx_market_orders_ticker ON simulated_market_orders(ticker);
CREATE INDEX IF NOT EXISTS idx_market_orders_executed ON simulated_market_orders(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_orders_type ON simulated_market_orders(order_type);

-- ========================================
-- STEP 5: CREATE VIEW FOR ALL INDEXES
-- ========================================

-- Unified view of all companies across all indexes
CREATE OR REPLACE VIEW v_all_investment_opportunities AS
SELECT 
    p.pitch_id,
    p.ticker,
    p.company_name,
    p.category,
    p.index_code,
    p.price_type,
    p.elevator_pitch,
    p.founder_info,
    p.impact_metrics,
    p.mission_statement,
    m.current_price,
    m.change_24h,
    m.last_updated,
    m.total_buy_volume,
    m.total_sell_volume,
    m.unique_investors,
    -- Calculate market cap equivalent for simulated companies
    CASE 
        WHEN p.price_type = 'simulated' 
        THEN m.current_price * 1000000 -- 1M simulated shares
        ELSE NULL 
    END as simulated_market_cap
FROM ai_readable_pitches p
LEFT JOIN pitch_market_data m ON p.ticker = m.ticker
WHERE p.ticker IS NOT NULL
ORDER BY p.index_code, p.ticker;

-- ========================================
-- STEP 6: UPDATE AI TRADING LOGIC COMPATIBILITY
-- ========================================

-- Ensure AI investors can see all indexes
-- (No table changes needed - AI trading code reads from ai_readable_pitches)

-- Verify AI investors will see all companies
SELECT 
    index_code,
    COUNT(*) as companies,
    STRING_AGG(ticker, ', ') as tickers
FROM ai_readable_pitches
WHERE ticker IS NOT NULL
GROUP BY index_code
ORDER BY index_code;

-- ========================================
-- STEP 7: ADD CONSTRAINTS AND VALIDATIONS
-- ========================================

-- Ensure index_code is one of the valid values
ALTER TABLE ai_readable_pitches
ADD CONSTRAINT check_valid_index_code 
CHECK (index_code IN ('HM7', 'HNP7', 'HP7', 'AF7'));

-- Ensure price_type is valid
ALTER TABLE ai_readable_pitches
ADD CONSTRAINT check_valid_price_type
CHECK (price_type IN ('real_stock', 'simulated'));

-- Ensure simulated companies have required fields
-- (Constraint commented out - may be too strict initially)
-- ALTER TABLE ai_readable_pitches
-- ADD CONSTRAINT check_simulated_required_fields
-- CHECK (
--     price_type = 'real_stock' OR 
--     (price_type = 'simulated' AND 
--      founder_info IS NOT NULL AND 
--      impact_metrics IS NOT NULL AND 
--      mission_statement IS NOT NULL)
-- );

-- ========================================
-- STEP 8: CREATE ADMIN HELPER FUNCTIONS
-- ========================================

-- Function to calculate simulated price based on market activity
CREATE OR REPLACE FUNCTION calculate_simulated_price(p_ticker TEXT)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    v_base_price NUMERIC(10,2);
    v_total_buy INTEGER;
    v_total_sell INTEGER;
    v_unique_investors INTEGER;
    v_demand_factor NUMERIC(5,4);
    v_popularity_bonus NUMERIC(5,4);
    v_volatility NUMERIC(5,4);
    v_new_price NUMERIC(10,2);
BEGIN
    -- Get current market data
    SELECT 
        COALESCE(base_price, 100.00),
        COALESCE(total_buy_volume, 0),
        COALESCE(total_sell_volume, 0),
        COALESCE(unique_investors, 0)
    INTO 
        v_base_price,
        v_total_buy,
        v_total_sell,
        v_unique_investors
    FROM pitch_market_data
    WHERE ticker = p_ticker;
    
    -- Calculate demand factor (0.7 to 1.3)
    IF (v_total_buy + v_total_sell) > 0 THEN
        v_demand_factor := 0.7 + (0.6 * v_total_buy::NUMERIC / (v_total_buy + v_total_sell));
    ELSE
        v_demand_factor := 1.0;
    END IF;
    
    -- Calculate popularity bonus (1 + 1% per unique investor)
    v_popularity_bonus := 1.0 + (v_unique_investors * 0.01);
    
    -- Add volatility (±3% random)
    v_volatility := 1.0 + ((random() * 0.06) - 0.03);
    
    -- Calculate new price
    v_new_price := v_base_price * v_demand_factor * v_popularity_bonus * v_volatility;
    
    -- Ensure price stays within reasonable bounds ($10 to $1000)
    v_new_price := GREATEST(10.00, LEAST(1000.00, v_new_price));
    
    RETURN v_new_price;
END;
$$ LANGUAGE plpgsql;

-- Function to update simulated prices (called by cron)
CREATE OR REPLACE FUNCTION update_simulated_prices()
RETURNS TABLE(ticker TEXT, old_price NUMERIC, new_price NUMERIC) AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT p.ticker, m.current_price as old_price
        FROM ai_readable_pitches p
        JOIN pitch_market_data m ON p.ticker = m.ticker
        WHERE p.price_type = 'simulated'
    LOOP
        -- Calculate new price
        UPDATE pitch_market_data
        SET 
            current_price = calculate_simulated_price(r.ticker),
            last_updated = NOW()
        WHERE pitch_market_data.ticker = r.ticker;
        
        -- Return result
        RETURN QUERY
        SELECT 
            r.ticker,
            r.old_price,
            (SELECT current_price FROM pitch_market_data WHERE pitch_market_data.ticker = r.ticker);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 9: VERIFICATION QUERIES
-- ========================================

-- Check schema changes applied
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_readable_pitches'
AND column_name IN ('index_code', 'price_type', 'founder_info', 'impact_metrics', 'mission_statement')
ORDER BY column_name;

-- Check indexes created
SELECT 
    indexname, 
    tablename, 
    indexdef
FROM pg_indexes
WHERE tablename IN ('ai_readable_pitches', 'pitch_market_data', 'simulated_market_orders')
AND indexname LIKE '%index_code%' OR indexname LIKE '%price_type%'
ORDER BY tablename, indexname;

-- Check constraints added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'ai_readable_pitches'::regclass
AND conname LIKE '%index_code%' OR conname LIKE '%price_type%'
ORDER BY conname;

-- ========================================
-- STEP 10: ROLLBACK SCRIPT (IF NEEDED)
-- ========================================

/*
-- USE ONLY IF YOU NEED TO UNDO THIS MIGRATION

-- Drop functions
DROP FUNCTION IF EXISTS calculate_simulated_price(TEXT);
DROP FUNCTION IF EXISTS update_simulated_prices();

-- Drop view
DROP VIEW IF EXISTS v_all_investment_opportunities;

-- Drop table
DROP TABLE IF EXISTS simulated_market_orders;

-- Drop constraints
ALTER TABLE ai_readable_pitches DROP CONSTRAINT IF EXISTS check_valid_index_code;
ALTER TABLE ai_readable_pitches DROP CONSTRAINT IF EXISTS check_valid_price_type;

-- Drop indexes
DROP INDEX IF EXISTS idx_pitches_index_code;
DROP INDEX IF EXISTS idx_pitches_price_type;
DROP INDEX IF EXISTS idx_pitches_ticker;
DROP INDEX IF EXISTS idx_market_data_price_type;

-- Remove columns from pitch_market_data
ALTER TABLE pitch_market_data DROP COLUMN IF EXISTS price_type;
ALTER TABLE pitch_market_data DROP COLUMN IF EXISTS total_buy_volume;
ALTER TABLE pitch_market_data DROP COLUMN IF EXISTS total_sell_volume;
ALTER TABLE pitch_market_data DROP COLUMN IF EXISTS unique_investors;
ALTER TABLE pitch_market_data DROP COLUMN IF EXISTS base_price;

-- Remove columns from ai_readable_pitches
ALTER TABLE ai_readable_pitches DROP COLUMN IF EXISTS index_code;
ALTER TABLE ai_readable_pitches DROP COLUMN IF EXISTS price_type;
ALTER TABLE ai_readable_pitches DROP COLUMN IF EXISTS founder_info;
ALTER TABLE ai_readable_pitches DROP COLUMN IF EXISTS impact_metrics;
ALTER TABLE ai_readable_pitches DROP COLUMN IF EXISTS mission_statement;
*/

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Summary of changes
SELECT 
    'Schema migration complete!' as status,
    (SELECT COUNT(*) FROM ai_readable_pitches WHERE index_code = 'HM7') as hm7_companies,
    (SELECT COUNT(*) FROM ai_readable_pitches WHERE price_type = 'real_stock') as real_stock_companies,
    (SELECT COUNT(*) FROM ai_readable_pitches WHERE price_type = 'simulated') as simulated_companies;

-- Next steps:
-- 1. Run HNP7_DATABASE_INSERT.sql to add 7 non-profits
-- 2. Test simulated price calculation: SELECT calculate_simulated_price('HLTH');
-- 3. Run AI trading cron and verify trades happen on both real and simulated companies
-- 4. Monitor prices: SELECT * FROM update_simulated_prices();
