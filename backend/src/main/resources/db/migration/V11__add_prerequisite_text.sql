-- Add raw prerequisite text to courses table.
-- Stores the full human-readable prerequisite / corequisite sentence
-- exactly as written in the official course catalog (e.g. from Coursicle).
-- This is intentionally separate from the structured course_prerequisites
-- table (CourseInfo) and is used as the source of truth for later
-- automated parsing into structured prerequisite relationships.
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS prerequisite_text TEXT;
