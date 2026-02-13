-- Create transactions table for WealthWise
-- Tracks all income and expense transactions

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    txn_type VARCHAR(20) NOT NULL CHECK (txn_type IN ('income', 'expense')),
    category VARCHAR(100),
    description TEXT,
    payment_mode VARCHAR(50),
    txn_date DATE NOT NULL,
    month INTEGER,
    year INTEGER,
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'ocr')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_txn_date ON transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_transactions_txn_type ON transactions(txn_type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_month_year ON transactions(month, year);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON transactions;
CREATE TRIGGER trigger_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();

-- Add comments
COMMENT ON TABLE transactions IS 'Stores all financial transactions (income and expenses)';
COMMENT ON COLUMN transactions.user_id IS 'Reference to user who made the transaction';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in currency';
COMMENT ON COLUMN transactions.txn_type IS 'Transaction type: income or expense';
COMMENT ON COLUMN transactions.source IS 'How transaction was entered: manual or ocr (from receipt scan)';
