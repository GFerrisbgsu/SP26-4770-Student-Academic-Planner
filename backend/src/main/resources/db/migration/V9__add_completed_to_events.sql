-- Add completed column to events table to track task completion status
ALTER TABLE events ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;
