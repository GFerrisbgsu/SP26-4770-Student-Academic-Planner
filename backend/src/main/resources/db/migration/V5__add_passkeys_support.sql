-- V5 - Add passkeys (WebAuthn) support for passwordless authentication

-- Table for storing user's registered WebAuthn credentials (passkeys)
CREATE TABLE IF NOT EXISTS passkeys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(255),
    transports TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_passkey_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for tracking in-progress passkey authentication/registration challenges
CREATE TABLE IF NOT EXISTS passkey_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    challenge VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_passkey_sessions_challenge ON passkey_sessions(challenge);
CREATE INDEX IF NOT EXISTS idx_passkey_sessions_user_id ON passkey_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_sessions_expires_at ON passkey_sessions(expires_at);

-- Add passkey_enabled column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT FALSE;
