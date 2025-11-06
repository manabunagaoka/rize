-- Create function to get user investments (forces primary database read)
CREATE OR REPLACE FUNCTION get_user_investments(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  pitch_id integer,
  shares_owned numeric,
  total_invested integer,
  avg_purchase_price numeric,
  current_value integer,
  unrealized_gain_loss integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id,
    user_id,
    pitch_id,
    shares_owned,
    total_invested,
    avg_purchase_price,
    current_value,
    unrealized_gain_loss,
    created_at,
    updated_at
  FROM user_investments
  WHERE user_id = p_user_id
    AND shares_owned > 0
  ORDER BY updated_at DESC;
$$;
