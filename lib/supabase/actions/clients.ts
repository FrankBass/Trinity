"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createClient(data: {
  name: string
  email: string
  company: string
  industry: string
  account_manager_id: string
  avatar?: string
}) {
  const supabase = await createServerClient()

  const { data: client, error } = await supabase.from("clients").insert(data).select().single()

  if (error) {
    console.error("[v0] Error creating client:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/clients")
  return { success: true, data: client }
}

export async function updateClient(
  clientId: string,
  data: {
    name?: string
    email?: string
    company?: string
    industry?: string
    account_manager_id?: string
    avatar?: string
  },
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("clients").update(data).eq("id", clientId)

  if (error) {
    console.error("[v0] Error updating client:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/clients")
  revalidatePath(`/manager/clients/${clientId}`)
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("clients").delete().eq("id", clientId)

  if (error) {
    console.error("[v0] Error deleting client:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/clients")
  return { success: true }
}
