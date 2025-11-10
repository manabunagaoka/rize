-- Create a materialized view that is the SOURCE OF TRUTH for portfolio calculations
-- This handles duplicates, calculates correctly, and can be refreshed periodically

-- First, drop if exists
DROP MATERIALIZED VIEW IF EXISTS portfolio_truth CASCADE;

-- Create the materialized view
CREATE MATERIALIZED VIEW portfolio_truth AS
WITH deduplicated_investments AS (
  -- Handle duplicate rows: keep most recent per user+pitch
  SELECT DISTINCT ON (user_id, pitch_id)
    user_id,
    pitch_id,
    shares_owned,
    avg_purchase_price,
    total_invested,
    current_value,
    updated_at
  FROM user_investments
  WHERE shares_owned > 0
  ORDER BY user_id, pitch_id, updated_at DESC
),
holdings_summary AS (
  -- Sum up all holdings per user
  SELECT 
    user_id,
    COUNT(*) as num_positions,
    SUM(shares_owned) as total_shares,
    SUM(total_invested) as total_invested_in_holdings,
    SUM(current_value) as total_current_value
  FROM deduplicated_investments
  GROUP BY user_id
)
SELECT 
  utb.user_id,
  utb.username,
  utb.ai_nickname,
  utb.is_ai_investor,
  utb.available_tokens as cash,
  COALESCE(hs.num_positions, 0) as num_positions,
  COALESCE(hs.total_shares, 0) as total_shares,
  COALESCE(hs.total_invested_in_holdings, 0) as total_invested_in_holdings,
  COALESCE(hs.total_current_value, 0) as holdings_value_db,
  utb.available_tokens + COALESCE(hs.total_current_value, 0) as total_value_db,
  utb.updated_at as balance_updated_at
FROM user_token_balances utb
LEFT JOIN holdings_summary hs ON hs.user_id = utb.user_id
WHERE utb.available_tokens IS NOT NULL;

-- Create index for fast lookups
CREATE INDEX idx_portfolio_truth_user_id ON portfolio_truth(user_id);
CREATE INDEX idx_portfolio_truth_ai_nickname ON portfolio_truth(ai_nickname);

-- Grant access
GRANT SELECT ON portfolio_truth TO authenticated;
GRANT SELECT ON portfolio_truth TO anon;

-- Refresh function that can be called by APIs or scheduled
CREATE OR REPLACE FUNCTION refresh_portfolio_truth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_truth;
END;
$$;

COMMENT ON MATERIALIZED VIEW portfolio_truth IS 'Source of truth for portfolio calculations. Handles duplicates and calculates totals. Refresh with SELECT refresh_portfolio_truth();';
COMMENT ON FUNCTION refresh_portfolio_truth() IS 'Refreshes the portfolio_truth materialized view. Call this after trades or balance updates.';
