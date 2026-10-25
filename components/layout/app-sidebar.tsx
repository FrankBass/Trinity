"use client"

import { useRouter } from "next/navigation"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, LogOut } from "lucide-react"
import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/lib/store/user-store"
import { navigationConfig } from "@/lib/navigation/nav-items"
import { supabase } from "@/lib/supabase/client"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useUserStore()
  const router = useRouter()

  const { open, state } = useSidebar()
  React.useEffect(() => {
    console.log("[v0] AppSidebar render - sidebar state:", { open, state })
    console.log("[v0] AppSidebar render - user state:", {
      hasUser: !!user,
      role: user?.role,
      name: user?.name,
      isLoading,
    })
  }, [open, state, user, isLoading])

  if (isLoading) {
    console.log("[v0] AppSidebar: User is loading, showing skeleton")
    return (
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full bg-muted rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  if (!user) {
    console.log("[v0] AppSidebar: No user after loading, showing empty sidebar")
    return (
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">Trinity</span>
              <span className="text-xs text-muted-foreground">Affiliation Platform</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
        </SidebarContent>
      </Sidebar>
    )
  }

  const navGroups = navigationConfig[user.role] ?? navigationConfig["manager"] ?? []

  console.log("[v0] AppSidebar: Rendering navigation", {
    role: user.role,
    name: user.name,
    groupsCount: navGroups.length,
    totalItems: navGroups.reduce((sum, group) => sum + group.items.length, 0),
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      affiliate: "Affilié",
      client: "Client",
      am: "Account Manager",
      manager: "Manager",
      pole_manager: "Manager de Pôle",
      admin: "Admin d'Entité",
      owner: "Trinity Owner",
    }
    return labels[role] || role
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Trinity</span>
            <span className="text-xs text-muted-foreground">Affiliation Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role === "pole_manager" ? "pole" : user.role}/profile`}>
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
