-- V33: Make category optional in recurring_incomes and transactions
-- Allows recurring income and auto-generated transactions to exist without a category

-- Make recurring_incomes.category_id nullable
ALTER TABLE recurring_incomes
ALTER COLUMN category_id DROP NOT NULL;

-- Make transactions.category_id nullable
ALTER TABLE transactions
ALTER COLUMN category_id DROP NOT NULL;
