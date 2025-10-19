"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Clock, ArrowUpRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function AMDashboard() {
  const stats = [
    { label: "Clients actifs", value: "12", icon: Users, trend: "+2 ce mois", color: "text-blue-500" },
    { label: "Plans en cours", value: "8", icon: FileText, trend: "3 en attente", color: "text-purple-500" },
    {
      label: "Taux de conversion",
      value: "68%",
      icon: TrendingUp,
      trend: "+5% vs mois dernier",
      color: "text-green-500",
    },
    {
      label: "Temps moyen validation",
      value: "2.3j",
      icon: Clock,
      trend: "-0.5j vs mois dernier",
      color: "text-orange-500",
    },
  ]

  const recentPlans = [
    { id: 1, client: "TechCorp", campaign: "Lancement Q1", status: "pending", date: "2025-01-15", amount: "15 000€" },
    {
      id: 2,
      client: "FashionBrand",
      campaign: "Collection Été",
      status: "approved",
      date: "2025-01-14",
      amount: "22 500€",
    },
    {
      id: 3,
      client: "FoodDelivery",
      campaign: "Expansion Régionale",
      status: "rejected",
      date: "2025-01-13",
      amount: "8 000€",
    },
    {
      id: 4,
      client: "FinanceApp",
      campaign: "Acquisition Utilisateurs",
      status: "pending",
      date: "2025-01-12",
      amount: "30 000€",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        )
      default:
        return (
          <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord AM</h1>
          <p className="text-muted-foreground">Gérez vos clients et suivez les performances</p>
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
              <CardTitle>Plans récents</CardTitle>
              <CardDescription>Dernières soumissions de vos clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.client}</p>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.campaign}</p>
                      <p className="text-xs text-muted-foreground">{plan.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{plan.amount}</p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/am/plans/${plan.id}`}>
                          Voir <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/am/plans">Voir tous les plans</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/am/clients">
                  <Users className="w-4 h-4 mr-2" />
                  Gérer mes clients
                </Link>
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/am/plans">
                  <FileText className="w-4 h-4 mr-2" />
                  Tableau Kanban des plans
                </Link>
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <Link href="/am/commissions">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Grilles de commissions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
