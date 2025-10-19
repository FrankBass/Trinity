"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/store/user-store"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, setUser } = useUserStore()
  const [isChecking, setIsChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          const userData = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            entityId: profile.entity_id,
            poleId: profile.pole_id,
            managerId: profile.manager_id,
            avatar: profile.avatar,
          }
          setUser(userData)

          const roleRoutes = {
            affiliate: "/affiliate",
            client: "/client",
            am: "/am",
            manager: "/manager",
            pole_manager: "/pole-manager",
            entity_admin: "/entity-admin",
            owner: "/owner",
          }
          router.push(roleRoutes[userData.role])
        } else {
          router.push("/login")
        }
      } else if (isAuthenticated && user) {
        // Use stored user data
        const roleRoutes = {
          affiliate: "/affiliate",
          client: "/client",
          am: "/am",
          manager: "/manager",
          pole_manager: "/pole-manager",
          entity_admin: "/entity-admin",
          owner: "/owner",
        }
        router.push(roleRoutes[user.role])
      } else {
        router.push("/login")
      }

      setIsChecking(false)
    }

    checkSession()
  }, [isAuthenticated, user, router, setUser, supabase])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return null
}
