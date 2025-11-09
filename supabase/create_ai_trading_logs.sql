-- AI Trading Logs Table
-- Captures every AI trading decision for debugging and transparency

CREATE TABLE IF NOT EXISTS ai_trading_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_token_balances(user_id),
  execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- AI info snapshot
  ai_nickname TEXT NOT NULL,
  ai_strategy TEXT NOT NULL,
  
  -- Portfolio state before trade
  cash_before NUMERIC(15,2),
  portfolio_value_before NUMERIC(15,2),
  
  -- OpenAI interaction
  openai_prompt TEXT,
  openai_response_raw TEXT,
  openai_model TEXT DEFAULT 'gpt-4o-mini',
  openai_temperature NUMERIC(3,2) DEFAULT 0.8,
  
  -- Parsed decision
  decision_action TEXT, -- BUY, SELL, HOLD
  decision_pitch_id INTEGER,
  decision_shares NUMERIC(15,4),
  decision_amount NUMERIC(15,2),
  decision_reasoning TEXT,
  
  -- Execution result
  execution_success BOOLEAN,
  execution_error TEXT,
  execution_message TEXT,
  
  -- Portfolio state after trade
  cash_after NUMERIC(15,2),
  portfolio_value_after NUMERIC(15,2),
  
  -- Metadata
  triggered_by TEXT DEFAULT 'cron', -- 'cron', 'manual', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_user_id ON ai_trading_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_timestamp ON ai_trading_logs(execution_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_action ON ai_trading_logs(decision_action);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_success ON ai_trading_logs(execution_success);

-- Grant access
GRANT SELECT, INSERT ON ai_trading_logs TO authenticated;
GRANT SELECT, INSERT ON ai_trading_logs TO service_role;

-- RLS Policy (admin and service role can see all, users can see their own)
ALTER TABLE ai_trading_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI trading logs"
  ON ai_trading_logs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can insert AI trading logs"
  ON ai_trading_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all AI trading logs"
  ON ai_trading_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_token_balances
      WHERE user_id = auth.uid()::text
      AND user_email IN ('mana@rize.ai', 'admin@rize.ai')
    )
  );

COMMENT ON TABLE ai_trading_logs IS 'Complete audit log of all AI trading decisions and executions';
COMMENT ON COLUMN ai_trading_logs.openai_prompt IS 'Full prompt sent to OpenAI for debugging';
COMMENT ON COLUMN ai_trading_logs.openai_response_raw IS 'Raw JSON response from OpenAI';
COMMENT ON COLUMN ai_trading_logs.decision_reasoning IS 'AI explanation for why it made this decision';
COMMENT ON COLUMN ai_trading_logs.triggered_by IS 'How this trade was triggered: cron, manual, admin';
