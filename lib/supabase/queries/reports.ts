import { createBrowserClient } from "@/lib/supabase/client"

export async function getReports() {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching reports:", error)
    return []
  }

  return data || []
}
