"use client"

import type React from "react"
import { useEffect } from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { initAuthListener, useUserStore } from "@/lib/store/user-store"
import { supabase } from "@/lib/supabase/client"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    console.log("[v0] DashboardLayout mounted, initializing auth")

    // Initialize the auth state listener
    initAuthListener()

    // Check for existing session and load user if present
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("[v0] Current session check:", session?.user?.email || "No session")

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, email, role, full_name")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("[v0] Error fetching profile on mount:", error.message)
          useUserStore.getState().setLoading(false)
          return
        }

        if (profile) {
          const user = {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || profile.email,
            role: profile.role,
          }

          console.log("[v0] User loaded on mount:", { email: user.email, role: user.role })
          useUserStore.getState().setUser(user)
        }
      } else {
        useUserStore.getState().setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="transition-all duration-200">
          <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
