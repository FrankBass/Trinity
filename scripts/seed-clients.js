import pg from "pg"

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const defaultClients = [
  {
    name: "Desigual",
    email: "contact@desigual.fr",
    phone: "+33 1 11 22 33 44",
    company: "Desigual France SAS",
    industry: "Mode & Textile",
    status: "active",
    join_date: "2025-01-05",
    account_manager_id: null, // Will be set after we get AM IDs
  },
  {
    name: "Miliboo",
    email: "contact@miliboo.com",
    phone: "+33 1 22 33 44 55",
    company: "Miliboo SARL",
    industry: "Ameublement",
    status: "active",
    join_date: "2025-01-12",
    account_manager_id: null,
  },
]

async function seedClients() {
  try {
    console.log("[v0] 🚀 Connexion à PostgreSQL...")
    await client.connect()
    console.log("[v0] ✅ Connecté avec succès!")

    // Get Account Managers IDs
    console.log("[v0] 📝 Récupération des Account Managers...")
    const amsResult = await client.query(
      "SELECT id, name FROM account_managers WHERE name IN ('Sophie Martin', 'Thomas Dubois') ORDER BY name",
    )

    if (amsResult.rows.length !== 2) {
      throw new Error("Les Account Managers n'ont pas été trouvés. Exécutez d'abord seed-account-managers.js")
    }

    const sophieId = amsResult.rows.find((am) => am.name === "Sophie Martin").id
    const thomasId = amsResult.rows.find((am) => am.name === "Thomas Dubois").id

    // Assign AMs to clients
    defaultClients[0].account_manager_id = sophieId // Desigual -> Sophie
    defaultClients[1].account_manager_id = thomasId // Miliboo -> Thomas

    // Check if clients already exist
    const existingClients = await client.query("SELECT email FROM clients")
    const existingEmails = existingClients.rows.map((c) => c.email)

    // Insert clients
    for (const clientData of defaultClients) {
      if (existingEmails.includes(clientData.email)) {
        console.log(`[v0] ⏭️  Client ${clientData.name} existe déjà, ignoré`)
        continue
      }

      console.log(`[v0] 📝 Insertion du client: ${clientData.name}...`)
      await client.query(
        `INSERT INTO clients (name, email, phone, company, industry, status, join_date, account_manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          clientData.name,
          clientData.email,
          clientData.phone,
          clientData.company,
          clientData.industry,
          clientData.status,
          clientData.join_date,
          clientData.account_manager_id,
        ],
      )
      console.log(`[v0] ✅ Client ${clientData.name} inséré avec succès!`)
    }

    console.log("[v0] 🎉 Seed des clients terminé avec succès!")
  } catch (error) {
    console.error("[v0] ❌ Erreur:", error.message)
    throw error
  } finally {
    await client.end()
  }
}

seedClients()
