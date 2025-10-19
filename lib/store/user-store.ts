import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "trinity-user-storage",
    },
  ),
)
