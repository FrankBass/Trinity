"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreVertical, Users, TrendingUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCampaigns } from "@/lib/supabase/queries/campaigns"

export default function ClientCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await getCampaigns()
        console.log("[v0] Client Campaigns loaded from Supabase:", data)
        setCampaigns(data)
      } catch (error) {
        console.error("[v0] Error loading campaigns:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCampaigns()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Chargement...</div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      scheduled: "secondary",
      paused: "outline",
    }
    const labels: Record<string, string> = {
      active: "Actif",
      scheduled: "Planifié",
      paused: "En pause",
      completed: "Terminé",
    }
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Campagnes</h1>
            <p className="text-muted-foreground">Créez et gérez vos campagnes d'affiliation</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une campagne..." className="pl-9" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Toutes ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="active">Actives ({campaigns.filter((c) => c.status === "active").length})</TabsTrigger>
            <TabsTrigger value="scheduled">
              Planifiées ({campaigns.filter((c) => c.status === "scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="paused">En pause ({campaigns.filter((c) => c.status === "paused").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{campaign.campaign_name}</CardTitle>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <CardDescription>
                          {new Date(campaign.start_date).toLocaleDateString("fr-FR")} -{" "}
                          {new Date(campaign.end_date).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem>Voir les statistiques</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Affiliés</p>
                          <p className="text-lg font-bold">0</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clics</p>
                        <p className="text-lg font-bold">0</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="text-lg font-bold">0</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-lg font-bold">
                          {campaign.estimated_budget ? `${campaign.estimated_budget}€` : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">CA généré</p>
                          <p className="text-lg font-bold text-green-600">0€</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Gérer les affiliés
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Matériel marketing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {campaigns
                .filter((c) => c.status === "active")
                .map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle>{campaign.campaign_name}</CardTitle>
                      <CardDescription>
                        {campaign.affiliates} affiliés • {campaign.conversions} conversions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">{campaign.revenue}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="grid gap-4">
              {campaigns
                .filter((c) => c.status === "scheduled")
                .map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle>{campaign.campaign_name}</CardTitle>
                      <CardDescription>
                        Démarre le {new Date(campaign.start_date).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{campaign.affiliates} affiliés inscrits</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            <div className="grid gap-4">
              {campaigns
                .filter((c) => c.status === "paused")
                .map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle>{campaign.campaign_name}</CardTitle>
                      <CardDescription>En pause depuis le 28 Fév 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm">
                        Réactiver
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
