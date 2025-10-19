"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, FileText, Calendar, Euro } from "lucide-react"
import { useState } from "react"

type PlanStatus = "pending" | "approved" | "rejected"

interface Plan {
  id: number
  client: string
  campaign: string
  amount: string
  date: string
  status: PlanStatus
  description: string
}

export default function AMPlansPage() {
  const [plans] = useState<Plan[]>([
    {
      id: 1,
      client: "TechCorp",
      campaign: "Lancement Q1",
      amount: "15 000€",
      date: "2025-01-15",
      status: "pending",
      description: "Campagne de lancement produit avec 50 affiliés",
    },
    {
      id: 2,
      client: "FashionBrand",
      campaign: "Collection Été",
      amount: "22 500€",
      date: "2025-01-14",
      status: "pending",
      description: "Promotion collection été avec influenceurs mode",
    },
    {
      id: 3,
      client: "FinanceApp",
      campaign: "Acquisition Utilisateurs",
      amount: "30 000€",
      date: "2025-01-12",
      status: "pending",
      description: "Programme d'affiliation pour acquisition utilisateurs",
    },
    {
      id: 4,
      client: "FashionBrand",
      campaign: "Black Friday",
      amount: "45 000€",
      date: "2025-01-10",
      status: "approved",
      description: "Campagne Black Friday avec commissions boostées",
    },
    {
      id: 5,
      client: "TechCorp",
      campaign: "Webinaires Q4",
      amount: "12 000€",
      date: "2025-01-08",
      status: "approved",
      description: "Série de webinaires avec affiliés tech",
    },
    {
      id: 6,
      client: "FoodDelivery",
      campaign: "Expansion Régionale",
      amount: "8 000€",
      date: "2025-01-05",
      status: "rejected",
      description: "Expansion géographique - budget insuffisant",
    },
  ])

  const getStatusConfig = (status: PlanStatus) => {
    switch (status) {
      case "approved":
        return { icon: CheckCircle2, label: "Approuvé", color: "bg-green-500/10 text-green-500 hover:bg-green-500/20" }
      case "rejected":
        return { icon: XCircle, label: "Rejeté", color: "bg-red-500/10 text-red-500 hover:bg-red-500/20" }
      default:
        return { icon: Clock, label: "En attente", color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" }
    }
  }

  const groupedPlans = {
    pending: plans.filter((p) => p.status === "pending"),
    approved: plans.filter((p) => p.status === "approved"),
    rejected: plans.filter((p) => p.status === "rejected"),
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau Kanban des plans</h1>
          <p className="text-muted-foreground">Suivez l'état de validation de vos plans</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* En attente */}
          <Card className="border-orange-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  En attente
                </CardTitle>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                  {groupedPlans.pending.length}
                </Badge>
              </div>
              <CardDescription>Plans en attente de validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedPlans.pending.map((plan) => {
                const config = getStatusConfig(plan.status)
                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{plan.client}</h4>
                          <p className="text-sm text-muted-foreground">{plan.campaign}</p>
                        </div>
                        <Badge className={config.color}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {plan.date}
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Euro className="h-3 w-3" />
                          {plan.amount}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-500 hover:bg-red-500/10 bg-transparent"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>

          {/* Approuvé */}
          <Card className="border-green-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Approuvé
                </CardTitle>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  {groupedPlans.approved.length}
                </Badge>
              </div>
              <CardDescription>Plans validés et actifs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedPlans.approved.map((plan) => {
                const config = getStatusConfig(plan.status)
                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{plan.client}</h4>
                          <p className="text-sm text-muted-foreground">{plan.campaign}</p>
                        </div>
                        <Badge className={config.color}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {plan.date}
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Euro className="h-3 w-3" />
                          {plan.amount}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <FileText className="w-3 h-3 mr-1" />
                        Voir détails
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>

          {/* Rejeté */}
          <Card className="border-red-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Rejeté
                </CardTitle>
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  {groupedPlans.rejected.length}
                </Badge>
              </div>
              <CardDescription>Plans refusés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedPlans.rejected.map((plan) => {
                const config = getStatusConfig(plan.status)
                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{plan.client}</h4>
                          <p className="text-sm text-muted-foreground">{plan.campaign}</p>
                        </div>
                        <Badge className={config.color}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {plan.date}
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Euro className="h-3 w-3" />
                          {plan.amount}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <FileText className="w-3 h-3 mr-1" />
                        Voir raison
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
