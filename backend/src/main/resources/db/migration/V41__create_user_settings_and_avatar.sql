-- Create user_settings table for user preferences
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    time_zone VARCHAR(100),
    default_calendar_view VARCHAR(50) DEFAULT 'week',
    theme_preference VARCHAR(50) DEFAULT 'light',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
