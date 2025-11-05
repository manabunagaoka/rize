-- Fix: Make tier system calculate portfolio values the same way as leaderboard (real-time)
-- This ensures tiers always match what users see on screen

CREATE OR REPLACE FUNCTION award_investor_tiers()
RETURNS void AS $$
BEGIN
  -- Reset all investor tiers first
  UPDATE user_token_balances 
  SET investor_tier = NULL 
  WHERE investor_tier IS NOT NULL;
  
  -- Award top 3 based on REAL-TIME CALCULATED total value
  -- Calculate portfolio value the SAME WAY as the leaderboard API:
  -- available_tokens + SUM(shares * current_price from pitch_market_data)
  WITH real_time_portfolios AS (
    SELECT 
      utb.user_id,
      utb.available_tokens,
      utb.created_at,
      COALESCE(
        (SELECT SUM(ui.shares_owned * pmd.current_price)
         FROM user_investments ui
         JOIN pitch_market_data pmd ON ui.pitch_id = pmd.pitch_id
         WHERE ui.user_id = utb.user_id AND ui.shares_owned > 0),
        0
      ) as holdings_value
    FROM user_token_balances utb
    WHERE (utb.is_ai_investor = true OR utb.username IS NOT NULL)
      AND (utb.ai_status IN ('ACTIVE', 'LEGENDARY') OR utb.ai_status IS NULL)
  ),
  ranked_investors AS (
    SELECT 
      user_id,
      (available_tokens + holdings_value) as total_value,
      ROW_NUMBER() OVER (
        ORDER BY (available_tokens + holdings_value) DESC, created_at ASC
      ) as rank
    FROM real_time_portfolios
    WHERE (available_tokens + holdings_value) > 0
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
    END,
    -- ALSO update the cached portfolio_value so it matches
    portfolio_value = ri.total_value - utb.available_tokens,
    all_time_gain_loss = ri.total_value - utb.total_tokens
  FROM ranked_investors ri
  WHERE utb.user_id = ri.user_id AND ri.rank <= 3;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use pitch_market_data.current_price updates
DROP TRIGGER IF EXISTS after_price_update ON pitch_market_data;
DROP TRIGGER IF EXISTS after_portfolio_update ON user_token_balances;

-- Trigger when market prices change
CREATE TRIGGER after_price_update
  AFTER UPDATE OF current_price ON pitch_market_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- Trigger when portfolio changes (trades happen)
CREATE TRIGGER after_portfolio_update
  AFTER UPDATE OF available_tokens ON user_token_balances
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_award_tiers();

-- Now award tiers with real-time prices
SELECT award_investor_tiers();

-- Verify
SELECT 
  ai_nickname,
  available_tokens as cash,
  portfolio_value as holdings,
  (available_tokens + portfolio_value) as total_value,
  investor_tier
FROM user_token_balances
WHERE is_ai_investor = true
ORDER BY (available_tokens + portfolio_value) DESC
LIMIT 10;
