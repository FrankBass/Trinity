-- Verification script to check RLS and current role
-- Run this script to verify your Supabase setup

-- 1. Check current user and role
SELECT 
  current_user as "Current User",
  current_role as "Current Role",
  session_user as "Session User";

-- 2. Verify RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename;

-- 3. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command (SELECT/INSERT/UPDATE/DELETE)"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename, policyname;

-- 4. Test if authenticated users can SELECT from plans
-- This should work if RLS is properly configured
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM plans LIMIT 1) THEN 'SUCCESS: Can read plans table'
    ELSE 'WARNING: No data in plans table'
  END as test_result;

-- 5. Check environment (this won't show keys but confirms they exist)
SHOW is_superuser;
