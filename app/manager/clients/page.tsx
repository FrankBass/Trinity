"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, Search, Building2, Mail, Plus } from "lucide-react"
import Link from "next/link"
import { getClients } from "@/lib/supabase/queries/clients"
import { getPlans } from "@/lib/supabase/queries/plans"
import { getAccountManagers } from "@/lib/supabase/queries/account-managers"
import { formatCurrency } from "@/lib/utils"
import { calculateClientExpense, calculateOurCommission } from "@/lib/supabase/queries/stats"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Grid3x3, List, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManagerClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAM, setSelectedAM] = useState("all")
  const [loading, setLoading] = useState(true)
  const [clientsWithStats, setClientsWithStats] = useState<any[]>([])
  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = useState<"name" | "plans" | "marge">("name")

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, plansData, amsData] = await Promise.all([getClients(), getPlans(), getAccountManagers()])

        const clientsStats = clientsData.map((client: any) => {
          const allClientPlans = plansData.filter((p: any) => p.client_id === client.id)
          const clientPlans = allClientPlans.filter((p: any) => p.status === "approved")
          const affiliatesCount = new Set(allClientPlans.map((p: any) => p.affiliate_id)).size

          const totalDepense = allClientPlans.reduce((sum: number, plan: any) => sum + calculateClientExpense(plan), 0)
          const validatedDepense = clientPlans.reduce((sum: number, plan: any) => sum + calculateClientExpense(plan), 0)

          const totalMarge = allClientPlans.reduce((sum: number, plan: any) => sum + calculateOurCommission(plan), 0)
          const validatedMarge = clientPlans.reduce((sum: number, plan: any) => sum + calculateOurCommission(plan), 0)

          const avgCommissionRate =
            clientPlans.length > 0
              ? clientPlans.reduce((sum: number, p: any) => sum + (p.hdr_pct || 0), 0) / clientPlans.length
              : 0

          return {
            id: client.id,
            name: client.name,
            am: client.account_manager?.name || "N/A",
            amId: client.account_manager_id,
            affiliates: affiliatesCount,
            totalPlans: allClientPlans.length,
            plans: clientPlans.length,
            totalDepense,
            validatedDepense,
            totalMarge,
            validatedMarge,
            avgCommissionRate: avgCommissionRate,
            status: client.status,
          }
        })

        setClientsWithStats(clientsStats)
        setAccountManagers(amsData)
      } catch (error) {
        console.error("[v0] Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredClients = useMemo(() => {
    return clientsWithStats.filter((client) => {
      const matchesSearch =
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.am.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAM = selectedAM === "all" || client.amId === selectedAM

      return matchesSearch && matchesAM
    })
  }, [clientsWithStats, searchQuery, selectedAM])

  const stats = useMemo(() => {
    const totalPlans = filteredClients.reduce((sum, c) => sum + c.totalPlans, 0)
    const validatedPlans = filteredClients.reduce((sum, c) => sum + c.plans, 0)

    const totalDepense = filteredClients.reduce((sum, c) => sum + c.totalDepense, 0)
    const validatedDepense = filteredClients.reduce((sum, c) => sum + c.validatedDepense, 0)

    const totalMarge = filteredClients.reduce((sum, c) => sum + c.totalMarge, 0)
    const validatedMarge = filteredClients.reduce((sum, c) => sum + c.validatedMarge, 0)

    const avgCommissionRate =
      filteredClients.length > 0
        ? filteredClients.reduce((sum, c) => sum + c.avgCommissionRate, 0) / filteredClients.length
        : 0

    return {
      totalClients: filteredClients.length,
      totalPlans,
      validatedPlans,
      totalDepense: formatCurrency(totalDepense),
      validatedDepense: formatCurrency(validatedDepense),
      totalMarge: formatCurrency(totalMarge),
      validatedMarge: formatCurrency(validatedMarge),
      avgCommissionRate: avgCommissionRate,
    }
  }, [filteredClients])

  const highValueClients = useMemo(() => {
    return filteredClients.filter((c) => c.validatedMarge > 5000).sort((a, b) => b.validatedMarge - a.validatedMarge)
  }, [filteredClients])

  const inactiveClients = useMemo(() => {
    return filteredClients.filter((c) => c.status === "inactive")
  }, [filteredClients])

  const clientsWithNoPendingPlans = useMemo(() => {
    return filteredClients.filter((c) => c.totalPlans === c.plans)
  }, [filteredClients])

  const topClientsData = useMemo(() => {
    return filteredClients
      .sort((a, b) => b.validatedMarge - a.validatedMarge)
      .slice(0, 10)
      .map((client) => ({
        name: client.name.length > 15 ? client.name.substring(0, 15) + "..." : client.name,
        validatedMarge: client.validatedMarge,
        totalMarge: client.totalMarge,
      }))
  }, [filteredClients])

  const industryDistribution = useMemo(() => {
    const distribution = new Map<string, number>()
    filteredClients.forEach((client) => {
      const industry = "Industrie" // À remplacer par client.industry quand disponible
      distribution.set(industry, (distribution.get(industry) || 0) + client.validatedMarge)
    })
    return Array.from(distribution.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredClients])

  const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

  const handleExportCSV = () => {
    const headers = [
      "Client",
      "AM",
      "Affiliés",
      "Plans Total",
      "Plans Validés",
      "Dépense Total",
      "Dépense Validé",
      "Marge Total",
      "Marge Validé",
      "Com. Moy %",
    ]
    const rows = filteredClients.map((c) => [
      c.name,
      c.am,
      c.affiliates,
      c.totalPlans,
      c.plans,
      c.totalDepense,
      c.validatedDepense,
      c.totalMarge,
      c.validatedMarge,
      c.avgCommissionRate.toFixed(2),
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clients-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients]
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "plans":
        return sorted.sort((a, b) => b.totalPlans - a.totalPlans)
      case "marge":
        return sorted.sort((a, b) => b.validatedMarge - a.validatedMarge)
      default:
        return sorted
    }
  }, [filteredClients, sortBy])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Chargement des clients...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Vue d'ensemble des clients de votre équipe</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href="/manager/clients/new">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un client
            </Link>
          </Button>
        </div>

        {(highValueClients.length > 0 || inactiveClients.length > 0) && (
          <div className="space-y-3">
            {highValueClients.length > 0 && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-900">Clients à forte valeur</AlertTitle>
                <AlertDescription className="text-emerald-800">
                  {highValueClients.length} client{highValueClients.length > 1 ? "s" : ""} génèrent plus de 5 000€ de
                  marge validée. Top : <strong>{highValueClients[0].name}</strong> (
                  {formatCurrency(highValueClients[0].validatedMarge)})
                </AlertDescription>
              </Alert>
            )}

            {inactiveClients.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Clients inactifs</AlertTitle>
                <AlertDescription className="text-amber-800">
                  {inactiveClients.length} client{inactiveClients.length > 1 ? "s sont" : " est"} marqué
                  {inactiveClients.length > 1 ? "s" : ""} comme inactif{inactiveClients.length > 1 ? "s" : ""}. Vérifier
                  leur statut.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building2 className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">{selectedAM === "all" ? "Tous AMs" : "AM sélectionné"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans totaux</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
              <p className="text-xs text-emerald-600 font-medium">{stats.validatedPlans} validés</p>
              <p className="text-xs text-muted-foreground">Total négocié</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépense Client</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepense}</div>
              <p className="text-xs text-emerald-600 font-medium">{stats.validatedDepense} validé</p>
              <p className="text-xs text-muted-foreground italic">Gains affiliés + Commission</p>
              <p className="text-xs text-muted-foreground italic">Com. moy: {stats.avgCommissionRate.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Brute</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMarge}</div>
              <p className="text-xs text-emerald-600 font-medium">{stats.validatedMarge} validé</p>
              <p className="text-xs text-muted-foreground italic">Commission validée</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="liste" className="space-y-4">
          <TabsList>
            <TabsTrigger value="liste">Liste</TabsTrigger>
            <TabsTrigger value="graphiques">Graphiques</TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liste des clients</CardTitle>
                    <CardDescription>Tous les clients de votre équipe</CardDescription>
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
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Trier par" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="plans">Nb. Plans</SelectItem>
                        <SelectItem value="marge">Marge</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                    >
                      {viewMode === "list" ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleExportCSV}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedClients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun client trouvé</p>
                ) : viewMode === "list" ? (
                  <div className="space-y-3">
                    {sortedClients.map((client) => (
                      <Link key={client.id} href={`/manager/clients/${client.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{client.name}</p>
                                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                                  {client.status === "active" ? "Actif" : "Inactif"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  AM: {client.am}
                                </span>
                                <span>•</span>
                                <span>
                                  {client.affiliates} affilié{client.affiliates > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xl font-bold">{client.totalPlans}</p>
                              <p className="text-xs text-emerald-600 font-medium">{client.plans} validés</p>
                              <p className="text-xs text-muted-foreground">Plans</p>
                            </div>
                            <div className="text-center min-w-[80px]">
                              <p className="text-xl font-bold">{formatCurrency(client.totalDepense)}</p>
                              <p className="text-xs text-emerald-600 font-medium">
                                {formatCurrency(client.validatedDepense)}
                              </p>
                              <p className="text-xs text-muted-foreground">Dépense</p>
                              <p className="text-xs text-muted-foreground italic">Total / Validé</p>
                            </div>
                            <div className="text-center min-w-[80px]">
                              <p className="text-xl font-bold text-emerald-600">{formatCurrency(client.totalMarge)}</p>
                              <p className="text-xs text-emerald-600 font-medium">
                                {formatCurrency(client.validatedMarge)}
                              </p>
                              <p className="text-xs text-muted-foreground">Notre Marge</p>
                              <p className="text-xs text-muted-foreground italic">
                                Com: {client.avgCommissionRate.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedClients.map((client) => (
                      <Link key={client.id} href={`/manager/clients/${client.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                {client.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{client.name}</CardTitle>
                                <CardDescription>AM: {client.am}</CardDescription>
                              </div>
                              <Badge variant={client.status === "active" ? "default" : "secondary"}>
                                {client.status === "active" ? "Actif" : "Inactif"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plans:</span>
                              <span className="font-semibold">
                                {client.plans}/{client.totalPlans} validés
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Affiliés:</span>
                              <span className="font-semibold">{client.affiliates}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Dépense:</span>
                              <span className="font-semibold">{formatCurrency(client.validatedDepense)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2">
                              <span className="text-muted-foreground">Marge:</span>
                              <span className="font-semibold text-emerald-600">
                                {formatCurrency(client.validatedMarge)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graphiques" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Clients par Marge</CardTitle>
                  <CardDescription>Marge validée vs marge totale</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      validatedMarge: { label: "Marge Validée", color: "#10b981" },
                      totalMarge: { label: "Marge Totale", color: "#3b82f6" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topClientsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="validatedMarge" fill="#10b981" name="Marge Validée" />
                        <Bar dataKey="totalMarge" fill="#3b82f6" name="Marge Totale" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Industrie</CardTitle>
                  <CardDescription>Marge validée par secteur</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={industryDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {industryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
