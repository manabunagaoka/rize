-- Add trading lock to prevent concurrent trades corrupting balances

-- Option 1: Add a "last_trade_timestamp" column to detect rapid fire
ALTER TABLE user_token_balances 
ADD COLUMN IF NOT EXISTS last_trade_timestamp TIMESTAMPTZ;

-- Option 2: Create a function to atomically check and update balance
CREATE OR REPLACE FUNCTION execute_trade_atomic(
  p_user_id TEXT,
  p_pitch_id INTEGER,
  p_transaction_type TEXT,
  p_shares NUMERIC,
  p_price_per_share NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_total_cost NUMERIC;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_result JSON;
BEGIN
  -- Lock the user's row for update
  SELECT available_tokens INTO v_balance_before
  FROM user_token_balances
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  v_total_cost := p_shares * p_price_per_share;
  
  IF p_transaction_type = 'BUY' THEN
    -- Check sufficient funds
    IF v_balance_before < v_total_cost THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Insufficient funds',
        'available', v_balance_before,
        'needed', v_total_cost
      );
    END IF;
    
    v_balance_after := v_balance_before - v_total_cost;
    
    -- Update balance atomically
    UPDATE user_token_balances
    SET 
      available_tokens = v_balance_after,
      last_trade_timestamp = NOW()
    WHERE user_id = p_user_id;
    
    RETURN json_build_object(
      'success', true,
      'balance_before', v_balance_before,
      'balance_after', v_balance_after,
      'cost', v_total_cost
    );
  ELSE
    -- SELL logic would go here
    RETURN json_build_object('success', false, 'error', 'SELL not implemented');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint to prevent negative balances
ALTER TABLE user_token_balances 
ADD CONSTRAINT chk_positive_balance 
CHECK (available_tokens >= 0);

COMMENT ON FUNCTION execute_trade_atomic IS 'Atomically execute a trade with balance validation and locking';
