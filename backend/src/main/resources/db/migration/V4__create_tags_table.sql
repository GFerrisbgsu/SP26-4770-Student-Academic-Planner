-- V4 - Create tags table for user-specific event tags

CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_id_tags ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tag_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_user_tag_name ON tags(user_id, name);

-- Add tag_id column to events table
ALTER TABLE events ADD COLUMN tag_id BIGINT;

-- Add foreign key constraint for tag_id
ALTER TABLE events ADD CONSTRAINT fk_events_tag_id 
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL;

-- Create index for tag_id lookups
CREATE INDEX IF NOT EXISTS idx_events_tag_id ON events(tag_id);

-- Note: Existing tag data (stored as strings) will need to be migrated 
-- This should be done through application logic or a separate data migration script
