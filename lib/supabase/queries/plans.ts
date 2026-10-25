import { createBrowserClient } from "@/lib/supabase/client"

export interface Plan {
  id: string
  affiliate_id: string
  client_id: string
  account_manager_id: string
  campaign_name: string
  start_date: string
  end_date: string
  status: "pending" | "approved" | "rejected" | "counter_proposal_sent"
  fixed_fee: number
  hdr_pct: number
  estimated_budget: number
  proposed_at: string
  last_updated: string
  counter_proposal_history: any[]
  rejection_reason: string | null
  created_at: string
  updated_at: string
  gains_affilie?: number
  notre_marge?: number
  depense_client?: number
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("plans")
    .select(`
      *,
      client:clients(id, name, avatar, industry, company),
      affiliate:affiliates(id, name, avatar, company),
      account_manager:account_managers(id, name, email, avatar)
    `)
    .order("proposed_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching plans:", error)
    throw error
  }

  return data || []
}

export async function getPlansByAM(amId: string): Promise<Plan[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("plans")
    .select(`
      *,
      client:clients(id, name, avatar, industry, company),
      affiliate:affiliates(id, name, avatar, company),
      account_manager:account_managers(id, name, email, avatar)
    `)
    .eq("account_manager_id", amId)
    .order("proposed_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching plans by AM:", error)
    throw error
  }

  console.log("[v0] Loaded", data?.length || 0, "plans for AM from Supabase with relations")
  return data || []
}

export async function getPlansByClient(clientId: string): Promise<Plan[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("client_id", clientId)
    .order("proposed_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching plans by client:", error)
    throw error
  }

  return data || []
}

export async function getPlansByAffiliate(affiliateId: string): Promise<Plan[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("proposed_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching plans by affiliate:", error)
    throw error
  }

  return data || []
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("plans")
    .select(`
      *,
      client:clients(id, name, avatar, industry, company),
      affiliate:affiliates(id, name, avatar, company),
      account_manager:account_managers(id, name, email, avatar)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching plan:", error)
    return null
  }

  console.log("[v0] Loaded plan from Supabase:", data?.campaign_name)
  return data
}

export async function getPlanWithDetails(id: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("plans")
    .select(`
      *,
      gains_affilie,
      notre_marge,
      depense_client,
      client:clients(id, name, avatar, industry, company),
      affiliate:affiliates(id, name, avatar, company),
      account_manager:account_managers(id, name, email, avatar)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("[v0] Error fetching plan with details:", error)
    return null
  }

  console.log("[v0] Loaded plan from Supabase:", data?.campaign_name)
  return data
}

// Helper functions
export function calculateClientExpense(plan: Plan): number {
  return Math.round(plan.fixed_fee * (1 + plan.hdr_pct / 100))
}

export function calculateOurCommission(plan: Plan): number {
  return Math.round(plan.fixed_fee * (plan.hdr_pct / 100))
}

export async function updatePlanStatus(
  planId: string,
  status: "pending" | "approved" | "rejected" | "counter_proposal_sent",
  actorType: string,
  actorId: string,
  actorName: string,
  message: string,
  rejectionReason?: string,
): Promise<void> {
  const supabase = createBrowserClient()

  const updateData: any = {
    status,
    last_updated: new Date().toISOString(),
  }

  if (status === "approved") {
    updateData.validated_at = new Date().toISOString()
  }

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { error: updateError } = await supabase.from("plans").update(updateData).eq("id", planId)

  if (updateError) {
    console.error("[v0] Error updating plan status:", updateError)
    throw updateError
  }

  const { error: historyError } = await supabase.from("plan_history").insert({
    plan_id: planId,
    actor_type: actorType,
    actor_id: actorId,
    actor_name: actorName,
    status,
    action: status === "approved" ? "validated" : status === "rejected" ? "rejected" : "status_changed",
    message,
    changes: null,
    created_at: new Date().toISOString(),
  })

  if (historyError) {
    console.error("[v0] Error inserting into plan_history:", historyError)
    throw historyError
  }

  console.log("[v0] Plan status updated to:", status, "for plan:", planId)
}

export async function createCounterProposal(
  planId: string,
  fixedFee: number,
  hdrPct: number,
  placementText: string,
  managerId: string,
  managerName: string,
  currentPlan: any,
): Promise<void> {
  const supabase = createBrowserClient()

  const changes = []
  if (fixedFee !== currentPlan.fixed_fee) {
    changes.push({
      field: "fixedFee",
      label: "Frais fixes",
      oldValue: currentPlan.fixed_fee,
      newValue: fixedFee,
    })
  }
  if (hdrPct !== currentPlan.hdr_pct) {
    changes.push({
      field: "hdrPct",
      label: "HDR",
      oldValue: currentPlan.hdr_pct,
      newValue: hdrPct,
    })
  }
  if (placementText && placementText !== currentPlan.placement_text) {
    changes.push({
      field: "placementText",
      label: "Texte de placement",
      oldValue: currentPlan.placement_text || "",
      newValue: placementText,
    })
  }

  const updateData: any = {
    fixed_fee: fixedFee,
    hdr_pct: hdrPct,
    status: "counter_proposal_sent",
    last_updated: new Date().toISOString(),
  }

  if (placementText) {
    updateData.placement_text = placementText
  }

  const { error: updateError } = await supabase.from("plans").update(updateData).eq("id", planId)

  if (updateError) {
    console.error("[v0] Error creating counter proposal:", updateError)
    throw updateError
  }

  const { error: historyError } = await supabase.from("plan_history").insert({
    plan_id: planId,
    actor_type: "manager",
    actor_id: managerId,
    actor_name: managerName,
    status: "counter_proposal_sent",
    action: "counter_proposal",
    message: "Contre-proposition envoyée avec ajustements",
    changes: changes.length > 0 ? changes : null,
    created_at: new Date().toISOString(),
  })

  if (historyError) {
    console.error("[v0] Error inserting counter proposal into history:", historyError)
    throw historyError
  }

  console.log("[v0] Counter proposal created for plan:", planId)
}

export async function addPlanComment(planId: string, amId: string, amName: string, commentText: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("plan_comments").insert({
    plan_id: planId,
    am_id: amId,
    am_name: amName,
    comment_text: commentText,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error adding comment:", error)
    throw error
  }

  console.log("[v0] Comment added to plan:", planId)
}

export async function getPlanHistory(planId: string): Promise<any[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("plan_history")
    .select("*")
    .eq("plan_id", planId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching plan history:", error)
    return []
  }

  console.log("[v0] Loaded plan history from Supabase:", data?.length || 0, "entries")
  return data || []
}

export async function validatePlan(planId: string): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, "approved", "manager", "", "", "Plan validé")
}

export async function rejectPlan(planId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  return updatePlanStatus(planId, "rejected", "manager", "", "", "Plan rejeté", reason)
}

export async function getPlanComments(planId: string): Promise<any[]> {
  const supabase = createBrowserClient()

  console.log("[v0] Fetching plan comments from Supabase for plan:", planId)

  const { data, error } = await supabase
    .from("plan_comments")
    .select("*")
    .eq("plan_id", planId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching plan comments:", error)
    return []
  }

  console.log("[v0] Loaded plan comments from Supabase:", data?.length || 0, "comments")
  return data || []
}

export async function createPlan(planData: {
  campaign_name: string
  client_id: string
  affiliate_id: string
  account_manager_id: string
  start_date: string
  end_date: string
  fixed_fee?: number
  hdr_pct?: number
  status?: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = createBrowserClient()

  const newPlan = {
    campaign_name: planData.campaign_name,
    client_id: planData.client_id,
    affiliate_id: planData.affiliate_id,
    account_manager_id: planData.account_manager_id,
    start_date: planData.start_date,
    end_date: planData.end_date,
    fixed_fee: planData.fixed_fee || 0,
    hdr_pct: planData.hdr_pct || 0,
    status: planData.status || "pending",
    proposed_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("plans").insert(newPlan).select().single()

  if (error) {
    console.error("[v0] Error creating plan:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Plan created successfully:", data?.id)
  return { success: true, data }
}
