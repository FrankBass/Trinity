import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase/client"

export type UserRole = "affiliate" | "client" | "am" | "manager" | "pole_manager" | "admin" | "owner"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  entityId?: string
  poleId?: string
  managerId?: string
  avatar?: string
  firstName?: string
  lastName?: string
  phone?: string
  location?: string
  memberSince?: string
  notificationPreferences?: {
    newPlans: boolean
    performanceAlerts: boolean
    weeklyReports: boolean
    messageNotifications: boolean
  }
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "trinity-user-storage",
      onRehydrateStorage: () => (state) => {
        console.log(
          "[v0] User store hydrated:",
          state?.user ? { role: state.user.role, name: state.user.name } : "No user",
        )
        if (state) {
          state.isLoading = false
        }
      },
    },
  ),
)

let authListenerInitialized = false

export const initAuthListener = () => {
  if (authListenerInitialized) {
    console.log("[v0] Auth listener already initialized")
    return
  }

  console.log("[v0] Initializing auth listener...")

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("[v0] Auth state change detected:", event, session?.user?.email)

    if (event === "SIGNED_IN" && session?.user) {
      console.log("[v0] Fetching user profile from Supabase...")

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("[v0] Error fetching profile:", error)
        useUserStore.getState().setLoading(false)
        return
      }

      if (profile) {
        const user = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.email,
          role: profile.role as UserRole,
        }

        console.log("[v0] User store updated from Supabase:", { email: user.email, role: user.role })
        useUserStore.getState().setUser(user)
      }
    } else if (event === "SIGNED_OUT") {
      console.log("[v0] User signed out, clearing store")
      useUserStore.getState().logout()
    } else if (event === "INITIAL_SESSION") {
      console.log("[v0] Initial session check")
      if (!session) {
        useUserStore.getState().setLoading(false)
      }
    }
  })

  authListenerInitialized = true
}

export const useUser = useUserStore
