-- V25: Expand "Additional BGP Credits" pool so all MDC-eligible courses count toward BGP
--
-- At BGSU, all MDC-approved courses carry at least one BGP designation.
-- Several MDC courses were missing from any BGP group, causing the BGP
-- counter to fall short of 36 when the entire course map is completed.

-- Add missing courses to the "Additional BGP Credits" option.
-- Uses NOT EXISTS to avoid duplicate inserts.

INSERT INTO requirement_courses (option_id, course_id, sort_order)
SELECT ro.id, c.id, 0
FROM requirement_options ro
JOIN requirement_groups rg ON ro.group_id = rg.id
JOIN requirement_categories rc ON rg.category_id = rc.id
CROSS JOIN (VALUES
    ('writ1110'), ('eng1500'),
    ('phil1020'), ('phil1030'),
    ('psyc2700'), ('soc2020'), ('soc2120'),
    ('econ2000'), ('hist1250'), ('hist1260'), ('hist1520'),
    ('ethn2200'), ('pols2900'), ('geog1220'),
    ('gero1010'), ('hdfs1930'), ('hdfs2020'), ('ws2000'),
    ('acs2000'), ('acs2500'), ('arch2330'), ('arch2340'), ('art1010'),
    ('cdis1230'), ('edfi2980'), ('eiec2210'), ('edtl2010'),
    ('mdia1030'), ('mdia3520'), ('tech3020')
) AS new_courses(id)
JOIN courses c ON c.id = new_courses.id
WHERE rc.name = 'BG Perspective (BGP) Requirements'
  AND rg.name = 'Additional BGP Credits'
  AND ro.name = 'Any BGP-eligible courses'
  AND NOT EXISTS (
      SELECT 1 FROM requirement_courses rc2
      WHERE rc2.option_id = ro.id AND rc2.course_id = c.id
  );
