import { createBrowserClient } from "@/lib/supabase/client"

export type AccountManager = {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: "active" | "inactive" | "on_leave" | "transferred"
  join_date: string
  level: "senior" | "junior" | "stagiaire"
  monthly_objective?: number
  location?: string
  created_at?: string
  updated_at?: string
}

export async function getAllAccountManagers() {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("account_managers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching account managers:", error)
    throw error
  }

  return data as AccountManager[]
}

export async function getAccountManagerById(id: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("account_managers").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching account manager:", error)
    throw error
  }

  return data as AccountManager
}

export async function createAccountManager(am: Omit<AccountManager, "id" | "created_at" | "updated_at">) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("account_managers").insert([am]).select().single()

  if (error) {
    console.error("[v0] Error creating account manager:", error)
    throw error
  }

  return data as AccountManager
}

export async function updateAccountManager(id: string, updates: Partial<AccountManager>) {
  const supabase = createBrowserClient()

  console.log("[v0] Updating account manager in Supabase:", id, updates)

  const { data, error } = await supabase.from("account_managers").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating account manager:", error)
    throw error
  }

  console.log("[v0] Account manager updated successfully:", data)
  return data as AccountManager
}

export async function deleteAccountManager(id: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("account_managers").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting account manager:", error)
    throw error
  }
}

export { getAllAccountManagers as getAccountManagers }
