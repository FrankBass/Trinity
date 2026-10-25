-- Create table for plan remunerations (REMs)
CREATE TABLE IF NOT EXISTS plan_remunerations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'desktop')),
  customer_type TEXT NOT NULL CHECK (customer_type IN ('new', 'old')),
  rem_value DECIMAL(5,2) NOT NULL, -- Example: 4.00 for HDR + 4%
  rem_type TEXT NOT NULL DEFAULT 'hdr_plus', -- 'hdr_plus', 'fixed', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, device_type, customer_type)
);

-- Add RLS policies
ALTER TABLE plan_remunerations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view remunerations"
  ON plan_remunerations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow managers to insert remunerations"
  ON plan_remunerations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow managers to update remunerations"
  ON plan_remunerations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow managers to delete remunerations"
  ON plan_remunerations FOR DELETE
  TO authenticated
  USING (true);

-- Add columns to plans table for parameterization status
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS is_parameterized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS should_follow BOOLEAN DEFAULT true;
