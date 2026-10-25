import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] ❌ Missing Supabase environment variables")
  console.error("[v0] Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// SQL pour créer toutes les tables
const sqlStatements = [
  {
    name: "account_managers",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists account_managers cascade;

      -- Créer la table account_managers
      create table account_managers (
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

      -- Activer RLS
      alter table account_managers enable row level security;

      -- Politique RLS permissive pour le développement
      create policy "Allow all operations for development"
        on account_managers
        for all
        using (true)
        with check (true);

      -- Index pour optimiser les requêtes
      create index idx_account_managers_status on account_managers(status);
      create index idx_account_managers_email on account_managers(email);
    `,
  },
  {
    name: "am_objectives",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists am_objectives cascade;

      -- Créer la table am_objectives
      create table am_objectives (
        id uuid primary key default gen_random_uuid(),
        am_id uuid not null references account_managers(id) on delete cascade,
        month text not null,
        objective numeric not null,
        achieved numeric not null default 0,
        created_at timestamptz not null default now()
      );

      -- Activer RLS
      alter table am_objectives enable row level security;

      -- Politique RLS permissive
      create policy "Allow all operations for development"
        on am_objectives
        for all
        using (true)
        with check (true);

      -- Index
      create index idx_am_objectives_am_id on am_objectives(am_id);
      create index idx_am_objectives_month on am_objectives(month);
    `,
  },
  {
    name: "am_delegations",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists am_delegations cascade;

      -- Créer la table am_delegations
      create table am_delegations (
        id uuid primary key default gen_random_uuid(),
        am_id uuid not null references account_managers(id) on delete cascade,
        delegated_to_id uuid not null references account_managers(id) on delete cascade,
        start_date date not null,
        end_date date not null,
        created_at timestamptz not null default now(),
        constraint valid_delegation_period check (end_date > start_date)
      );

      -- Activer RLS
      alter table am_delegations enable row level security;

      -- Politique RLS permissive
      create policy "Allow all operations for development"
        on am_delegations
        for all
        using (true)
        with check (true);

      -- Index
      create index idx_am_delegations_am_id on am_delegations(am_id);
      create index idx_am_delegations_delegated_to_id on am_delegations(delegated_to_id);
      create index idx_am_delegations_dates on am_delegations(start_date, end_date);
    `,
  },
  {
    name: "affiliates",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists affiliates cascade;

      -- Créer la table affiliates
      create table affiliates (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text unique not null,
        phone text,
        company text,
        status text not null default 'active' check (status in ('active', 'inactive')),
        join_date date not null default current_date,
        account_manager_id uuid not null references account_managers(id) on delete restrict,
        avatar text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      -- Activer RLS
      alter table affiliates enable row level security;

      -- Politique RLS permissive
      create policy "Allow all operations for development"
        on affiliates
        for all
        using (true)
        with check (true);

      -- Index
      create index idx_affiliates_status on affiliates(status);
      create index idx_affiliates_account_manager_id on affiliates(account_manager_id);
      create index idx_affiliates_email on affiliates(email);
    `,
  },
  {
    name: "clients",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists clients cascade;

      -- Créer la table clients
      create table clients (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text unique not null,
        phone text,
        company text not null,
        industry text,
        status text not null default 'active' check (status in ('active', 'inactive')),
        join_date date not null default current_date,
        account_manager_id uuid not null references account_managers(id) on delete restrict,
        avatar text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      -- Activer RLS
      alter table clients enable row level security;

      -- Politique RLS permissive
      create policy "Allow all operations for development"
        on clients
        for all
        using (true)
        with check (true);

      -- Index
      create index idx_clients_status on clients(status);
      create index idx_clients_account_manager_id on clients(account_manager_id);
      create index idx_clients_email on clients(email);
      create index idx_clients_industry on clients(industry);
    `,
  },
  {
    name: "plans",
    sql: `
      -- Supprimer la table si elle existe
      drop table if exists plans cascade;

      -- Créer la table plans
      create table plans (
        id uuid primary key default gen_random_uuid(),
        affiliate_id uuid not null references affiliates(id) on delete cascade,
        client_id uuid not null references clients(id) on delete cascade,
        account_manager_id uuid not null references account_managers(id) on delete restrict,
        campaign_name text not null,
        start_date date not null,
        end_date date not null,
        status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'counter_proposal_sent')),
        fixed_fee numeric not null,
        hdr_pct numeric not null,
        estimated_budget numeric not null,
        proposed_at timestamptz not null default now(),
        last_updated timestamptz not null default now(),
        counter_proposal_history jsonb,
        rejection_reason text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        constraint valid_plan_period check (end_date > start_date),
        constraint valid_hdr_pct check (hdr_pct >= 0 and hdr_pct <= 100)
      );

      -- Activer RLS
      alter table plans enable row level security;

      -- Politique RLS permissive
      create policy "Allow all operations for development"
        on plans
        for all
        using (true)
        with check (true);

      -- Index
      create index idx_plans_affiliate_id on plans(affiliate_id);
      create index idx_plans_client_id on plans(client_id);
      create index idx_plans_account_manager_id on plans(account_manager_id);
      create index idx_plans_status on plans(status);
      create index idx_plans_dates on plans(start_date, end_date);
    `,
  },
]

async function setupDatabase() {
  console.log("[v0] 🚀 Starting database setup...\n")

  for (const statement of sqlStatements) {
    console.log(`[v0] Creating table: ${statement.name}...`)

    const { data, error } = await supabase.rpc("exec_sql", {
      sql: statement.sql,
    })

    if (error) {
      console.error(`[v0] ❌ Error creating ${statement.name}:`, error.message)
      // Continue avec les autres tables même si une échoue
    } else {
      console.log(`[v0] ✅ Table ${statement.name} created successfully`)
    }
  }

  console.log("\n[v0] 🎉 Database setup complete!")
}

setupDatabase()
