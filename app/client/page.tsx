"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, Target, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ClientDashboard() {
  const stats = [
    {
      title: "Affiliés actifs",
      value: "47",
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
      value: "8",
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

  const topAffiliates = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@example.com",
      sales: 156,
      revenue: "8,450€",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie@example.com",
      sales: 134,
      revenue: "7,230€",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Pierre Bernard",
      email: "pierre@example.com",
      sales: 98,
      revenue: "5,890€",
      avatar: "/placeholder.svg",
    },
  ]

  const recentCampaigns = [
    {
      id: 1,
      name: "Promotion Été 2025",
      status: "active",
      affiliates: 23,
      conversions: 456,
      revenue: "12,340€",
    },
    {
      id: 2,
      name: "Lancement Nouveau Produit",
      status: "active",
      affiliates: 18,
      conversions: 289,
      revenue: "8,670€",
    },
    {
      id: 3,
      name: "Black Friday",
      status: "scheduled",
      affiliates: 35,
      conversions: 0,
      revenue: "0€",
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
                      <AvatarImage src={affiliate.avatar || "/placeholder.svg"} alt={affiliate.name} />
                      <AvatarFallback>
                        {affiliate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{affiliate.name}</p>
                      <p className="text-sm text-muted-foreground">{affiliate.sales} ventes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{affiliate.revenue}</p>
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
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status === "active" ? "Actif" : "Planifié"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {campaign.affiliates} affiliés • {campaign.conversions} conversions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{campaign.revenue}</p>
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
