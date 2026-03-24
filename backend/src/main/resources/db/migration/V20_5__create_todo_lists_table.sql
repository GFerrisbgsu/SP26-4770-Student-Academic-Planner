-- V20__create_todo_lists_table.sql
-- Create todo_lists table for managing multiple to-do lists per user

CREATE TABLE todo_lists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    list_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index for faster user-based queries
CREATE INDEX idx_todo_lists_user_id ON todo_lists(user_id);

-- Add todo_list_id to events table (nullable to support existing events)
ALTER TABLE events ADD COLUMN todo_list_id BIGINT;
ALTER TABLE events ADD CONSTRAINT fk_events_todo_list FOREIGN KEY (todo_list_id) REFERENCES todo_lists(id) ON DELETE SET NULL;

-- Add index for faster list-based event queries
CREATE INDEX idx_events_todo_list_id ON events(todo_list_id);
