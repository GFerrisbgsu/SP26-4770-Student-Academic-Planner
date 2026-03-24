-- Add project_id column to events table
ALTER TABLE events ADD COLUMN project_id BIGINT;

-- Add foreign key constraint
ALTER TABLE events ADD CONSTRAINT fk_events_project 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_events_project_id ON events(project_id);
