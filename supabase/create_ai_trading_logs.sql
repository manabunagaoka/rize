-- AI Trading Logs Table
-- Captures every AI trading decision for debugging and transparency

-- Table already exists, just adding indexes and updating policies

-- Indexes for performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_user_id ON ai_trading_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_timestamp ON ai_trading_logs(execution_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_action ON ai_trading_logs(decision_action);
CREATE INDEX IF NOT EXISTS idx_ai_trading_logs_success ON ai_trading_logs(execution_success);

-- Grant access (safe to run multiple times)
GRANT SELECT, INSERT ON ai_trading_logs TO authenticated;
GRANT SELECT, INSERT ON ai_trading_logs TO service_role;

-- RLS is already enabled, policies already exist
-- Table is ready to use!

COMMENT ON TABLE ai_trading_logs IS 'Complete audit log of all AI trading decisions and executions';
COMMENT ON COLUMN ai_trading_logs.openai_prompt IS 'Full prompt sent to OpenAI for debugging';
COMMENT ON COLUMN ai_trading_logs.openai_response_raw IS 'Raw JSON response from OpenAI';
COMMENT ON COLUMN ai_trading_logs.decision_reasoning IS 'AI explanation for why it made this decision';
COMMENT ON COLUMN ai_trading_logs.triggered_by IS 'How this trade was triggered: cron, manual, admin';
