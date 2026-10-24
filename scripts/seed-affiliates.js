import pg from "pg"

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const defaultAffiliates = [
  {
    name: "iGraal",
    email: "contact@igraal.com",
    phone: "+33 1 23 45 67 89",
    company: "iGraal SAS",
    status: "active",
    join_date: "2024-01-10",
    account_manager_id: null, // Will be set after we get AM IDs
  },
  {
    name: "Poulpeo",
    email: "hello@poulpeo.com",
    phone: "+33 1 34 56 78 90",
    company: "Poulpeo SARL",
    status: "active",
    join_date: "2024-02-15",
    account_manager_id: null,
  },
  {
    name: "Dealabs",
    email: "contact@dealabs.com",
    phone: "+33 1 45 67 89 01",
    company: "Dealabs SAS",
    status: "active",
    join_date: "2024-03-20",
    account_manager_id: null,
  },
  {
    name: "Ma Réduction",
    email: "info@mareduction.com",
    phone: "+33 1 56 78 90 12",
    company: "Ma Réduction SARL",
    status: "active",
    join_date: "2024-04-05",
    account_manager_id: null,
  },
]

async function seedAffiliates() {
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

    // Assign AMs to affiliates (first 2 to Sophie, last 2 to Thomas)
    defaultAffiliates[0].account_manager_id = sophieId
    defaultAffiliates[1].account_manager_id = sophieId
    defaultAffiliates[2].account_manager_id = thomasId
    defaultAffiliates[3].account_manager_id = thomasId

    // Check if affiliates already exist
    const existingAffiliates = await client.query("SELECT email FROM affiliates")
    const existingEmails = existingAffiliates.rows.map((a) => a.email)

    // Insert affiliates
    for (const affiliate of defaultAffiliates) {
      if (existingEmails.includes(affiliate.email)) {
        console.log(`[v0] ⏭️  Affilié ${affiliate.name} existe déjà, ignoré`)
        continue
      }

      console.log(`[v0] 📝 Insertion de l'affilié: ${affiliate.name}...`)
      await client.query(
        `INSERT INTO affiliates (name, email, phone, company, status, join_date, account_manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          affiliate.name,
          affiliate.email,
          affiliate.phone,
          affiliate.company,
          affiliate.status,
          affiliate.join_date,
          affiliate.account_manager_id,
        ],
      )
      console.log(`[v0] ✅ Affilié ${affiliate.name} inséré avec succès!`)
    }

    console.log("[v0] 🎉 Seed des affiliés terminé avec succès!")
  } catch (error) {
    console.error("[v0] ❌ Erreur:", error.message)
    throw error
  } finally {
    await client.end()
  }
}

seedAffiliates()
