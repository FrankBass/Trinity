"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCampaign(data: {
  plan_id: string
  name: string
  start_date: string
  end_date: string
  status: "active" | "completed" | "paused"
  actual_spent: number
  conversions: number
  revenue: number
}) {
  const supabase = await createServerClient()

  const { data: campaign, error } = await supabase.from("campaigns").insert(data).select().single()

  if (error) {
    console.error("[v0] Error creating campaign:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/campaigns")
  return { success: true, data: campaign }
}

export async function updateCampaign(
  campaignId: string,
  data: {
    name?: string
    start_date?: string
    end_date?: string
    status?: "active" | "completed" | "paused"
    actual_spent?: number
    conversions?: number
    revenue?: number
  },
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("campaigns").update(data).eq("id", campaignId)

  if (error) {
    console.error("[v0] Error updating campaign:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/campaigns")
  revalidatePath(`/manager/campaigns/${campaignId}`)
  return { success: true }
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("campaigns").delete().eq("id", campaignId)

  if (error) {
    console.error("[v0] Error deleting campaign:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/campaigns")
  return { success: true }
}
