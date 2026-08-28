-- One-time fix: existing service hero/card image URLs were saved without the
-- /api/ prefix (bug fixed in ServiceSectionsController.php / ServiceCardsController.php).
-- This repairs the URLs already stored in the DB to match the corrected format.
UPDATE service_sections
SET hero_image_url = REPLACE(hero_image_url, '/uploads/services/', '/api/uploads/services/')
WHERE hero_image_url LIKE '%/uploads/services/%'
  AND hero_image_url NOT LIKE '%/api/uploads/services/%';

UPDATE service_cards
SET image_url = REPLACE(image_url, '/uploads/services/', '/api/uploads/services/')
WHERE image_url LIKE '%/uploads/services/%'
  AND image_url NOT LIKE '%/api/uploads/services/%';
