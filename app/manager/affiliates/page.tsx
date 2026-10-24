"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Search, Mail, Building2, Plus } from "lucide-react"
import Link from "next/link"
import { getAffiliates } from "@/lib/supabase/queries/affiliates"
import { getPlans } from "@/lib/supabase/queries/plans"
import { getAllAccountManagers } from "@/lib/supabase/queries/account-managers"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { calculateClientExpense, calculateOurCommission } from "@/lib/supabase/queries/stats"

export default function ManagerAffiliatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAM, setSelectedAM] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const [affiliates, setAffiliates] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [accountManagers, setAccountManagers] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [affiliatesData, plansData, amsData] = await Promise.all([
          getAffiliates(),
          getPlans(),
          getAllAccountManagers(),
        ])

        setAffiliates(affiliatesData)
        setPlans(plansData)
        setAccountManagers(amsData)
      } catch (error) {
        console.error("[v0] Failed to load affiliates data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données des affiliés.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const affiliatesWithStats = useMemo(() => {
    return affiliates.map((affiliate) => {
      const affiliatePlans = plans.filter((p) => p.affiliate_id === affiliate.id)
      const approvedPlans = affiliatePlans.filter((p) => p.status === "approved")

      const uniqueClients = new Set(affiliatePlans.map((p) => p.client_id))

      const totalDepenseClient = affiliatePlans.reduce((sum, p) => sum + calculateClientExpense(p), 0)
      const validatedDepenseClient = approvedPlans.reduce((sum, p) => sum + calculateClientExpense(p), 0)

      const totalGainsAffilié = affiliatePlans.reduce((sum, p) => sum + p.fixed_fee, 0)
      const validatedGainsAffilié = approvedPlans.reduce((sum, p) => sum + p.fixed_fee, 0)

      const totalNotreMarge = affiliatePlans.reduce((sum, p) => sum + calculateOurCommission(p), 0)
      const validatedNotreMarge = approvedPlans.reduce((sum, p) => sum + calculateOurCommission(p), 0)

      const avgCommissionRate =
        approvedPlans.length > 0
          ? approvedPlans.reduce((sum, p) => sum + (p.hdr_pct || 0), 0) / approvedPlans.length
          : 0

      const am = accountManagers.find((a) => a.id === affiliate.account_manager_id)

      return {
        id: affiliate.id,
        name: affiliate.name,
        entity: affiliate.company || "Indépendant",
        am: am?.name || "Non assigné",
        amId: affiliate.account_manager_id,
        clients: uniqueClients.size,
        plans: affiliatePlans.length,
        approvedPlans: approvedPlans.length,
        totalDepenseClient,
        validatedDepenseClient,
        totalGainsAffilié,
        validatedGainsAffilié,
        totalNotreMarge,
        validatedNotreMarge,
        avgCommissionRate: avgCommissionRate,
        status: "active",
      }
    })
  }, [affiliates, plans, accountManagers])

  const filteredAffiliates = useMemo(() => {
    return affiliatesWithStats.filter((affiliate) => {
      const matchesSearch =
        searchQuery === "" ||
        affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affiliate.entity.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAM = selectedAM === "all" || affiliate.amId === selectedAM

      return matchesSearch && matchesAM
    })
  }, [searchQuery, selectedAM, affiliatesWithStats])

  const stats = useMemo(() => {
    const totalPlans = filteredAffiliates.reduce((sum, a) => sum + a.plans, 0)
    const validatedPlans = filteredAffiliates.reduce((sum, a) => sum + a.approvedPlans, 0)

    const totalDepense = filteredAffiliates.reduce((sum, a) => sum + a.totalDepenseClient, 0)
    const validatedDepense = filteredAffiliates.reduce((sum, a) => sum + a.validatedDepenseClient, 0)

    const totalGainsAffiliés = filteredAffiliates.reduce((sum, a) => sum + a.totalGainsAffilié, 0)
    const validatedGainsAffiliés = filteredAffiliates.reduce((sum, a) => sum + a.validatedGainsAffilié, 0)

    const totalNotreMarge = filteredAffiliates.reduce((sum, a) => sum + a.totalNotreMarge, 0)
    const validatedNotreMarge = filteredAffiliates.reduce((sum, a) => sum + a.validatedNotreMarge, 0)

    const avgCommissionRate =
      filteredAffiliates.length > 0
        ? filteredAffiliates.reduce((sum, a) => sum + a.avgCommissionRate, 0) / filteredAffiliates.length
        : 0

    return {
      totalAffiliates: filteredAffiliates.length,
      totalPlans,
      validatedPlans,
      totalDepense,
      validatedDepense,
      totalGainsAffiliés,
      validatedGainsAffiliés,
      totalNotreMarge,
      validatedNotreMarge,
      avgCommissionRate,
    }
  }, [filteredAffiliates])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des affiliés...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Affiliés</h1>
            <p className="text-muted-foreground">Vue d'ensemble des affiliés de votre équipe</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un affilié
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Affiliés</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">{selectedAM === "all" ? "Tous AMs" : "AM sélectionné"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans proposés</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
              <p className="text-xs text-emerald-600 font-medium">{stats.validatedPlans} validés</p>
              <p className="text-xs text-muted-foreground">Total de tous les plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépense Client</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalDepense)}</div>
              <p className="text-xs text-emerald-600 font-medium">{formatCurrency(stats.validatedDepense)} validé</p>
              <p className="text-xs text-muted-foreground italic">Gains affiliés + Commission</p>
              <p className="text-xs text-muted-foreground italic">Com. moy: {stats.avgCommissionRate.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains Affiliés</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalGainsAffiliés)}</div>
              <p className="text-xs text-emerald-600 font-medium">
                {formatCurrency(stats.validatedGainsAffiliés)} validé
              </p>
              <p className="text-xs text-muted-foreground italic">Proposition de base totale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notre Marge</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalNotreMarge)}</div>
              <p className="text-xs text-emerald-600 font-medium">{formatCurrency(stats.validatedNotreMarge)} validé</p>
              <p className="text-xs text-muted-foreground italic">Commission validée totale</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des affiliés</CardTitle>
                <CardDescription>Tous les affiliés de votre équipe</CardDescription>
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
                <Select value={selectedAM} onValueChange={setSelectedAM}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les AMs</SelectItem>
                    {accountManagers.map((am) => (
                      <SelectItem key={am.id} value={am.id}>
                        {am.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAffiliates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun affilié trouvé</p>
            ) : (
              <div className="space-y-3">
                {filteredAffiliates.map((affiliate) => (
                  <Link key={affiliate.id} href={`/manager/affiliates/${affiliate.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                          {affiliate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{affiliate.name}</p>
                            <Badge variant="default" className="text-xs">
                              Actif
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {affiliate.entity}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              AM: {affiliate.am}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-base font-bold">{affiliate.clients}</p>
                          <p className="text-xs text-muted-foreground">Clients</p>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold">{affiliate.plans}</p>
                          <p className="text-xs text-muted-foreground">Plans</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <p className="text-base font-bold">{formatCurrency(affiliate.totalDepenseClient)}</p>
                          <p className="text-xs text-emerald-600 font-medium">
                            {formatCurrency(affiliate.validatedDepenseClient)}
                          </p>
                          <p className="text-xs text-muted-foreground">Dépense</p>
                          <p className="text-xs text-muted-foreground italic">{affiliate.approvedPlans} validés</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <p className="text-base font-bold text-purple-600">
                            {formatCurrency(affiliate.totalGainsAffilié)}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium">
                            {formatCurrency(affiliate.validatedGainsAffilié)}
                          </p>
                          <p className="text-xs text-muted-foreground">Gains</p>
                          <p className="text-xs text-muted-foreground italic">Prop. base</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <p className="text-base font-bold text-emerald-600">
                            {formatCurrency(affiliate.totalNotreMarge)}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium">
                            {formatCurrency(affiliate.validatedNotreMarge)}
                          </p>
                          <p className="text-xs text-muted-foreground">Marge</p>
                          <p className="text-xs text-muted-foreground italic">
                            Com: {affiliate.avgCommissionRate.toFixed(0)}%
                          </p>
                        </div>
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
