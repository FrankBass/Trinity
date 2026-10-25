"use client"

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

let browserClient: ReturnType<typeof createSupabaseBrowserClient<Database>> | undefined

export function createClient() {
  // Return existing instance if already created
  if (browserClient) {
    return browserClient
  }

  // Create new instance only if none exists
  browserClient = createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  )

  console.log("[v0] Browser client created with ANON_KEY")
  return browserClient
}

export const createBrowserClient = createClient

export const supabase = createClient()
