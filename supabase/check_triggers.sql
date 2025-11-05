-- Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN ('after_price_update', 'after_portfolio_update')
ORDER BY trigger_name;

-- Check if the trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'trigger_award_tiers';
