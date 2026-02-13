-- Create incomes table for WealthWise
-- Tracks income sources and amounts

CREATE TABLE IF NOT EXISTS incomes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    income_type VARCHAR(100),
    source VARCHAR(255),
    note TEXT,
    received_date DATE,
    month INTEGER,
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_received_date ON incomes(received_date);
CREATE INDEX IF NOT EXISTS idx_incomes_income_type ON incomes(income_type);
CREATE INDEX IF NOT EXISTS idx_incomes_month_year ON incomes(month, year);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incomes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_incomes_updated_at ON incomes;
CREATE TRIGGER trigger_incomes_updated_at
BEFORE UPDATE ON incomes
FOR EACH ROW
EXECUTE FUNCTION update_incomes_updated_at();

-- Add comments
COMMENT ON TABLE incomes IS 'Stores income transaction records for users';
COMMENT ON COLUMN incomes.user_id IS 'Reference to user who received the income';
COMMENT ON COLUMN incomes.amount IS 'Income amount in currency';
COMMENT ON COLUMN incomes.income_type IS 'Type of income (salary, bonus, investment, etc.)';
COMMENT ON COLUMN incomes.source IS 'Source of income (employer, investment account, etc.)';
