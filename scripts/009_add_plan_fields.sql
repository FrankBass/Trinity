-- Add missing fields to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS placement_text TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS internal_notes TEXT;
