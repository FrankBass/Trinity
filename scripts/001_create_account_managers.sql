-- Drop existing policies if they exist
drop policy if exists "account_managers_select_all" on public.account_managers;
drop policy if exists "account_managers_insert_all" on public.account_managers;
drop policy if exists "account_managers_update_all" on public.account_managers;
drop policy if exists "account_managers_delete_all" on public.account_managers;

-- Drop table if exists (for clean slate)
drop table if exists public.account_managers cascade;

-- Create account_managers table
create table public.account_managers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  avatar text,
  status text not null default 'active' check (status in ('active', 'inactive', 'on_leave', 'transferred')),
  join_date date not null default current_date,
  level text not null default 'junior' check (level in ('senior', 'junior', 'intern')),
  monthly_objective numeric,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes
create index account_managers_email_idx on public.account_managers(email);
create index account_managers_status_idx on public.account_managers(status);

-- Enable RLS
alter table public.account_managers enable row level security;

-- Create single permissive policy for all operations
create policy "allow_all_for_development"
  on public.account_managers
  for all
  using (true)
  with check (true);
