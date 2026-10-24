"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Target } from "lucide-react"

export default function PoleManagerDashboard() {
  // These will come from aggregated queries when pole management is fully implemented
  // Not hardcoded individual client data

  const stats = [
    { label: "Managers", value: "0", icon: Users, trend: "Stable", color: "text-blue-500" },
    { label: "Account Managers", value: "0", icon: Users, trend: "À configurer", color: "text-purple-500" },
    { label: "CA du pôle", value: "0€", icon: TrendingUp, trend: "À venir", color: "text-green-500" },
    { label: "Objectif trimestriel", value: "0%", icon: Target, trend: "À définir", color: "text-orange-500" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Pole Manager</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre pôle</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder for future implementation of pole management UI */}
        {/* <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Répartition du CA</CardTitle>
              <CardDescription>Par manager ce trimestre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Aggregated data will be inserted here */}
        {/* </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gestion du pôle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gérer les managers
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rapports consolidés
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Objectifs du pôle
              </Button>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </DashboardLayout>
  )
}
