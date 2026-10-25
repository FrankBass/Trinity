"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Plus, TrendingUp, FileText, Target } from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { getCampaigns, type Campaign } from "@/lib/supabase/queries/campaigns"
import { formatCurrency } from "@/lib/utils"

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true)
      const data = await getCampaigns()
      console.log("[v0] Loaded campaigns from Supabase:", data.length)
      setCampaigns(data)
      setLoading(false)
    }
    loadCampaigns()
  }, [])

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        searchQuery === "" ||
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.clientName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, campaigns])

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active").length
    const planned = campaigns.filter((c) => c.status === "planned").length
    const totalPlans = campaigns.reduce((sum, c) => sum + c.plans, 0)
    const totalPlansApproved = campaigns.reduce((sum, c) => sum + c.plansApproved, 0) // Added approved plans count
    const totalPlansPending = campaigns.reduce((sum, c) => sum + c.plansPending, 0) // Added pending plans count

    const totalBudget = campaigns.reduce((sum, c) => {
      const budgetValue = Number.parseFloat(c.budget.replace(/[K€]/g, "")) * 1000
      return sum + budgetValue
    }, 0)

    const totalBudgetApproved = campaigns.reduce((sum, c) => {
      const budgetValue = Number.parseFloat(c.budgetApproved?.replace(/[K€]/g, "") || "0") * 1000
      return sum + budgetValue
    }, 0)

    const totalGainsAffiliés = campaigns.reduce((sum, c) => {
      const gainsValue = Number.parseFloat(c.gainsAffiliés?.replace(/[K€]/g, "") || "0") * 1000
      return sum + gainsValue
    }, 0)

    const totalGainsAffiliésApproved = campaigns.reduce((sum, c) => {
      const gainsValue = Number.parseFloat(c.gainsAffiliésApproved?.replace(/[K€]/g, "") || "0") * 1000
      return sum + gainsValue
    }, 0)

    const totalNotreMarge = campaigns.reduce((sum, c) => {
      const margeValue = Number.parseFloat(c.notreMarge?.replace(/[K€]/g, "") || "0") * 1000
      return sum + margeValue
    }, 0)

    const totalNotreMargeApproved = campaigns.reduce((sum, c) => {
      const margeValue = Number.parseFloat(c.notreMargeApproved?.replace(/[K€]/g, "") || "0") * 1000
      return sum + margeValue
    }, 0)

    const avgCommissionRate = totalBudget > 0 ? (totalNotreMarge / (totalBudget - totalNotreMarge)) * 100 : 0

    return {
      active,
      planned,
      totalPlans,
      totalPlansApproved,
      totalPlansPending,
      totalBudget: formatCurrency(totalBudget),
      totalBudgetApproved: formatCurrency(totalBudgetApproved),
      totalGainsAffiliés: formatCurrency(totalGainsAffiliés),
      totalGainsAffiliésApproved: formatCurrency(totalGainsAffiliésApproved),
      totalNotreMarge: formatCurrency(totalNotreMarge),
      totalNotreMargeApproved: formatCurrency(totalNotreMargeApproved),
      avgCommissionRate: avgCommissionRate,
    }
  }, [campaigns])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
      case "planned":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Planifiée</Badge>
      case "completed":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Terminée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement des campagnes...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campagnes & OPs</h1>
            <p className="text-muted-foreground">Gestion des opérations commerciales</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href="/manager/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle OP
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OPs actives</CardTitle>
              <Target className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OPs planifiées</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.planned}</div>
              <p className="text-xs text-muted-foreground">À venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans totaux</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPlansApproved} validés • {stats.totalPlansPending} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBudget}</div>
              <p className="text-xs text-emerald-600 font-semibold">{stats.totalBudgetApproved} validé</p>
              <p className="text-xs text-muted-foreground italic">
                Dépense client • Com. moy: {stats.avgCommissionRate.toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains Affiliés</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalGainsAffiliés}</div>
              <p className="text-xs text-emerald-600 font-semibold">{stats.totalGainsAffiliésApproved} validé</p>
              <p className="text-xs text-muted-foreground italic">Proposition de base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notre Marge</CardTitle>
              <Target className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.totalNotreMarge}</div>
              <p className="text-xs text-emerald-600 font-semibold">{stats.totalNotreMargeApproved} validé</p>
              <p className="text-xs text-muted-foreground italic">Commission</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des campagnes</CardTitle>
                <CardDescription>Toutes les opérations commerciales</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planned">Planifiée</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCampaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune campagne trouvée</p>
            ) : (
              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => (
                  <Link key={campaign.id} href={`/manager/campaigns/${campaign.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{campaign.name}</p>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Client: {campaign.clientName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {campaign.startDate} → {campaign.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-base font-bold">{campaign.plans}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{campaign.plansApproved} validés</p>
                          <p className="text-xs text-muted-foreground">Plans</p>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold">{campaign.affiliates}</p>
                          <p className="text-xs text-muted-foreground">Affiliés</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="text-base font-bold">{campaign.budget}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{campaign.budgetApproved} validé</p>
                          <p className="text-xs text-muted-foreground italic">Budget Dépense</p>
                        </div>
                        {campaign.gainsAffiliés && (
                          <div className="text-center min-w-[80px]">
                            <p className="text-base font-bold text-purple-600">{campaign.gainsAffiliés}</p>
                            <p className="text-xs text-emerald-600 font-semibold">
                              {campaign.gainsAffiliésApproved} validé
                            </p>
                            <p className="text-xs text-muted-foreground italic">Gains Prop. base</p>
                          </div>
                        )}
                        {campaign.notreMarge && (
                          <div className="text-center min-w-[80px]">
                            <p className="text-base font-bold text-emerald-600">{campaign.notreMarge}</p>
                            <p className="text-xs text-emerald-600 font-semibold">
                              {campaign.notreMargeApproved} validé
                            </p>
                            <p className="text-xs text-muted-foreground italic">Marge Commission</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
