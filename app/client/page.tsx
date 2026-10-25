"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, Target, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAffiliates } from "@/lib/supabase/queries/affiliates"
import { getCampaigns } from "@/lib/supabase/queries/campaigns"

export default function ClientDashboard() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [affiliatesData, campaignsData] = await Promise.all([getAffiliates(), getCampaigns()])
        console.log("[v0] Client Dashboard - Data loaded from Supabase:", { affiliatesData, campaignsData })
        setAffiliates(affiliatesData)
        setCampaigns(campaignsData)
      } catch (error) {
        console.error("[v0] Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Chargement...</div>
      </DashboardLayout>
    )
  }

  const topAffiliates = affiliates.slice(0, 3)
  const recentCampaigns = campaigns.slice(0, 3)

  const stats = [
    {
      title: "Affiliés actifs",
      value: String(affiliates.length),
      change: "+5 ce mois",
      icon: Users,
      trend: "up",
    },
    {
      title: "Ventes générées",
      value: "1,234",
      change: "+18.2%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Campagnes actives",
      value: String(campaigns.filter((c) => c.status === "active").length),
      change: "2 en attente",
      icon: Target,
      trend: "neutral",
    },
    {
      title: "CA généré",
      value: "45,670€",
      change: "+22.5%",
      icon: DollarSign,
      trend: "up",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Client</h1>
          <p className="text-muted-foreground">Gérez vos campagnes d'affiliation et suivez vos performances</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.trend === "up" && <span className="text-green-600">{stat.change}</span>}
                  {stat.trend === "neutral" && <span>{stat.change}</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Affiliés</CardTitle>
              <CardDescription>Vos meilleurs performeurs ce mois-ci</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAffiliates.map((affiliate, index) => (
                  <div key={affiliate.id} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      #{index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={affiliate.name} />
                      <AvatarFallback>
                        {affiliate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{affiliate.name}</p>
                      <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Voir tous les affiliés
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campagnes Récentes</CardTitle>
              <CardDescription>Vos dernières campagnes d'affiliation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{campaign.name}</p>
                        <Badge variant="default">Actif</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Voir toutes les campagnes
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activité récente</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des ventes</CardTitle>
                <CardDescription>Performance sur les 30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Graphique des ventes (à implémenter avec Recharts)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Taux de conversion moyen</CardTitle>
                  <CardDescription>Par campagne</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2.8%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-green-600">+0.5%</span> vs mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valeur moyenne par vente</CardTitle>
                  <CardDescription>Panier moyen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">37€</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-green-600">+3€</span> vs mois dernier
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières actions sur votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Nouvelle inscription",
                      detail: "Jean Dupont a rejoint la campagne Été 2025",
                      time: "Il y a 2h",
                    },
                    {
                      action: "Vente générée",
                      detail: "156€ de commission sur la campagne Premium",
                      time: "Il y a 4h",
                    },
                    { action: "Campagne créée", detail: "Black Friday 2025 a été créée", time: "Hier" },
                    { action: "Paiement effectué", detail: "12,450€ versés aux affiliés", time: "Il y a 2 jours" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
