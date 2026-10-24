-- Add validated_at column to plans table to track when a plan was approved
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.plans.validated_at IS 'Timestamp when the plan was validated/approved';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_plans_validated_at ON public.plans(validated_at);

-- Update existing approved plans to have a validated_at date (using last_updated as fallback)
UPDATE public.plans
SET validated_at = last_updated
WHERE status = 'approved' AND validated_at IS NULL;

-- Verification query
SELECT id, campaign_name, status, validated_at, last_updated
FROM public.plans
WHERE status = 'approved'
ORDER BY validated_at DESC NULLS LAST
LIMIT 10;
