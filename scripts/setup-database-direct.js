import pg from "pg"

const { Client } = pg

// Connexion directe à PostgreSQL (bypass l'API Supabase)
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
})

const sqlStatements = [
  {
    name: "account_managers",
    sql: `
      DROP TABLE IF EXISTS account_managers CASCADE;
      
      CREATE TABLE account_managers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        avatar TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'transferred')),
        join_date DATE NOT NULL DEFAULT CURRENT_DATE,
        level TEXT NOT NULL DEFAULT 'junior' CHECK (level IN ('senior', 'junior', 'intern')),
        monthly_objective NUMERIC,
        location TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_account_managers_status ON account_managers(status);
      CREATE INDEX idx_account_managers_email ON account_managers(email);
    `,
  },
  {
    name: "am_objectives",
    sql: `
      DROP TABLE IF EXISTS am_objectives CASCADE;
      
      CREATE TABLE am_objectives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        am_id UUID NOT NULL REFERENCES account_managers(id) ON DELETE CASCADE,
        month TEXT NOT NULL,
        objective NUMERIC NOT NULL,
        achieved NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_am_objectives_am_id ON am_objectives(am_id);
      CREATE INDEX idx_am_objectives_month ON am_objectives(month);
    `,
  },
  {
    name: "am_delegations",
    sql: `
      DROP TABLE IF EXISTS am_delegations CASCADE;
      
      CREATE TABLE am_delegations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        am_id UUID NOT NULL REFERENCES account_managers(id) ON DELETE CASCADE,
        delegated_to_id UUID NOT NULL REFERENCES account_managers(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT valid_delegation_dates CHECK (end_date > start_date)
      );

      CREATE INDEX idx_am_delegations_am_id ON am_delegations(am_id);
      CREATE INDEX idx_am_delegations_delegated_to_id ON am_delegations(delegated_to_id);
      CREATE INDEX idx_am_delegations_dates ON am_delegations(start_date, end_date);
    `,
  },
  {
    name: "affiliates",
    sql: `
      DROP TABLE IF EXISTS affiliates CASCADE;
      
      CREATE TABLE affiliates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        join_date DATE NOT NULL DEFAULT CURRENT_DATE,
        account_manager_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_affiliates_status ON affiliates(status);
      CREATE INDEX idx_affiliates_account_manager_id ON affiliates(account_manager_id);
      CREATE INDEX idx_affiliates_email ON affiliates(email);
    `,
  },
  {
    name: "clients",
    sql: `
      DROP TABLE IF EXISTS clients CASCADE;
      
      CREATE TABLE clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        company TEXT NOT NULL,
        industry TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        join_date DATE NOT NULL DEFAULT CURRENT_DATE,
        account_manager_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_clients_status ON clients(status);
      CREATE INDEX idx_clients_account_manager_id ON clients(account_manager_id);
      CREATE INDEX idx_clients_email ON clients(email);
      CREATE INDEX idx_clients_company ON clients(company);
    `,
  },
  {
    name: "plans",
    sql: `
      DROP TABLE IF EXISTS plans CASCADE;
      
      CREATE TABLE plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        account_manager_id UUID NOT NULL REFERENCES account_managers(id) ON DELETE CASCADE,
        campaign_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'counter_proposal_sent')),
        fixed_fee NUMERIC NOT NULL DEFAULT 0,
        hdr_pct NUMERIC NOT NULL DEFAULT 0 CHECK (hdr_pct >= 0 AND hdr_pct <= 100),
        estimated_budget NUMERIC NOT NULL DEFAULT 0,
        proposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        counter_proposal_history JSONB,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT valid_plan_dates CHECK (end_date > start_date)
      );

      CREATE INDEX idx_plans_affiliate_id ON plans(affiliate_id);
      CREATE INDEX idx_plans_client_id ON plans(client_id);
      CREATE INDEX idx_plans_account_manager_id ON plans(account_manager_id);
      CREATE INDEX idx_plans_status ON plans(status);
      CREATE INDEX idx_plans_dates ON plans(start_date, end_date);
    `,
  },
]

async function setupDatabase() {
  try {
    console.log("[v0] 🚀 Connexion à PostgreSQL...")
    await client.connect()
    console.log("[v0] ✅ Connecté avec succès!")

    for (const statement of sqlStatements) {
      console.log(`[v0] 📝 Création de la table: ${statement.name}...`)
      await client.query(statement.sql)
      console.log(`[v0] ✅ Table ${statement.name} créée avec succès!`)
    }

    console.log("\n[v0] 🎉 Toutes les tables ont été créées avec succès!")
    console.log("[v0] 📊 Tables créées:")
    console.log("[v0]   - account_managers")
    console.log("[v0]   - am_objectives")
    console.log("[v0]   - am_delegations")
    console.log("[v0]   - affiliates")
    console.log("[v0]   - clients")
    console.log("[v0]   - plans")
  } catch (err) {
    console.error("[v0] ❌ Erreur lors de la création des tables:", err.message)
    console.error("[v0] Détails:", err)
  } finally {
    await client.end()
    console.log("[v0] 🔌 Connexion fermée")
  }
}

setupDatabase()
