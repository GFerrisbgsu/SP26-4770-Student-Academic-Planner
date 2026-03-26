-- V32: Add recurring_income_id column to transactions table for transaction history tracking
-- This links each transaction to its source recurring income (if auto-generated)

ALTER TABLE transactions
ADD COLUMN recurring_income_id BIGINT;

-- Add foreign key constraint (cascade on delete to null)
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_recurring_income
FOREIGN KEY (recurring_income_id) REFERENCES recurring_incomes(id) ON DELETE SET NULL;

-- Add index for efficient querying by recurring_income_id
CREATE INDEX idx_transactions_recurring_income_id
ON transactions(recurring_income_id);

-- Add index for querying by user and recurring_income_id (common query pattern)
CREATE INDEX idx_transactions_user_recurring_income
ON transactions(user_id, recurring_income_id);
