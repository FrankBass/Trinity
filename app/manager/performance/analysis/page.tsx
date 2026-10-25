"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingDown, AlertCircle, Users, FileText } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PerformanceAnalysisPage() {
  const searchParams = useSearchParams()
  const amId = searchParams.get("am")

  const am = {
    id: 4,
    name: "Pierre Bernard",
    performance: "-3%",
    depenseClient: "28K€",
    marge: "5.6K€",
    clients: 4,
    plansEnCours: 3,
    plansValides: 22,
  }

  const issues = [
    {
      type: "critical",
      title: "Baisse de performance significative",
      description: "Performance en baisse de 3% par rapport au mois dernier",
      impact: "Perte estimée: 1.2K€ de marge",
    },
    {
      type: "warning",
      title: "Nombre de clients en baisse",
      description: "Perte de 2 clients ce mois",
      impact: "Réduction du portefeuille de 33%",
    },
    {
      type: "info",
      title: "Taux de validation des plans",
      description: "Seulement 65% des plans soumis sont validés",
      impact: "Moyenne équipe: 85%",
    },
  ]

  const recommendations = [
    {
      title: "Formation sur la qualification des leads",
      description: "Améliorer la qualité des plans soumis pour augmenter le taux de validation",
      priority: "high",
    },
    {
      title: "Accompagnement personnalisé",
      description: "Organiser des sessions 1-on-1 pour identifier les blocages",
      priority: "high",
    },
    {
      title: "Révision des objectifs",
      description: "Ajuster les objectifs mensuels en fonction de la situation actuelle",
      priority: "medium",
    },
  ]

  const getIssueBadge = (type: string) => {
    switch (type) {
      case "critical":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critique</Badge>
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Attention</Badge>
      default:
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Info</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/manager">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Analyse de performance</h1>
            <p className="text-muted-foreground">{am.name}</p>
          </div>
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <TrendingDown className="w-3 h-3 mr-1" />
            {am.performance}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{am.clients}</div>
              <p className="text-xs text-red-500">-2 ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépense Client</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{am.depenseClient}</div>
              <p className="text-xs text-red-500">{am.performance} vs mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Brute</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{am.marge}</div>
              <p className="text-xs text-muted-foreground">Notre commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans validés</CardTitle>
              <FileText className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{am.plansValides}</div>
              <p className="text-xs text-muted-foreground">{am.plansEnCours} en cours</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Problèmes identifiés</CardTitle>
              <CardDescription>Points nécessitant une attention immédiate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{issue.title}</p>
                      {getIssueBadge(issue.type)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{issue.description}</p>
                    <p className="text-xs font-medium text-red-600">{issue.impact}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <CardDescription>Actions suggérées pour améliorer la performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <Badge variant={rec.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                      {rec.priority === "high" ? "Priorité haute" : "Priorité moyenne"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
