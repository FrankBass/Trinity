import { createBrowserClient } from "@/lib/supabase/client"

export interface Campaign {
  id: string
  name: string
  clientId: string
  clientName: string
  startDate: string
  endDate: string
  status: "active" | "planned" | "completed"
  plans: number
  plansApproved: number
  plansPending: number
  affiliates: number
  budget: string
  budgetApproved: string
  gainsAffiliés?: string
  gainsAffiliésApproved?: string
  notreMarge?: string
  notreMargeApproved?: string
}

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = createBrowserClient()

  // Load all plans with their relationships and calculated columns
  const { data: plans, error } = await supabase.from("plans").select(`
      *,
      gains_affilie,
      notre_marge,
      depense_client,
      client:clients(id, name),
      affiliate:affiliates(id, name)
    `)

  if (error) {
    console.error("[v0] Error loading plans for campaigns:", error)
    return []
  }

  if (!plans || plans.length === 0) {
    return []
  }

  // Group plans by campaign_name and client_id
  const campaignMap = new Map<string, any>()

  for (const plan of plans) {
    const campaignKey = `${plan.campaign_name}-${plan.client_id}`

    if (!campaignMap.has(campaignKey)) {
      // Determine campaign status based on dates
      const now = new Date()
      const startDate = new Date(plan.start_date)
      const endDate = new Date(plan.end_date)

      let status: "active" | "planned" | "completed" = "planned"
      if (now >= startDate && now <= endDate) {
        status = "active"
      } else if (now > endDate) {
        status = "completed"
      }

      campaignMap.set(campaignKey, {
        id: campaignKey,
        name: plan.campaign_name,
        clientId: plan.client_id,
        clientName: plan.client?.name || "Unknown",
        startDate: plan.start_date,
        endDate: plan.end_date,
        status,
        plansList: [],
        affiliateIds: new Set(),
      })
    }

    const campaign = campaignMap.get(campaignKey)
    campaign.plansList.push(plan)
    if (plan.affiliate_id) {
      campaign.affiliateIds.add(plan.affiliate_id)
    }
  }

  // Convert to array and calculate statistics using Supabase columns when available
  const campaigns: Campaign[] = Array.from(campaignMap.values()).map((campaign) => {
    const allPlans = campaign.plansList

    const totalGainsAffiliésAll = allPlans.reduce((sum: number, plan: any) => {
      return sum + (plan.gains_affilie || plan.fixed_fee || 0)
    }, 0)
    const totalNotreMargeAll = allPlans.reduce((sum: number, plan: any) => {
      if (plan.notre_marge) return sum + plan.notre_marge
      const fixedFee = plan.fixed_fee || 0
      const hdrPct = plan.hdr_pct || 0
      return sum + fixedFee * (hdrPct / 100)
    }, 0)
    const totalBudgetAll =
      allPlans.reduce((sum: number, plan: any) => {
        return sum + (plan.depense_client || 0)
      }, 0) || totalGainsAffiliésAll + totalNotreMargeAll

    const approvedPlans = campaign.plansList.filter((p: any) => p.status === "approved")
    const totalGainsAffiliésApproved = approvedPlans.reduce((sum: number, plan: any) => {
      return sum + (plan.gains_affilie || plan.fixed_fee || 0)
    }, 0)
    const totalNotreMargeApproved = approvedPlans.reduce((sum: number, plan: any) => {
      if (plan.notre_marge) return sum + plan.notre_marge
      const fixedFee = plan.fixed_fee || 0
      const hdrPct = plan.hdr_pct || 0
      return sum + fixedFee * (hdrPct / 100)
    }, 0)
    const totalBudgetApproved =
      approvedPlans.reduce((sum: number, plan: any) => {
        return sum + (plan.depense_client || 0)
      }, 0) || totalGainsAffiliésApproved + totalNotreMargeApproved

    const pendingPlans = campaign.plansList.filter((p: any) => p.status === "pending")

    return {
      id: campaign.id,
      name: campaign.name,
      clientId: campaign.clientId,
      clientName: campaign.clientName,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      plans: campaign.plansList.length,
      plansApproved: approvedPlans.length,
      plansPending: pendingPlans.length,
      affiliates: campaign.affiliateIds.size,
      budget: `${(totalBudgetAll / 1000).toFixed(1)}K€`,
      budgetApproved: `${(totalBudgetApproved / 1000).toFixed(1)}K€`,
      gainsAffiliés: `${(totalGainsAffiliésAll / 1000).toFixed(1)}K€`,
      gainsAffiliésApproved: `${(totalGainsAffiliésApproved / 1000).toFixed(1)}K€`,
      notreMarge: `${(totalNotreMargeAll / 1000).toFixed(1)}K€`,
      notreMargeApproved: `${(totalNotreMargeApproved / 1000).toFixed(1)}K€`,
    }
  })

  return campaigns
}

// New function to get campaign stats from view
export async function getCampaignStats() {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("campaign_stats").select("*")

  if (error) {
    console.error("[v0] Error fetching campaign stats:", error)
    return []
  }

  return data || []
}

export async function getCampaignWithDetails(campaignIdentifier: string) {
  const supabase = createBrowserClient()

  console.log("[v0] Fetching campaign with details from Supabase:", campaignIdentifier)

  const decoded = decodeURIComponent(campaignIdentifier)

  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  const uuidMatch = decoded.match(uuidRegex)

  let campaignName: string
  let clientId: string | null = null

  if (uuidMatch) {
    clientId = uuidMatch[0]
    campaignName = decoded.replace(`-${clientId}`, "").trim()
  } else {
    campaignName = decoded
  }

  console.log("[v0] Parsed campaign name:", campaignName, "clientId:", clientId)

  let query = supabase
    .from("plans")
    .select(`
      *,
      gains_affilie,
      notre_marge,
      depense_client,
      client:clients(id, name),
      affiliate:affiliates(id, name),
      account_manager:account_managers(id, name)
    `)
    .eq("campaign_name", campaignName)

  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data: plans, error } = await query

  if (error) {
    console.error("[v0] Error fetching campaign details:", error)
    return null
  }

  if (!plans || plans.length === 0) {
    console.error("[v0] No plans found for campaign:", campaignName)
    return null
  }

  console.log("[v0] Loaded campaign from Supabase:", campaignName, "with", plans.length, "plans")

  const firstPlan = plans[0]
  const client = firstPlan.client

  const now = new Date()
  const startDate = new Date(firstPlan.start_date)
  const endDate = new Date(firstPlan.end_date)

  let status: "active" | "planned" | "completed" = "planned"
  if (now >= startDate && now <= endDate) {
    status = "active"
  } else if (now > endDate) {
    status = "completed"
  }

  const affiliateIds = new Set(plans.map((p) => p.affiliate_id).filter(Boolean))

  const calculateOurCommission = (plan: any) => {
    if (plan.notre_marge) return plan.notre_marge
    const fixedFee = plan.fixed_fee || 0
    const hdrPct = plan.hdr_pct || 0
    return fixedFee * (hdrPct / 100)
  }

  const calculateClientExpense = (plan: any) => {
    if (plan.depense_client) return plan.depense_client
    const fixedFee = plan.fixed_fee || 0
    const commission = calculateOurCommission(plan)
    return fixedFee + commission
  }

  return {
    name: campaignName,
    client: client?.name || "Unknown",
    clientId: firstPlan.client_id,
    startDate: firstPlan.start_date,
    endDate: firstPlan.end_date,
    status,
    budget: plans.reduce((sum, p) => sum + calculateClientExpense(p), 0).toString(),
    commission: firstPlan.hdr_pct || 20,
    objectives: "À définir",
    mechanics: "À définir",
    notes: "",
    plans,
    affiliatesCount: affiliateIds.size,
    calculateOurCommission,
    calculateClientExpense,
  }
}
