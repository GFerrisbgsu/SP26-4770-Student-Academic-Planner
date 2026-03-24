-- Add password reset fields to users table
ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(64),
ADD COLUMN password_reset_token_expires_at TIMESTAMP;
