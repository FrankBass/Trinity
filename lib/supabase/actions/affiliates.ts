"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAffiliate(data: {
  name: string
  email: string
  company: string
  account_manager_id: string
  avatar?: string
}) {
  const supabase = await createServerClient()

  const { data: affiliate, error } = await supabase.from("affiliates").insert(data).select().single()

  if (error) {
    console.error("[v0] Error creating affiliate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/affiliates")
  return { success: true, data: affiliate }
}

export async function updateAffiliate(
  affiliateId: string,
  data: {
    name?: string
    email?: string
    company?: string
    account_manager_id?: string
    avatar?: string
  },
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("affiliates").update(data).eq("id", affiliateId)

  if (error) {
    console.error("[v0] Error updating affiliate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/affiliates")
  revalidatePath(`/manager/affiliates/${affiliateId}`)
  return { success: true }
}

export async function deleteAffiliate(affiliateId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("affiliates").delete().eq("id", affiliateId)

  if (error) {
    console.error("[v0] Error deleting affiliate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/affiliates")
  return { success: true }
}
