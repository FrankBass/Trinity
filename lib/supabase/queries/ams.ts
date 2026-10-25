import { createBrowserClient } from "@/lib/supabase/client"

export interface AccountManager {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface AMWithStats extends AccountManager {
  total_clients: number
  total_affiliates: number
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

export async function getAccountManagers(): Promise<AccountManager[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("account_managers").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching account managers:", error)
    throw error
  }

  return data || []
}

export const getAllAccountManagers = getAccountManagers

export async function getAMsWithStats(): Promise<AMWithStats[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("am_stats").select("*").order("am_name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching AMs with stats:", error)
    return []
  }

  return data || []
}

export async function getAccountManagerById(id: string): Promise<AccountManager | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("account_managers").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching account manager:", error)
    return null
  }

  return data
}

export async function getAMWithDetails(id: string): Promise<AMWithStats | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("am_stats").select("*").eq("am_id", id).single()

  if (error) {
    console.error("[v0] Error fetching AM with details:", error)
    return null
  }

  console.log("[v0] Loaded AM from Supabase:", data?.am_name)
  return data
}
