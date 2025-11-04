-- Fix HM7 competition name - it's an index, not a seasonal event
UPDATE competitions 
SET 
  name = 'HM7',
  description = 'Harvard''s Magnificent 7 - Trade legendary Harvard-founded companies. Live index tracking real market performance.',
  slug = 'hm7'
WHERE slug = 'hm7-fall-2025';

-- Verify the change
SELECT id, name, slug, status, type, description 
FROM competitions 
WHERE slug = 'hm7';
