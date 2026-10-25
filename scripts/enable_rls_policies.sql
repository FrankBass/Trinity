-- Enable RLS policies for updates on account_managers table
-- This allows authenticated users to update account manager records

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow account_managers updates" ON public.account_managers;

-- Create policy to allow updates for authenticated users
CREATE POLICY "Allow account_managers updates"
ON public.account_managers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Also enable SELECT for authenticated users if not already enabled
DROP POLICY IF EXISTS "Allow account_managers select" ON public.account_managers;

CREATE POLICY "Allow account_managers select"
ON public.account_managers
FOR SELECT
TO authenticated
USING (true);

-- Enable policies for other tables that might need updates
DROP POLICY IF EXISTS "Allow clients updates" ON public.clients;

CREATE POLICY "Allow clients updates"
ON public.clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow affiliates updates" ON public.affiliates;

CREATE POLICY "Allow affiliates updates"
ON public.affiliates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow plans updates" ON public.plans;

CREATE POLICY "Allow plans updates"
ON public.plans
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
