-- Make account manager objectives truly optional by allowing NULL values
-- This allows AMs to exist without mandatory quarterly objectives

-- Update the account_managers table to make monthly_objective nullable (if not already)
alter table public.account_managers 
  alter column monthly_objective drop not null;

-- Add comment explaining the optional nature
comment on column public.account_managers.monthly_objective is 
  'Optional monthly revenue objective for this AM in euros. Can be NULL if not defined.';

-- Verify the changes
select 
  column_name, 
  data_type, 
  is_nullable,
  column_default
from information_schema.columns 
where table_name = 'account_managers' 
  and column_name = 'monthly_objective';
