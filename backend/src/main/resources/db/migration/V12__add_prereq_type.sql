-- Enrich course_prerequisites table to support typed prerequisite entries.
-- Adds prereq_type (PREREQUISITE / COREQUISITE / OTHER) and an optional
-- human-readable description for non-course requirements (e.g. placement scores).
-- All existing rows default to 'PREREQUISITE' so nothing breaks.
ALTER TABLE course_prerequisites
    ADD COLUMN IF NOT EXISTS prereq_type        VARCHAR(50) NOT NULL DEFAULT 'PREREQUISITE',
    ADD COLUMN IF NOT EXISTS prereq_description TEXT;
