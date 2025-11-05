-- Fix tier ranking to use total_value (cash + holdings) instead of portfolio_value (holdings only)

CREATE OR REPLACE FUNCTION award_investor_tiers()
RETURNS void AS $$
BEGIN
  -- Reset all investor tiers first
  UPDATE user_token_balances 
  SET investor_tier = NULL 
  WHERE investor_tier IS NOT NULL;
  
  -- Award top 3 based on TOTAL VALUE (cash + holdings) - AI + Human investors combined
  -- Tiebreaker: Earlier created_at wins if total values are equal
  WITH ranked_investors AS (
    SELECT 
      user_id, 
      (available_tokens + portfolio_value) as total_value,
      ROW_NUMBER() OVER (
        ORDER BY (available_tokens + portfolio_value) DESC, created_at ASC
      ) as rank
    FROM user_token_balances
    WHERE (is_ai_investor = true OR username IS NOT NULL)
      AND (ai_status IN ('ACTIVE', 'LEGENDARY') OR ai_status IS NULL)
      AND (available_tokens + portfolio_value) > 0  -- Only rank investors with non-zero value
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
END;
$$ LANGUAGE plpgsql;

-- Now recalculate tiers with the new logic
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
LIMIT 5;
