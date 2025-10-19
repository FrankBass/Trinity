"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, Globe, UserCog, Settings } from "lucide-react"

export default function OwnerDashboard() {
  const stats = [
    { label: "Entités", value: "5", icon: Building2, trend: "+1 ce trimestre", color: "text-blue-500" },
    { label: "Utilisateurs totaux", value: "847", icon: Users, trend: "+52 ce mois", color: "text-purple-500" },
    {
      label: "CA global",
      value: "8.5M€",
      icon: TrendingUp,
      trend: "+22% vs trimestre dernier",
      color: "text-green-500",
    },
    { label: "Pays actifs", value: "12", icon: Globe, trend: "+2 ce trimestre", color: "text-orange-500" },
  ]

  const entities = [
    { id: 1, name: "Trinity France", users: 156, poles: 4, revenue: "2.1M€", status: "active", growth: "+18%" },
    { id: 2, name: "Trinity UK", users: 203, poles: 5, revenue: "2.8M€", status: "active", growth: "+25%" },
    { id: 3, name: "Trinity Germany", users: 178, poles: 4, revenue: "1.9M€", status: "active", growth: "+12%" },
    { id: 4, name: "Trinity Spain", users: 142, poles: 3, revenue: "1.2M€", status: "active", growth: "+15%" },
    { id: 5, name: "Trinity Italy", users: 168, poles: 4, revenue: "1.5M€", status: "active", growth: "+20%" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trinity Owner Dashboard</h1>
          <p className="text-muted-foreground">Vue globale de toutes vos entités</p>
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
            <CardTitle>Entités globales</CardTitle>
            <CardDescription>Performance de vos entités par pays</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entities.map((entity) => (
                <Card key={entity.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{entity.name}</h3>
                            <Badge className="bg-green-500/10 text-green-500">
                              {entity.status === "active" ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{entity.users} utilisateurs</span>
                            <span>•</span>
                            <span>{entity.poles} pôles</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">{entity.revenue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/10 text-green-500 mb-2">{entity.growth}</Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <UserCog className="w-4 h-4 mr-1" />
                            Impersonate
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Détails
                          </Button>
                        </div>
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
              <CardDescription>Par entité ce trimestre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entities.map((entity) => (
                  <div key={entity.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-muted-foreground">{entity.revenue}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(Number.parseFloat(entity.revenue.replace(/[^\d.]/g, "")) / 8.5) * 100}%`,
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
              <CardTitle>Administration globale</CardTitle>
              <CardDescription>Gestion multi-entités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Gérer les entités
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <UserCog className="w-4 h-4 mr-2" />
                Mode impersonation
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres globaux
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rapports consolidés
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
