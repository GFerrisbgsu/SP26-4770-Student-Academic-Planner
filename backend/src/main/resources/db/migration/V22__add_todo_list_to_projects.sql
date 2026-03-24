-- V22: Add to-do list assignment to projects
-- Projects can now be assigned to specific to-do lists

-- Add todo_list_id column to projects table
ALTER TABLE projects
ADD COLUMN todo_list_id BIGINT;

-- Add foreign key constraint with CASCADE delete
ALTER TABLE projects
ADD CONSTRAINT projects_todo_list_id_fkey
FOREIGN KEY (todo_list_id) REFERENCES todo_lists(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_projects_todo_list_id ON projects(todo_list_id);
