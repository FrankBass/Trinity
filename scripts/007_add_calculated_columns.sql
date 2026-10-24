-- Add calculated columns to plans table
-- These will be automatically calculated and stored

-- Add gains_affilie (same as fixed_fee but explicit naming)
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS gains_affilie NUMERIC(10, 2) GENERATED ALWAYS AS (fixed_fee) STORED;

-- Add notre_marge (fixed_fee * hdr_pct / 100)
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS notre_marge NUMERIC(10, 2) GENERATED ALWAYS AS (fixed_fee * hdr_pct / 100) STORED;

-- Add depense_client (fixed_fee + notre_marge)
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS depense_client NUMERIC(10, 2) GENERATED ALWAYS AS (fixed_fee + (fixed_fee * hdr_pct / 100)) STORED;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_gains_affilie ON public.plans(gains_affilie);
CREATE INDEX IF NOT EXISTS idx_plans_notre_marge ON public.plans(notre_marge);
CREATE INDEX IF NOT EXISTS idx_plans_depense_client ON public.plans(depense_client);

-- Add comment to explain the columns
COMMENT ON COLUMN public.plans.gains_affilie IS 'Gains proposés par l''affilié (identique à fixed_fee)';
COMMENT ON COLUMN public.plans.notre_marge IS 'Notre marge calculée (fixed_fee * hdr_pct / 100)';
COMMENT ON COLUMN public.plans.depense_client IS 'Dépense totale du client (fixed_fee + notre_marge)';
