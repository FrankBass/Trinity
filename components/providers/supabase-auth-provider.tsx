"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface SupabaseAuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
})

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[v0] Session on mount:", session ? `User: ${session.user.email}` : "No session")
      setSession(session)
      setUser(session?.user ?? null)

      // Call whoami() to get user info including role
      if (session) {
        try {
          const { data: whoamiData, error } = await supabase.rpc("whoami")
          if (error) {
            console.error("[v0] Error calling whoami():", error.message)
          } else {
            console.log("[v0] User info from Supabase:", JSON.stringify(whoamiData))
          }
        } catch (err) {
          console.error("[v0] Exception calling whoami():", err)
        }
      }

      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[v0] Auth state changed:", _event, session ? `User: ${session.user.email}` : "No session")
      setSession(session)
      setUser(session?.user ?? null)

      // Call whoami() on auth state change
      if (session && _event === "SIGNED_IN") {
        try {
          const { data: whoamiData, error } = await supabase.rpc("whoami")
          if (error) {
            console.error("[v0] Error calling whoami():", error.message)
          } else {
            console.log("[v0] User info from Supabase:", JSON.stringify(whoamiData))
          }
        } catch (err) {
          console.error("[v0] Exception calling whoami():", err)
        }
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <SupabaseAuthContext.Provider value={{ user, session, isLoading }}>{children}</SupabaseAuthContext.Provider>
}

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}
