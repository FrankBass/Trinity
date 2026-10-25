import { createBrowserClient } from "@/lib/supabase/client"

export interface Delegation {
  id: string
  am_id: string
  delegated_to_id: string
  start_date: string
  end_date: string
  created_at: string
  delegated_to?: {
    id: string
    name: string
    email: string
  }
}

export async function createDelegation(
  amId: string,
  delegatedToId: string,
  startDate: string,
  endDate: string,
): Promise<Delegation | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("am_delegations")
    .insert({
      am_id: amId,
      delegated_to_id: delegatedToId,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating delegation:", error)
    return null
  }

  return data
}

export async function getDelegationsByAM(amId: string): Promise<Delegation[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("am_delegations")
    .select(`
      *,
      delegated_to:delegated_to_id (
        id,
        name,
        email
      )
    `)
    .eq("am_id", amId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching delegations:", error)
    return []
  }

  return data || []
}

export async function deleteDelegation(delegationId: string): Promise<boolean> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("am_delegations").delete().eq("id", delegationId)

  if (error) {
    console.error("[v0] Error deleting delegation:", error)
    return false
  }

  return true
}
