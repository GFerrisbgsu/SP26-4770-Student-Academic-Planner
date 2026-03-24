-- Add deadline column to projects table
ALTER TABLE projects ADD COLUMN deadline DATE;

-- Add time column for projects (optional, for deadline time)
ALTER TABLE projects ADD COLUMN deadline_time TIME;

COMMENT ON COLUMN projects.deadline IS 'Optional deadline date for the project';
COMMENT ON COLUMN projects.deadline_time IS 'Optional time for the project deadline';
