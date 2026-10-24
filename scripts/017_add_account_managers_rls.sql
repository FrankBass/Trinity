-- Script 017: Add RLS permissions for account_managers table
-- This script enables RLS and creates permissive policies for account_managers

-- Enable RLS on account_managers table
ALTER TABLE account_managers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "allow_all_on_account_managers" ON account_managers;
DROP POLICY IF EXISTS "account_managers_select_policy" ON account_managers;
DROP POLICY IF EXISTS "account_managers_insert_policy" ON account_managers;
DROP POLICY IF EXISTS "account_managers_update_policy" ON account_managers;
DROP POLICY IF EXISTS "account_managers_delete_policy" ON account_managers;

-- Create a single permissive policy for all operations
CREATE POLICY "allow_all_on_account_managers"
  ON account_managers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to all roles
GRANT SELECT, INSERT, UPDATE, DELETE ON account_managers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON account_managers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON account_managers TO postgres;

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'account_managers';

-- Test query to ensure permissions work
-- This should return all account managers without permission errors
SELECT 
  COUNT(*) as total_account_managers,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_ams
FROM account_managers;
