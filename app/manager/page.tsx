"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, FileText, AlertCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default function ManagerDashboard() {
  const stats = [
    { label: "Account Managers", value: "8", icon: Users, trend: "+1 ce mois", color: "text-blue-500" },
    { label: "Clients totaux", value: "45", icon: Users, trend: "+7 ce mois", color: "text-purple-500" },
    { label: "CA mensuel", value: "285K€", icon: TrendingUp, trend: "+12% vs mois dernier", color: "text-green-500" },
    { label: "Plans en attente", value: "12", icon: FileText, trend: "Action requise", color: "text-orange-500" },
  ]

  const accountManagers = [
    { id: 1, name: "Sophie Martin", clients: 6, revenue: "42K€", performance: "+15%", status: "excellent" },
    { id: 2, name: "Thomas Dubois", clients: 5, revenue: "38K€", performance: "+8%", status: "good" },
    { id: 3, name: "Marie Laurent", clients: 7, revenue: "55K€", performance: "+22%", status: "excellent" },
    { id: 4, name: "Pierre Bernard", clients: 4, revenue: "28K€", performance: "-3%", status: "attention" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-500/10 text-green-500">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-500/10 text-blue-500">Bon</Badge>
      default:
        return <Badge className="bg-orange-500/10 text-orange-500">Attention</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Manager</h1>
          <p className="text-muted-foreground">Supervisez votre équipe d'Account Managers</p>
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance des AMs</CardTitle>
              <CardDescription>Vue d'ensemble de votre équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountManagers.map((am) => (
                  <div
                    key={am.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{am.name}</p>
                        {getStatusBadge(am.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{am.clients} clients</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{am.revenue}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${am.performance.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                      >
                        {am.performance}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/manager/ams/${am.id}`}>
                          Détails <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/manager/ams">Voir tous les AMs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertes et actions</CardTitle>
              <CardDescription>Points nécessitant votre attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">12 plans en attente de validation</p>
                  <p className="text-xs text-muted-foreground">Certains plans dépassent le délai standard</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Voir les plans
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Performance AM en baisse</p>
                  <p className="text-xs text-muted-foreground">Pierre Bernard: -3% ce mois</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Analyser
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Objectif mensuel atteint</p>
                  <p className="text-xs text-muted-foreground">285K€ / 250K€ (114%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
