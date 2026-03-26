-- Add transaction type support
-- Adds a 'type' column to transactions table to distinguish between income and expense transactions
ALTER TABLE transactions ADD COLUMN type VARCHAR(50) DEFAULT 'EXPENSE' NOT NULL;

-- Create index on type for query performance
CREATE INDEX idx_transactions_type ON transactions(type);

-- Create composite index for common queries (user, type, date)
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, transaction_date);
