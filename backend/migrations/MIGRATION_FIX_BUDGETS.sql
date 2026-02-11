-- Migration: Fix budgets table schema and add foreign key constraint
-- This migration updates the budgets table to match the application's requirements

-- Step 1: Rename 'limit' column to 'amount' if it exists
ALTER TABLE budgets 
RENAME COLUMN limit TO amount;

-- Step 2: Add missing columns if they don't already exist
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_type VARCHAR(50);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS custom_category_name VARCHAR(255);

-- Step 3: Add foreign key constraint for user_id
-- First, drop the existing FK if it exists
ALTER TABLE budgets 
DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;

-- Now add the proper foreign key constraint
ALTER TABLE budgets 
ADD CONSTRAINT budgets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Step 4: Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_budget_type ON budgets(budget_type);

-- Step 5: Add updated trigger if not already present
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_budgets_updated_at ON budgets;
CREATE TRIGGER trigger_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_budgets_updated_at();

-- Add constraint to ensure valid budget_type values
ALTER TABLE budgets 
ADD CONSTRAINT valid_budget_type CHECK (budget_type IN ('Monthly', 'Weekly', 'Annual') OR budget_type IS NULL);

-- Add comments
COMMENT ON COLUMN budgets.user_id IS 'Reference to user who created this budget';
COMMENT ON COLUMN budgets.amount IS 'Budget limit amount';
COMMENT ON COLUMN budgets.budget_type IS 'Type of budget: Monthly, Weekly, or Annual';
COMMENT ON COLUMN budgets.start_date IS 'Start date of the budget period';
COMMENT ON COLUMN budgets.custom_category_name IS 'Custom category name if category is "others"';
