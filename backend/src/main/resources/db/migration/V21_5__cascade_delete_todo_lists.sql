-- V21: Change to-do list deletion behavior from SET NULL to CASCADE
-- When a to-do list is deleted, all associated events are also deleted

-- Drop the existing foreign key constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_todo_list_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE events
ADD CONSTRAINT events_todo_list_id_fkey
FOREIGN KEY (todo_list_id) REFERENCES todo_lists(id) ON DELETE CASCADE;
