import { createBrowserClient } from "@/lib/supabase/client"

export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  industry: string | null
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
  } | null
}

export interface ClientWithStats extends Client {
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

export async function getClients(): Promise<Client[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      account_manager:account_managers(id, name, email, avatar)
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching clients:", error)
    throw error
  }

  return data || []
}

export async function getClientsWithStats(): Promise<ClientWithStats[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("client_stats").select("*").order("client_name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching clients with stats:", error)
    return []
  }

  return data || []
}

export async function getClientsByAM(amId: string): Promise<Client[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("account_manager_id", amId)
    .order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching clients by AM:", error)
    throw error
  }

  return data || []
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching client:", error)
    return null
  }

  return data
}

export async function getClientWithDetails(id: string) {
  const supabase = createBrowserClient()

  console.log("[v0] Fetching client with details from Supabase:", id)

  const [clientResult, plansResult] = await Promise.all([
    supabase
      .from("clients")
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
      affiliate:affiliates(id, name),
      account_manager:account_managers(id, name)
    `)
      .eq("client_id", id),
  ])

  if (clientResult.error) {
    console.error("[v0] Error fetching client details:", clientResult.error)
    return null
  }

  const client = clientResult.data
  const plans = plansResult.data || []

  console.log("[v0] Loaded client from Supabase:", client.name, "with", plans.length, "plans")

  // Group plans by campaign
  const campaignMap = new Map()

  for (const plan of plans) {
    const campaignKey = plan.campaign_name
    if (!campaignMap.has(campaignKey)) {
      campaignMap.set(campaignKey, {
        id: campaignKey,
        name: plan.campaign_name,
        startDate: plan.start_date,
        endDate: plan.end_date,
        status: "active",
        plans: [],
      })
    }
    campaignMap.get(campaignKey).plans.push(plan)
  }

  const campaigns = Array.from(campaignMap.values()).map((campaign) => ({
    ...campaign,
    plansCount: campaign.plans.length,
    approvedPlans: campaign.plans.filter((p: any) => p.status === "approved").length,
    budget: campaign.plans.reduce((sum: number, p: any) => sum + (p.depense_client || 0), 0),
  }))

  return {
    client,
    campaigns,
    plans,
  }
}
