-- V13: Add completed status to projects
-- Allows users to mark entire projects as complete

ALTER TABLE projects 
ADD COLUMN completed BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN projects.completed IS 'Indicates if the entire project is marked as completed';
