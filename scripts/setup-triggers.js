import pg from "pg"
const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const sql = `
  -- Supprimer les triggers s'ils existent déjà
  drop trigger if exists update_affiliates_updated_at on affiliates;
  drop trigger if exists update_clients_updated_at on clients;
  drop trigger if exists update_plans_updated_at on plans;
  drop trigger if exists update_am_objectives_updated_at on am_objectives;
  drop trigger if exists update_am_delegations_updated_at on am_delegations;

  -- (Re)Créer la fonction handle_updated_at
  create or replace function handle_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  -- Recréer les triggers
  create trigger update_affiliates_updated_at
    before update on affiliates
    for each row execute function handle_updated_at();

  create trigger update_clients_updated_at
    before update on clients
    for each row execute function handle_updated_at();

  create trigger update_plans_updated_at
    before update on plans
    for each row execute function handle_updated_at();

  create trigger update_am_objectives_updated_at
    before update on am_objectives
    for each row execute function handle_updated_at();

  create trigger update_am_delegations_updated_at
    before update on am_delegations
    for each row execute function handle_updated_at();

  -- Ajouter un index utile si manquant
  create index if not exists idx_plans_status_date on plans(status, start_date);
`

async function setupTriggers() {
  try {
    console.log("[v0] 🚀 Connexion à PostgreSQL...")
    await client.connect()
    console.log("[v0] ✅ Connecté avec succès!")

    console.log("[v0] 📝 Création (ou recréation) des triggers et de la fonction handle_updated_at()...")
    await client.query(sql)

    console.log("[v0] 🎉 Tous les triggers et indexes sont opérationnels !")
  } catch (error) {
    console.error("[v0] ❌ Erreur:", error.message)
  } finally {
    await client.end()
    console.log("[v0] 🔌 Connexion fermée")
  }
}

setupTriggers()
