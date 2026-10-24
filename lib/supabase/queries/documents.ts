import { createBrowserClient } from "@/lib/supabase/client"

export async function getDocuments() {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("documents").select("*").order("upload_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching documents:", error)
    return []
  }

  return data || []
}

export async function getDocumentsByEntity(entityType: string, entityId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("upload_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching documents by entity:", error)
    return []
  }

  return data || []
}
