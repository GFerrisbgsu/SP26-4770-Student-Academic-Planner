-- Make date and time fields optional for tasks without specific deadlines
-- This allows for flexible task management (e.g., "do laundry" without a specific due date)

ALTER TABLE events ALTER COLUMN date DROP NOT NULL;
ALTER TABLE events ALTER COLUMN time DROP NOT NULL;
ALTER TABLE events ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE events ALTER COLUMN end_time DROP NOT NULL;
