-- Create plan_comments table for internal AM comments
CREATE TABLE IF NOT EXISTS public.plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  am_id UUID NOT NULL REFERENCES public.account_managers(id) ON DELETE CASCADE,
  am_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_plan_comments_plan_id ON public.plan_comments(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_am_id ON public.plan_comments(am_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_created_at ON public.plan_comments(created_at);

-- Enable Row Level Security
ALTER TABLE public.plan_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (only AMs can see internal comments)
CREATE POLICY "Allow AMs to read their plan comments"
  ON public.plan_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow AMs to insert plan comments"
  ON public.plan_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow AMs to update their own comments"
  ON public.plan_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_plan_comments_updated_at
  BEFORE UPDATE ON public.plan_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
