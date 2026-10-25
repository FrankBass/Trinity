import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!category || !["emplacements", "ressources", "other"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Documents UPLOAD - Auth error or no user:", { authError, hasUser: !!user })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Documents UPLOAD - Authenticated user:", {
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Upload to Vercel Blob
    const blob = await put(`plans/${params.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    console.log("[v0] Documents UPLOAD - File uploaded to Blob:", blob.url)

    // Save to database
    const { data: document, error: dbError } = await supabase
      .from("plan_documents")
      .insert({
        plan_id: params.id,
        file_name: file.name,
        file_url: blob.url,
        file_type: file.type,
        file_size: file.size,
        category: category,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.log("[v0] Documents UPLOAD - Database insert error:", dbError.message)
      // Try to delete blob if database insert fails
      try {
        const { del } = await import("@vercel/blob")
        await del(blob.url)
        console.log("[v0] Documents UPLOAD - Cleaned up blob after DB error")
      } catch (cleanupError) {
        console.error("[v0] Documents UPLOAD - Blob cleanup error:", cleanupError)
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log("[v0] Documents UPLOAD - Success:", { documentId: document.id })
    return NextResponse.json({ document })
  } catch (error) {
    console.error("[v0] Documents UPLOAD - Unexpected error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
