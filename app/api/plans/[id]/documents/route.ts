import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Documents GET - Auth error or no user:", { authError, hasUser: !!user })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Documents GET - Authenticated user:", {
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const { data: documents, error } = await supabase
      .from("plan_documents")
      .select("*")
      .eq("plan_id", params.id)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.log("[v0] Documents GET - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Documents GET - Success:", { count: documents?.length || 0 })
    return NextResponse.json({ documents })
  } catch (error) {
    console.error("[v0] Documents GET - Unexpected error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Documents DELETE - Auth error or no user:", { authError, hasUser: !!user })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Documents DELETE - Authenticated user:", {
      userId: user.id,
      email: user.email,
    })

    // Get document to delete from blob
    const { data: document, error: fetchError } = await supabase
      .from("plan_documents")
      .select("file_url")
      .eq("id", documentId)
      .single()

    if (fetchError) {
      console.log("[v0] Documents DELETE - Fetch error:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Delete from database
    const { error: deleteError } = await supabase.from("plan_documents").delete().eq("id", documentId)

    if (deleteError) {
      console.log("[v0] Documents DELETE - Delete error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Delete from Vercel Blob
    if (document?.file_url) {
      try {
        const { del } = await import("@vercel/blob")
        await del(document.file_url)
        console.log("[v0] Documents DELETE - Blob deleted successfully")
      } catch (blobError) {
        console.error("[v0] Documents DELETE - Blob deletion error:", blobError)
        // Continue even if blob deletion fails
      }
    }

    console.log("[v0] Documents DELETE - Success")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Documents DELETE - Unexpected error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
