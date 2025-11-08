-- Create a function that forces a fresh read from primary database
CREATE OR REPLACE FUNCTION get_fresh_cash(p_user_id uuid)
RETURNS TABLE (
  cash numeric,
  updated_at timestamptz,
  query_time timestamptz,
  age_seconds numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    available_tokens as cash,
    user_token_balances.updated_at,
    NOW() as query_time,
    EXTRACT(EPOCH FROM (NOW() - user_token_balances.updated_at)) as age_seconds
  FROM user_token_balances
  WHERE user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Test it
SELECT * FROM get_fresh_cash('19be07bc-28d0-4ac6-956b-714eef1ccc85');
