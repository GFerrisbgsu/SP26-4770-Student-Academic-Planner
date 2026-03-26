-- Budget Categories Table
CREATE TABLE budget_categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    is_predefined BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX idx_budget_categories_is_deleted ON budget_categories(is_deleted);

-- Budget Limits Table (monthly per-category limits)
CREATE TABLE budget_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    "month" INT NOT NULL,
    "year" INT NOT NULL,
    limit_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_limits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_limits_category FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
    CONSTRAINT uq_budget_limits_user_category_month UNIQUE (user_id, category_id, "month", "year")
);

CREATE INDEX idx_budget_limits_user_id ON budget_limits(user_id);
CREATE INDEX idx_budget_limits_month_year ON budget_limits("month", "year");

-- Insert Predefined Categories for All Users (they'll be copied to their account on first login)
-- Note: These are templates. Individual categories are created per user with is_predefined=true
INSERT INTO budget_categories (user_id, name, color, is_predefined) VALUES
(1, 'Food & Groceries', '#10b981', TRUE),
(1, 'Transportation', '#f59e0b', TRUE),
(1, 'Housing & Utilities', '#8b5cf6', TRUE),
(1, 'Entertainment', '#ec4899', TRUE),
(1, 'Textbooks & Supplies', '#06b6d4', TRUE),
(1, 'Healthcare', '#ef4444', TRUE),
(1, 'Personal Care', '#6366f1', TRUE),
(1, 'Dining Out', '#f97316', TRUE),
(1, 'Other', '#6b7280', TRUE);
