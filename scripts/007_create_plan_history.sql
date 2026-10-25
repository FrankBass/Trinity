-- Create plan_history table for tracking all status changes and modifications
CREATE TABLE IF NOT EXISTS public.plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('affiliate', 'client', 'manager', 'am', 'system')),
  actor_id UUID,
  actor_name TEXT NOT NULL,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  changes JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_plan_history_plan_id ON public.plan_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_history_created_at ON public.plan_history(created_at);
CREATE INDEX IF NOT EXISTS idx_plan_history_actor_id ON public.plan_history(actor_id);

-- Enable Row Level Security
ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read plan history"
  ON public.plan_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert plan history"
  ON public.plan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
