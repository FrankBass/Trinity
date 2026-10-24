-- Create am_objectives table for objectives history
create table if not exists public.am_objectives (
  id uuid primary key default gen_random_uuid(),
  am_id uuid not null references public.account_managers(id) on delete cascade,
  month text not null,
  objective numeric not null,
  achieved numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_am_month unique (am_id, month)
);

-- Enable Row Level Security
alter table public.am_objectives enable row level security;

-- Create policies for authenticated users (managers)
create policy "am_objectives_select_all"
  on public.am_objectives for select
  to authenticated
  using (true);

create policy "am_objectives_insert_all"
  on public.am_objectives for insert
  to authenticated
  with check (true);

create policy "am_objectives_update_all"
  on public.am_objectives for update
  to authenticated
  using (true);

create policy "am_objectives_delete_all"
  on public.am_objectives for delete
  to authenticated
  using (true);

-- Create indexes for faster lookups
create index if not exists am_objectives_am_id_idx on public.am_objectives(am_id);
create index if not exists am_objectives_month_idx on public.am_objectives(month);
