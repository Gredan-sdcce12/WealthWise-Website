-- Migration: Add foreign key constraint to goals table
-- Ensures proper data integrity between goals and user_profiles

-- Add foreign key constraint for user_id
-- First, drop the existing FK if it exists with a different name
ALTER TABLE goals 
DROP CONSTRAINT IF EXISTS goals_user_id_fkey;

-- Now add the proper foreign key constraint
ALTER TABLE goals 
ADD CONSTRAINT goals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Create index for user_id if not present
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Add comment
COMMENT ON COLUMN goals.user_id IS 'Reference to user who set this goal';
