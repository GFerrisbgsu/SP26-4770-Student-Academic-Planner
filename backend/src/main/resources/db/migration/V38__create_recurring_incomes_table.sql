-- V31__create_recurring_incomes_table.sql
-- Creates the recurring_incomes table for managing recurring income records

CREATE TABLE recurring_incomes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES budget_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(500),
    frequency VARCHAR(50) NOT NULL,
    next_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_amount_positive CHECK (amount > 0)
);

-- Create indexes for common queries
CREATE INDEX idx_recurring_incomes_user_id ON recurring_incomes(user_id);
CREATE INDEX idx_recurring_incomes_user_active ON recurring_incomes(user_id, is_active);
CREATE INDEX idx_recurring_incomes_next_date ON recurring_incomes(next_date);
CREATE INDEX idx_recurring_incomes_user_next_date_active ON recurring_incomes(user_id, next_date, is_active);
