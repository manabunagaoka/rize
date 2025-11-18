-- ========================================
-- UPDATE CATEGORY TAXONOMY TO NEW SYSTEM
-- Date: November 18, 2025
-- ========================================

-- New Categories:
-- 1. Consumer - Direct-to-consumer products/services
-- 2. Enterprise - B2B/business software/tools
-- 3. Social Impact - Community/social good
-- 4. Life Sciences - Biotech/healthcare/medical
-- 5. Financial Services - Banking/payments/fintech
-- 6. Climate/Sustainability - Environmental solutions
-- 7. Education - Learning/teaching platforms
-- 8. Frontier - Emerging tech/breakthrough innovation

BEGIN;

-- ========================================
-- STEP 1: Drop old constraint first
-- ========================================

ALTER TABLE student_projects
DROP CONSTRAINT IF EXISTS student_projects_category_check;

-- ========================================
-- STEP 2: Migrate existing categories to new system
-- ========================================

-- Update any old category names to new ones
UPDATE student_projects SET category = 'Enterprise' WHERE category = 'Enterprise/B2B';
UPDATE student_projects SET category = 'Life Sciences' WHERE category = 'HealthTech';
UPDATE student_projects SET category = 'Financial Services' WHERE category = 'FinTech';
UPDATE student_projects SET category = 'Education' WHERE category = 'EdTech';

-- ========================================
-- STEP 3: Add new constraint
-- ========================================

ALTER TABLE student_projects
ADD CONSTRAINT student_projects_category_check
CHECK (category IN (
  'Consumer',
  'Enterprise',
  'Social Impact',
  'Life Sciences',
  'Financial Services',
  'Climate/Sustainability',
  'Education',
  'Frontier'
));

-- ========================================
-- STEP 4: Update AI investor personas
-- ========================================

-- Update Tech-Only investor to use new "Enterprise" category
UPDATE user_token_balances
SET ai_personality_prompt = 'Silicon Brain: ONLY companies categorized as "Enterprise" (business software, enterprise tech). NO consumer products, NO social impact. Filter companies by category="Enterprise" ONLY. If no Enterprise companies are attractive, HOLD - never compromise your standards!'
WHERE ai_strategy = 'TECH_ONLY';

-- Update SaaS-Only investor to use new "Enterprise" category
UPDATE user_token_balances
SET ai_personality_prompt = 'Cloud Surfer: ONLY companies categorized as "Enterprise" (cloud software, SaaS with recurring revenue). Filter companies by category="Enterprise" ONLY. Consumer/social impact are NOT enterprise SaaS. If no Enterprise companies fit, HOLD - never violate the B2B rule!'
WHERE ai_strategy = 'SAAS_ONLY';

COMMIT;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check constraint updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'student_projects_category_check';

-- Check AI personas updated
SELECT ai_nickname, ai_strategy, 
  SUBSTRING(ai_personality_prompt, 1, 100) as prompt_preview
FROM user_token_balances
WHERE ai_strategy IN ('TECH_ONLY', 'SAAS_ONLY');

-- Show all categories in use
SELECT category, COUNT(*) as count
FROM student_projects
GROUP BY category
ORDER BY count DESC;
