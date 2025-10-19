"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Building2, Target } from "lucide-react"

export default function PoleManagerDashboard() {
  const stats = [
    { label: "Managers", value: "3", icon: Users, trend: "Stable", color: "text-blue-500" },
    { label: "Account Managers", value: "24", icon: Users, trend: "+3 ce trimestre", color: "text-purple-500" },
    {
      label: "CA du pôle",
      value: "1.2M€",
      icon: TrendingUp,
      trend: "+18% vs trimestre dernier",
      color: "text-green-500",
    },
    { label: "Objectif trimestriel", value: "92%", icon: Target, trend: "En bonne voie", color: "text-orange-500" },
  ]

  const managers = [
    { id: 1, name: "Jean Dupont", ams: 8, clients: 45, revenue: "285K€", performance: "+12%" },
    { id: 2, name: "Claire Moreau", ams: 10, clients: 58, revenue: "420K€", performance: "+25%" },
    { id: 3, name: "Marc Petit", ams: 6, clients: 32, revenue: "195K€", performance: "+8%" },
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

        <Card>
          <CardHeader>
            <CardTitle>Performance des Managers</CardTitle>
            <CardDescription>Suivi de vos équipes managériales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {managers.map((manager) => (
                <Card key={manager.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{manager.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{manager.ams} AMs</span>
                            <span>•</span>
                            <span>{manager.clients} clients</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">{manager.revenue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/10 text-green-500">{manager.performance}</Badge>
                        <Button variant="ghost" size="sm" className="mt-2">
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Répartition du CA</CardTitle>
              <CardDescription>Par manager ce trimestre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {managers.map((manager) => (
                  <div key={manager.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{manager.name}</span>
                      <span className="text-muted-foreground">{manager.revenue}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(Number.parseInt(manager.revenue.replace(/[^\d]/g, "")) / 1200) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
        </div>
      </div>
    </DashboardLayout>
  )
}
