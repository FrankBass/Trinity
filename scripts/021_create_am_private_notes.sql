-- Create table for AM private notes
CREATE TABLE IF NOT EXISTS public.am_private_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  am_id UUID NOT NULL REFERENCES public.account_managers(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(am_id)
);

-- Enable RLS
ALTER TABLE public.am_private_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for all roles
CREATE POLICY "allow_all_on_am_private_notes_anon" ON public.am_private_notes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_on_am_private_notes_authenticated" ON public.am_private_notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_on_am_private_notes_postgres" ON public.am_private_notes
  FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Verification queries
SELECT 'Table am_private_notes created successfully' as status;
SELECT * FROM pg_policies WHERE tablename = 'am_private_notes';
