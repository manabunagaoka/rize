-- Check if any student_projects exist
SELECT COUNT(*) as total_startups FROM student_projects;

-- Show all startups
SELECT id, startup_name, user_name, user_email, status, created_at 
FROM student_projects 
ORDER BY created_at DESC
LIMIT 20;

-- Check if HM7 competition exists
SELECT id, name, slug, status FROM competitions WHERE slug = 'hm7-fall-2025';
