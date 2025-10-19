import type { User } from "@/lib/store/user-store"

// Mock users for testing different roles
export const mockUsers: User[] = [
  {
    id: "1",
    email: "affiliate@trinity.com",
    name: "Jean Dupont",
    role: "affiliate",
    entityId: "entity-1",
    avatar: "/affiliate-avatar.jpg",
  },
  {
    id: "2",
    email: "client@trinity.com",
    name: "Marie Martin",
    role: "client",
    entityId: "entity-1",
    avatar: "/professional-client-avatar.png",
  },
  {
    id: "3",
    email: "am@trinity.com",
    name: "Pierre Bernard",
    role: "am",
    entityId: "entity-1",
    managerId: "manager-1",
    avatar: "/am-avatar.jpg",
  },
  {
    id: "4",
    email: "manager@trinity.com",
    name: "Sophie Dubois",
    role: "manager",
    entityId: "entity-1",
    poleId: "pole-1",
    avatar: "/manager-avatar.png",
  },
  {
    id: "5",
    email: "pole@trinity.com",
    name: "Luc Thomas",
    role: "pole_manager",
    entityId: "entity-1",
    poleId: "pole-1",
    avatar: "/pole-manager-avatar.jpg",
  },
  {
    id: "6",
    email: "admin@trinity.com",
    name: "Claire Robert",
    role: "admin",
    entityId: "entity-1",
    avatar: "/admin-avatar.png",
  },
  {
    id: "7",
    email: "owner@trinity.com",
    name: "Alexandre Petit",
    role: "owner",
    avatar: "/owner-avatar.jpg",
  },
]

export const authenticateUser = (email: string, password: string): User | null => {
  // Mock authentication - in real app, this would call an API
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password") {
    return user
  }
  return null
}
