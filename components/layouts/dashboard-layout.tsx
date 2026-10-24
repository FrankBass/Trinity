"use client"

import type { ReactNode } from "react"
import { DashboardLayout as OriginalDashboardLayout } from "@/components/layout/dashboard-layout"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <OriginalDashboardLayout>{children}</OriginalDashboardLayout>
}
