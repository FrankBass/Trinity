import { createBrowserClient } from "@/lib/supabase/client"

export interface Affiliate {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  status: "active" | "inactive"
  join_date: string
  account_manager_id: string
  avatar: string | null
  created_at: string
  updated_at: string
  account_manager: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export interface AffiliateWithStats extends Affiliate {
  total_plans: number
  validated_plans: number
  total_gains_affilie: number
  validated_gains_affilie: number
  total_notre_marge: number
  validated_notre_marge: number
  total_depense_client: number
  validated_depense_client: number
  avg_hdr_pct: number
}

export async function getAffiliates(): Promise<Affiliate[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("affiliates")
    .select(`
      *,
      account_manager:account_managers(id, name, email, avatar)
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching affiliates:", error)
    throw error
  }

  return data || []
}

export async function getAffiliatesWithStats(): Promise<AffiliateWithStats[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("affiliate_stats")
    .select("*")
    .order("affiliate_name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching affiliates with stats:", error)
    return []
  }

  return data || []
}

export async function getAffiliatesByAM(amId: string): Promise<Affiliate[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("account_manager_id", amId)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching affiliates by AM:", error)
    throw error
  }

  return data || []
}

export async function getAffiliateById(id: string): Promise<Affiliate | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("affiliates").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching affiliate:", error)
    return null
  }

  return data
}

export async function getAffiliateWithDetails(id: string) {
  const supabase = createBrowserClient()

  console.log("[v0] Fetching affiliate with details from Supabase:", id)

  const [affiliateResult, plansResult] = await Promise.all([
    supabase
      .from("affiliates")
      .select(`
      *,
      account_manager:account_managers(id, name, email, avatar)
    `)
      .eq("id", id)
      .single(),
    supabase
      .from("plans")
      .select(`
      *,
      gains_affilie,
      notre_marge,
      depense_client,
      client:clients(id, name),
      account_manager:account_managers(id, name)
    `)
      .eq("affiliate_id", id),
  ])

  if (affiliateResult.error) {
    console.error("[v0] Error fetching affiliate details:", affiliateResult.error)
    return null
  }

  const affiliate = affiliateResult.data
  const plans = plansResult.data || []

  console.log("[v0] Loaded affiliate from Supabase:", affiliate.name, "with", plans.length, "plans")

  return {
    affiliate,
    plans,
  }
}
