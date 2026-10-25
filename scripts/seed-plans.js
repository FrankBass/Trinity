import pg from "pg"

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD
function convertDate(dateStr) {
  const [day, month, year] = dateStr.split("/")
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

// Campaigns data (will be embedded in plans)
const campaigns = {
  camp1: {
    name: "Black Friday",
    clientName: "Desigual",
    startDate: "01/11/2025",
    endDate: "30/11/2025",
    budget: 50000,
    status: "active",
  },
  camp2: {
    name: "Soldes d'hiver",
    clientName: "Desigual",
    startDate: "08/01/2026",
    endDate: "04/02/2026",
    budget: 45000,
    status: "active",
  },
  camp3: {
    name: "Soldes d'été",
    clientName: "Desigual",
    startDate: "25/06/2025",
    endDate: "29/07/2025",
    budget: 40000,
    status: "completed",
  },
  camp4: {
    name: "Black Friday",
    clientName: "Miliboo",
    startDate: "01/11/2025",
    endDate: "30/11/2025",
    budget: 35000,
    status: "active",
  },
  camp5: {
    name: "Soldes d'hiver",
    clientName: "Miliboo",
    startDate: "08/01/2026",
    endDate: "04/02/2026",
    budget: 30000,
    status: "active",
  },
  camp6: {
    name: "Soldes d'été",
    clientName: "Miliboo",
    startDate: "25/06/2025",
    endDate: "29/07/2025",
    budget: 28000,
    status: "completed",
  },
}

// Plans data (12 plans)
const plansData = [
  // Desigual - Black Friday (2 plans)
  {
    campaignKey: "camp1",
    affiliateName: "iGraal",
    clientName: "Desigual",
    fixedFee: 3500,
    hdrPct: 15,
    placementText: "Bannière homepage + Newsletter Black Friday",
    status: "approved",
    submittedDate: "20/10/2025",
    validatedDate: "22/10/2025",
  },
  {
    campaignKey: "camp1",
    affiliateName: "Poulpeo",
    clientName: "Desigual",
    fixedFee: 3000,
    hdrPct: 15,
    placementText: "Email blast + Push notification Black Friday",
    status: "pending",
    submittedDate: "23/10/2025",
  },
  // Desigual - Soldes d'hiver (2 plans)
  {
    campaignKey: "camp2",
    affiliateName: "iGraal",
    clientName: "Desigual",
    fixedFee: 3200,
    hdrPct: 15,
    placementText: "Bannière homepage + Newsletter Soldes hiver",
    status: "approved",
    submittedDate: "15/12/2025",
    validatedDate: "17/12/2025",
  },
  {
    campaignKey: "camp2",
    affiliateName: "Poulpeo",
    clientName: "Desigual",
    fixedFee: 2800,
    hdrPct: 15,
    placementText: "Email blast Soldes hiver",
    status: "pending",
    submittedDate: "16/12/2025",
  },
  // Desigual - Soldes d'été (2 plans - COMPLETED)
  {
    campaignKey: "camp3",
    affiliateName: "iGraal",
    clientName: "Desigual",
    fixedFee: 3000,
    hdrPct: 15,
    placementText: "Bannière homepage + Newsletter Soldes été",
    status: "approved",
    submittedDate: "10/06/2025",
    validatedDate: "12/06/2025",
    reattributedDate: "05/08/2025",
  },
  {
    campaignKey: "camp3",
    affiliateName: "Poulpeo",
    clientName: "Desigual",
    fixedFee: 2600,
    hdrPct: 15,
    placementText: "Email blast Soldes été",
    status: "approved",
    submittedDate: "11/06/2025",
    validatedDate: "13/06/2025",
    reattributedDate: "06/08/2025",
  },
  // Miliboo - Black Friday (2 plans)
  {
    campaignKey: "camp4",
    affiliateName: "Dealabs",
    clientName: "Miliboo",
    fixedFee: 2800,
    hdrPct: 18,
    placementText: "Article sponsorisé + Bannière Black Friday",
    status: "approved",
    submittedDate: "18/10/2025",
    validatedDate: "20/10/2025",
  },
  {
    campaignKey: "camp4",
    affiliateName: "Ma Réduction",
    clientName: "Miliboo",
    fixedFee: 2400,
    hdrPct: 18,
    placementText: "Newsletter + Push notification Black Friday",
    status: "pending",
    submittedDate: "21/10/2025",
  },
  // Miliboo - Soldes d'hiver (2 plans)
  {
    campaignKey: "camp5",
    affiliateName: "Dealabs",
    clientName: "Miliboo",
    fixedFee: 2600,
    hdrPct: 18,
    placementText: "Article sponsorisé + Bannière Soldes hiver",
    status: "approved",
    submittedDate: "12/12/2025",
    validatedDate: "14/12/2025",
  },
  {
    campaignKey: "camp5",
    affiliateName: "Ma Réduction",
    clientName: "Miliboo",
    fixedFee: 2200,
    hdrPct: 18,
    placementText: "Newsletter Soldes hiver",
    status: "pending",
    submittedDate: "13/12/2025",
  },
  // Miliboo - Soldes d'été (2 plans - COMPLETED)
  {
    campaignKey: "camp6",
    affiliateName: "Dealabs",
    clientName: "Miliboo",
    fixedFee: 2400,
    hdrPct: 18,
    placementText: "Article sponsorisé + Bannière Soldes été",
    status: "approved",
    submittedDate: "08/06/2025",
    validatedDate: "10/06/2025",
    reattributedDate: "03/08/2025",
  },
  {
    campaignKey: "camp6",
    affiliateName: "Ma Réduction",
    clientName: "Miliboo",
    fixedFee: 2000,
    hdrPct: 18,
    placementText: "Newsletter Soldes été",
    status: "approved",
    submittedDate: "09/06/2025",
    validatedDate: "11/06/2025",
    reattributedDate: "04/08/2025",
  },
]

async function seedPlans() {
  try {
    console.log("[v0] 🚀 Connexion à PostgreSQL...")
    await client.connect()
    console.log("[v0] ✅ Connecté avec succès!")

    // Fetch all affiliates, clients, and AMs
    console.log("[v0] 📝 Récupération des données existantes...")
    const affiliatesResult = await client.query("SELECT id, name FROM affiliates")
    const clientsResult = await client.query("SELECT id, name FROM clients")
    const amsResult = await client.query("SELECT id, name FROM account_managers")

    const affiliatesMap = new Map(affiliatesResult.rows.map((a) => [a.name, a.id]))
    const clientsMap = new Map(clientsResult.rows.map((c) => [c.name, c.id]))
    const amsMap = new Map(amsResult.rows.map((am) => [am.name, am.id]))

    console.log(`[v0] ✅ Trouvé ${affiliatesMap.size} affiliés, ${clientsMap.size} clients, ${amsMap.size} AMs`)

    // Insert plans
    for (const plan of plansData) {
      const campaign = campaigns[plan.campaignKey]
      const affiliateId = affiliatesMap.get(plan.affiliateName)
      const clientId = clientsMap.get(plan.clientName)

      // Get AM ID from client
      const clientResult = await client.query("SELECT account_manager_id FROM clients WHERE id = $1", [clientId])
      const accountManagerId = clientResult.rows[0]?.account_manager_id

      if (!affiliateId || !clientId || !accountManagerId) {
        console.log(
          `[v0] ⚠️ Skipping plan: missing IDs (affiliate: ${affiliateId}, client: ${clientId}, AM: ${accountManagerId})`,
        )
        continue
      }

      console.log(`[v0] 📝 Insertion du plan: ${plan.affiliateName} → ${campaign.name} (${plan.clientName})...`)

      await client.query(
        `
        INSERT INTO plans (
          affiliate_id, client_id, account_manager_id,
          campaign_name, start_date, end_date,
          fixed_fee, hdr_pct, placement_text,
          status, submitted_date, validated_date, reattributed_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
        [
          affiliateId,
          clientId,
          accountManagerId,
          campaign.name,
          convertDate(campaign.startDate),
          convertDate(campaign.endDate),
          plan.fixedFee,
          plan.hdrPct,
          plan.placementText,
          plan.status,
          convertDate(plan.submittedDate),
          plan.validatedDate ? convertDate(plan.validatedDate) : null,
          plan.reattributedDate ? convertDate(plan.reattributedDate) : null,
        ],
      )

      console.log(`[v0] ✅ Plan inséré avec succès!`)
    }

    console.log("[v0] 🎉 Seed des plans terminé avec succès!")
  } catch (error) {
    console.error("[v0] ❌ Erreur:", error.message)
    throw error
  } finally {
    await client.end()
  }
}

seedPlans()
