-- Allow the prerequisite column (course_id) to be NULL in course_prerequisites.
-- Rows with prereq_type = 'OTHER' have no referenced course — only a text description
-- (e.g. "Consent of department", "Math Placement score of MATH 1280 or higher").
ALTER TABLE course_prerequisites
    ALTER COLUMN prerequisite DROP NOT NULL;
