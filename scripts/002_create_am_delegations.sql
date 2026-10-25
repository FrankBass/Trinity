-- Create am_delegations table for temporary access delegation
create table if not exists public.am_delegations (
  id uuid primary key default gen_random_uuid(),
  am_id uuid not null references public.account_managers(id) on delete cascade,
  delegated_to_id uuid not null references public.account_managers(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_date_range check (end_date > start_date)
);

-- Enable Row Level Security
alter table public.am_delegations enable row level security;

-- Create policies for authenticated users (managers)
create policy "am_delegations_select_all"
  on public.am_delegations for select
  to authenticated
  using (true);

create policy "am_delegations_insert_all"
  on public.am_delegations for insert
  to authenticated
  with check (true);

create policy "am_delegations_update_all"
  on public.am_delegations for update
  to authenticated
  using (true);

create policy "am_delegations_delete_all"
  on public.am_delegations for delete
  to authenticated
  using (true);

-- Create indexes for faster lookups
create index if not exists am_delegations_am_id_idx on public.am_delegations(am_id);
create index if not exists am_delegations_delegated_to_id_idx on public.am_delegations(delegated_to_id);
create index if not exists am_delegations_dates_idx on public.am_delegations(start_date, end_date);
