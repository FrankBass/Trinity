-- Update RLS policies for plans table to allow updates

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to update plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert plans" ON plans;

-- Allow authenticated users to update plan status and related fields
CREATE POLICY "Allow authenticated users to update plans"
  ON plans FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert plans (for counter proposals)
CREATE POLICY "Allow authenticated users to insert plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant UPDATE and INSERT permissions to authenticated users
GRANT UPDATE (status, fixed_fee, hdr_pct, placement_text, rejection_reason, updated_at) ON plans TO authenticated;
GRANT INSERT ON plans TO authenticated;
