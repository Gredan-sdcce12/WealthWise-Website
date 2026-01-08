-- Budget Module Setup for Supabase
-- Run this SQL in Supabase SQL Editor

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_type TEXT NOT NULL CHECK (budget_type IN ('Monthly', 'Weekly')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    start_date DATE NOT NULL,
    alert_threshold INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold >= 1 AND alert_threshold <= 100),
    custom_category_name TEXT,  -- For "others" category, stores custom name like "Gym"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_category_period UNIQUE (user_id, category, start_date, budget_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_start_date ON budgets(start_date);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- Replace 'user123' with your actual user_id
INSERT INTO budgets (user_id, category, budget_type, amount, start_date, alert_threshold, custom_category_name)
VALUES 
    ('user123', 'food', 'Monthly', 8000.00, '2026-01-01', 80, NULL),
    ('user123', 'transport', 'Monthly', 3000.00, '2026-01-01', 80, NULL),
    ('user123', 'others', 'Monthly', 2000.00, '2026-01-01', 90, 'Gym')
ON CONFLICT (user_id, category, start_date, budget_type) DO NOTHING;
