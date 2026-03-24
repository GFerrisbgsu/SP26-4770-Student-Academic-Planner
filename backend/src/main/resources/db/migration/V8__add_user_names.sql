-- Add firstName and lastName columns to users table
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '';

-- Update existing users with empty names (they can update their profiles later)
UPDATE users SET first_name = '', last_name = '' WHERE first_name IS NULL OR last_name IS NULL;