"use client"

import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
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
