-- V4 - Create token blacklist table for revoked JWT tokens

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(1000) NOT NULL,
    user_id BIGINT,
    expiry_date TIMESTAMP NOT NULL,
    blacklisted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_token_blacklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);

-- Index on expiry_date for cleanup queries
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expiry ON token_blacklist(expiry_date);

-- Index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user ON token_blacklist(user_id);
