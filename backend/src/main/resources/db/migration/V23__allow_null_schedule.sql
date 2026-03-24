-- Allow schedule column to be null so unenrolling can clear the schedule.
ALTER TABLE courses ALTER COLUMN schedule DROP NOT NULL;
