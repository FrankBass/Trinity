import { createBrowserClient } from "@/lib/supabase/client"

export interface AMStats {
  totalRevenue: number
  totalCommission: number
  approvedPlansCount: number
  pendingPlansCount: number
  rejectedPlansCount: number
}

export function calculateClientExpense(plan: any): number {
  const affiliateFee = plan.fixed_fee || 0
  const ourCommission = (affiliateFee * (plan.hdr_pct || 0)) / 100
  return affiliateFee + ourCommission
}

export function calculateOurCommission(plan: any): number {
  const affiliateFee = plan.fixed_fee || 0
  return (affiliateFee * (plan.hdr_pct || 0)) / 100
}

export async function getAMStats(amId: string): Promise<AMStats> {
  const supabase = createBrowserClient()

  // Fetch plans with calculated columns from Supabase
  const { data: plans, error } = await supabase
    .from("plans")
    .select("*, gains_affilie, notre_marge, depense_client")
    .eq("account_manager_id", amId)

  if (error) {
    console.error("[v0] Error fetching AM stats:", error)
    return {
      totalRevenue: 0,
      totalCommission: 0,
      approvedPlansCount: 0,
      pendingPlansCount: 0,
      rejectedPlansCount: 0,
    }
  }

  const approvedPlans = plans.filter((p) => p.status === "approved")
  const pendingPlans = plans.filter((p) => p.status === "pending")
  const rejectedPlans = plans.filter((p) => p.status === "rejected")

  // Use calculated columns from Supabase if available, fallback to JS calculation
  const totalRevenue = approvedPlans.reduce((sum, plan) => {
    return sum + (plan.depense_client || calculateClientExpense(plan))
  }, 0)
  const totalCommission = approvedPlans.reduce((sum, plan) => {
    return sum + (plan.notre_marge || calculateOurCommission(plan))
  }, 0)

  return {
    totalRevenue,
    totalCommission,
    approvedPlansCount: approvedPlans.length,
    pendingPlansCount: pendingPlans.length,
    rejectedPlansCount: rejectedPlans.length,
  }
}

export async function getAllStats() {
  const supabase = createBrowserClient()

  const { data: plans, error } = await supabase.from("plans").select("*, gains_affilie, notre_marge, depense_client")

  if (error) {
    console.error("[v0] Error fetching all stats:", error)
    return {
      totalPlans: 0,
      approvedPlans: 0,
      totalRevenue: 0,
      totalCommission: 0,
    }
  }

  const approvedPlans = plans.filter((p) => p.status === "approved")

  // Use calculated columns from Supabase if available, fallback to JS calculation
  const totalRevenue = approvedPlans.reduce((sum, plan) => {
    return sum + (plan.depense_client || calculateClientExpense(plan))
  }, 0)
  const totalCommission = approvedPlans.reduce((sum, plan) => {
    return sum + (plan.notre_marge || calculateOurCommission(plan))
  }, 0)

  return {
    totalPlans: plans.length,
    approvedPlans: approvedPlans.length,
    totalRevenue,
    totalCommission,
  }
}

export async function getDashboardStats() {
  const supabase = createBrowserClient()

  const [amsResult, clientsResult, plansResult, affiliatesResult] = await Promise.all([
    supabase.from("account_managers").select("*"),
    supabase.from("clients").select(`
      *,
      account_manager:account_managers(id, name, email, avatar)
    `),
    supabase.from("plans").select(`
      *,
      gains_affilie,
      notre_marge,
      depense_client,
      client:clients(id, name, avatar, industry, company),
      affiliate:affiliates(id, name, avatar, company),
      account_manager:account_managers(id, name, email, avatar)
    `),
    supabase.from("affiliates").select("*"),
  ])

  console.log("[v0] Dashboard data loaded:", {
    ams: amsResult.data?.length || 0,
    clients: clientsResult.data?.length || 0,
    plans: plansResult.data?.length || 0,
    affiliates: affiliatesResult.data?.length || 0,
  })

  return {
    accountManagers: amsResult.data || [],
    clients: clientsResult.data || [],
    plans: plansResult.data || [],
    affiliates: affiliatesResult.data || [],
  }
}

// New functions to fetch stats from Supabase views
export async function getAffiliateStatsFromView(affiliateId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("affiliate_stats").select("*").eq("affiliate_id", affiliateId).single()

  if (error) {
    console.error("[v0] Error fetching affiliate stats from view:", error)
    return null
  }

  console.log("[v0] Loaded affiliate stats from Supabase view")
  return data
}

export async function getClientStatsFromView(clientId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("client_stats").select("*").eq("client_id", clientId).single()

  if (error) {
    console.error("[v0] Error fetching client stats from view:", error)
    return null
  }

  console.log("[v0] Loaded client stats from Supabase view")
  return data
}

export async function getAMStatsFromView(amId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("am_stats").select("*").eq("am_id", amId).single()

  if (error) {
    console.error("[v0] Error fetching AM stats from view:", error)
    return null
  }

  console.log("[v0] Loaded AM stats from Supabase view")
  return data
}

export async function getCampaignStatsFromView() {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("campaign_stats").select("*")

  if (error) {
    console.error("[v0] Error fetching campaign stats from view:", error)
    return []
  }

  console.log("[v0] Loaded", data?.length || 0, "campaign stats from Supabase view")
  return data || []
}
