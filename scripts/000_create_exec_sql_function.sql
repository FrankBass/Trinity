-- Create a function to execute arbitrary SQL
-- This function is needed for the automated setup script to work
-- ⚠️ This must be executed ONCE in the Supabase SQL Editor

-- Modified function to return JSON with success/error status
create or replace function exec_sql(sql text)
returns json
language plpgsql
security definer
as $$
begin
  execute sql;
  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', sqlerrm);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function exec_sql(text) to authenticated;
grant execute on function exec_sql(text) to anon;
grant execute on function exec_sql(text) to service_role;
