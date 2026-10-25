-- Create trigger to automatically set validated_at when plan is approved
CREATE OR REPLACE FUNCTION update_validated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being changed to 'approved' and validated_at is not set
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.validated_at IS NULL THEN
    NEW.validated_at = NOW();
  END IF;
  
  -- If status is changed from 'approved' to something else, clear validated_at
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    NEW.validated_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_validated_at_on_approval ON public.plans;

-- Create trigger
CREATE TRIGGER set_validated_at_on_approval
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_validated_at();

-- Add comment
COMMENT ON FUNCTION update_validated_at() IS 'Automatically sets validated_at timestamp when a plan is approved';

-- Verification queries
SELECT id, campaign_name, status, validated_at, last_updated
FROM public.plans
WHERE status = 'approved'
ORDER BY validated_at DESC NULLS LAST
LIMIT 5;

-- Test the trigger (optional - uncomment to test)
-- UPDATE public.plans SET status = 'approved' WHERE status = 'pending' LIMIT 1;
