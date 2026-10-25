-- Ensure validated_at column exists in plans table
-- This is a safety script in case the column was not created yet

DO $$ 
BEGIN
  -- Add validated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plans' 
    AND column_name = 'validated_at'
  ) THEN
    ALTER TABLE public.plans ADD COLUMN validated_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN public.plans.validated_at IS 'Timestamp when the plan was validated/approved';
    
    CREATE INDEX IF NOT EXISTS idx_plans_validated_at ON public.plans(validated_at);
    
    -- Update existing approved plans
    UPDATE public.plans
    SET validated_at = last_updated
    WHERE status = 'approved' AND validated_at IS NULL;
    
    RAISE NOTICE 'Column validated_at added to plans table';
  ELSE
    RAISE NOTICE 'Column validated_at already exists in plans table';
  END IF;
END $$;
