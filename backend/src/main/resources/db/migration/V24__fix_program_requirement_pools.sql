-- V24: Fix requirement counter mismatches on completed course map
--
-- 1. Add WRIT 1110 to BGP "English Composition and Oral Communication" group
-- 2. Add MATH 1280 to Additional "Additional Natural Science and Math" group
-- 3. Set Minor Requirements totalCreditsRequired to NULL (no courses seeded)

-- 1. Insert writ1110 into the BGP English Comp option
INSERT INTO requirement_courses (option_id, course_id, sort_order)
SELECT ro.id, 'writ1110', 0
FROM requirement_options ro
JOIN requirement_groups rg ON ro.group_id = rg.id
JOIN requirement_categories rc ON rg.category_id = rc.id
WHERE rc.name = 'BG Perspective (BGP) Requirements'
  AND rg.name = 'English Composition and Oral Communication'
  AND ro.name = 'Default'
  AND NOT EXISTS (
      SELECT 1 FROM requirement_courses rc2
      WHERE rc2.option_id = ro.id AND rc2.course_id = 'writ1110'
  );

-- 2. Insert math1280 into the Additional Natural Sci & Math option
INSERT INTO requirement_courses (option_id, course_id, sort_order)
SELECT ro.id, 'math1280', 0
FROM requirement_options ro
JOIN requirement_groups rg ON ro.group_id = rg.id
JOIN requirement_categories rc ON rg.category_id = rc.id
WHERE rc.name = 'Additional Requirements'
  AND rg.name = 'Additional Natural Science and Math'
  AND ro.name = 'Approved courses'
  AND NOT EXISTS (
      SELECT 1 FROM requirement_courses rc2
      WHERE rc2.option_id = ro.id AND rc2.course_id = 'math1280'
  );

-- 3. Set Minor Requirements totalCreditsRequired to NULL
UPDATE requirement_categories
SET total_credits_required = NULL
WHERE name = 'Minor Requirements';
