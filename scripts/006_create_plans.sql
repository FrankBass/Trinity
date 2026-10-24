-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  account_manager_id UUID NOT NULL REFERENCES public.account_managers(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'counter_proposal_sent')),
  fixed_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  hdr_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (hdr_pct >= 0 AND hdr_pct <= 100),
  estimated_budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
  proposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  counter_proposal_history JSONB DEFAULT '[]'::jsonb,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_plans_affiliate_id ON public.plans(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_plans_client_id ON public.plans(client_id);
CREATE INDEX IF NOT EXISTS idx_plans_account_manager_id ON public.plans(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON public.plans(status);
CREATE INDEX IF NOT EXISTS idx_plans_start_date ON public.plans(start_date);
CREATE INDEX IF NOT EXISTS idx_plans_end_date ON public.plans(end_date);
CREATE INDEX IF NOT EXISTS idx_plans_proposed_at ON public.plans(proposed_at);

-- Enable Row Level Security
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read plans"
  ON public.plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert plans"
  ON public.plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update plans"
  ON public.plans
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete plans"
  ON public.plans
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at and last_updated timestamps
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_plans_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plans_last_updated_trigger
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_last_updated();
