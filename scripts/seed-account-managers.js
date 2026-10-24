import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] ❌ Variables d'environnement Supabase manquantes")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Données par défaut des Account Managers
const defaultAccountManagers = [
  {
    name: "Sophie Martin",
    email: "sophie.martin@company.com",
    phone: "+33 6 12 34 56 78",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    status: "active",
    join_date: "2023-01-15",
    level: "senior",
    monthly_objective: 50000,
    location: "Paris, France",
  },
  {
    name: "Thomas Dubois",
    email: "thomas.dubois@company.com",
    phone: "+33 6 98 76 54 32",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    status: "active",
    join_date: "2023-03-20",
    level: "junior",
    monthly_objective: 30000,
    location: "Lyon, France",
  },
]

async function seedAccountManagers() {
  console.log("[v0] 🌱 Début du seed des Account Managers...")

  try {
    // Vérifier si des AMs existent déjà
    const { data: existingAMs, error: checkError } = await supabase.from("account_managers").select("id")

    if (checkError) {
      console.error("[v0] ❌ Erreur lors de la vérification:", checkError.message)
      return
    }

    if (existingAMs && existingAMs.length > 0) {
      console.log(`[v0] ℹ️  ${existingAMs.length} AM(s) déjà présent(s) dans la base`)
      console.log("[v0] ⚠️  Voulez-vous les remplacer ? (Modifiez le script pour forcer l'insertion)")
      return
    }

    // Insérer les AMs par défaut
    console.log("[v0] 📝 Insertion des Account Managers par défaut...")

    const { data, error } = await supabase.from("account_managers").insert(defaultAccountManagers).select()

    if (error) {
      console.error("[v0] ❌ Erreur lors de l'insertion:", error.message)
      return
    }

    console.log(`[v0] ✅ ${data.length} Account Manager(s) insérés avec succès!`)
    data.forEach((am) => {
      console.log(`[v0]    - ${am.name} (${am.email})`)
    })

    console.log("[v0] 🎉 Seed terminé avec succès!")
  } catch (error) {
    console.error("[v0] ❌ Erreur inattendue:", error.message)
  }
}

// Exécuter le seed
seedAccountManagers()
