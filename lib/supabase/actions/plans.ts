"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approvePlan(planId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("plans")
    .update({
      status: "approved",
      last_updated: new Date().toISOString(),
    })
    .eq("id", planId)

  if (error) {
    console.error("[v0] Error approving plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  revalidatePath(`/manager/plans/${planId}`)
  return { success: true }
}

export async function rejectPlan(planId: string, reason: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("plans")
    .update({
      status: "rejected",
      rejection_reason: reason,
      last_updated: new Date().toISOString(),
    })
    .eq("id", planId)

  if (error) {
    console.error("[v0] Error rejecting plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  revalidatePath(`/manager/plans/${planId}`)
  return { success: true }
}

export async function sendCounterProposal(planId: string, newFixedFee: number, newHdrPct: number, message: string) {
  const supabase = await createServerClient()

  // Get current plan to save history
  const { data: currentPlan } = await supabase
    .from("plans")
    .select("counter_proposal_history, fixed_fee, hdr_pct")
    .eq("id", planId)
    .single()

  if (!currentPlan) {
    return { success: false, error: "Plan not found" }
  }

  const history = currentPlan.counter_proposal_history || []
  history.push({
    date: new Date().toISOString(),
    old_fixed_fee: currentPlan.fixed_fee,
    old_hdr_pct: currentPlan.hdr_pct,
    new_fixed_fee: newFixedFee,
    new_hdr_pct: newHdrPct,
    message,
  })

  const { error } = await supabase
    .from("plans")
    .update({
      status: "counter_proposal_sent",
      fixed_fee: newFixedFee,
      hdr_pct: newHdrPct,
      counter_proposal_history: history,
      last_updated: new Date().toISOString(),
    })
    .eq("id", planId)

  if (error) {
    console.error("[v0] Error sending counter proposal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  revalidatePath(`/manager/plans/${planId}`)
  return { success: true }
}

export async function createPlan(data: {
  client_id: string
  affiliate_id: string
  account_manager_id: string
  campaign_name: string
  start_date: string
  end_date: string
  fixed_fee: number
  hdr_pct: number
  estimated_budget: number
}) {
  const supabase = await createServerClient()

  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      ...data,
      status: "pending",
      proposed_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  return { success: true, data: plan }
}

export async function updatePlan(
  planId: string,
  data: {
    campaign_name?: string
    start_date?: string
    end_date?: string
    fixed_fee?: number
    hdr_pct?: number
    estimated_budget?: number
  },
) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("plans")
    .update({
      ...data,
      last_updated: new Date().toISOString(),
    })
    .eq("id", planId)

  if (error) {
    console.error("[v0] Error updating plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  revalidatePath(`/manager/plans/${planId}`)
  return { success: true }
}

export async function deletePlan(planId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("plans").delete().eq("id", planId)

  if (error) {
    console.error("[v0] Error deleting plan:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/plans")
  return { success: true }
}
