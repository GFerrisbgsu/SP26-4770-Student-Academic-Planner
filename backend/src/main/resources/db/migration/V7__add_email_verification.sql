-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_code VARCHAR(6),
ADD COLUMN verification_code_expires_at TIMESTAMP;

-- Update existing users to be unverified (they can verify later)
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;