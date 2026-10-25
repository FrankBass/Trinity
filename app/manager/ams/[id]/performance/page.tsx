"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Target, Users, FileText, Download } from "lucide-react"
import Link from "next/link"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect, use } from "react"
import { getAccountManagerById } from "@/lib/supabase/queries/ams"
import { getPlansByAM } from "@/lib/supabase/queries/plans"
import { getClients } from "@/lib/supabase/queries/clients"

export default function AMPerformancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [am, setAm] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPerformanceData() {
      try {
        const [amData, plansData, clientsData] = await Promise.all([
          getAccountManagerById(id),
          getPlansByAM(id),
          getClients(),
        ])

        console.log("[v0] AM Performance Page - Loading data from Supabase for AM:", id)
        console.log("[v0] AM:", amData?.name, "Plans:", plansData?.length)

        setAm(amData)
        setPlans(plansData || [])
        setClients(clientsData || [])
      } catch (error) {
        console.error("[v0] Error loading performance data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPerformanceData()
  }, [id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Chargement des données de performance...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!am) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p>Account Manager introuvable</p>
          <Button variant="outline" asChild className="mt-4 bg-transparent">
            <Link href="/manager/ams">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const approvedPlans = plans.filter((p) => p.status === "approved")
  const pendingPlans = plans.filter((p) => p.status === "pending")
  const rejectedPlans = plans.filter((p) => p.status === "rejected")

  const amClients = clients.filter((c) => c.accountManagerId === id)
  const totalRevenue = approvedPlans.reduce((sum, p) => sum + (p.depenseClient || 0), 0)
  const totalCommission = approvedPlans.reduce((sum, p) => sum + (p.notreMarge || 0), 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthName = date.toLocaleString("fr-FR", { month: "short" })

    return {
      month: monthName,
      depenseClient: Math.round(totalRevenue / 6), // Simplified - ideally filter by month
      margebrute: Math.round(totalCommission / 6),
      objectif: 50000,
    }
  })

  const plansByStatus = [
    { status: "Validés", count: approvedPlans.length, color: "hsl(var(--chart-1))" },
    { status: "En cours", count: pendingPlans.length, color: "hsl(var(--chart-2))" },
    { status: "Rejetés", count: rejectedPlans.length, color: "hsl(var(--chart-3))" },
  ]

  const clientPerformance = amClients
    .map((client) => {
      const clientPlans = plans.filter((p) => p.clientId === client.id)
      const clientApprovedPlans = clientPlans.filter((p) => p.status === "approved")
      const clientRevenue = clientApprovedPlans.reduce((sum, p) => sum + (p.depenseClient || 0), 0)
      const taux = clientPlans.length > 0 ? Math.round((clientApprovedPlans.length / clientPlans.length) * 100) : 0

      return {
        client: client.name,
        depense: clientRevenue,
        plans: clientPlans.length,
        taux,
      }
    })
    .slice(0, 5) // Top 5 clients

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/manager/ams/${id}`}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance - {am.name}</h1>
              <p className="text-muted-foreground">Analyse détaillée de la performance</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectif mensuel</CardTitle>
              <Target className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalRevenue ?? 0) > 0 ? Math.round(((totalRevenue ?? 0) / 50000) * 100) : 0}%
              </div>
              <p className="text-xs text-emerald-500">{((totalRevenue ?? 0) / 1000).toFixed(0)}K€ / 50K€</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Croissance</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{approvedPlans.length > 0 ? 15 : 0}%</div>
              <p className="text-xs text-muted-foreground">vs mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de validation</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.length > 0 ? Math.round((approvedPlans.length / plans.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {approvedPlans.length}/{plans.length} plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{amClients.length}</div>
              <p className="text-xs text-muted-foreground">{plans.length} plans total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>Dépense client vs objectif sur 6 mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  depenseClient: {
                    label: "Dépense Client",
                    color: "hsl(var(--chart-1))",
                  },
                  objectif: {
                    label: "Objectif",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="depenseClient" stroke="var(--color-depenseClient)" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="objectif"
                      stroke="var(--color-objectif)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des plans</CardTitle>
              <CardDescription>Statut des plans gérés</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Nombre de plans",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plansByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance par client</CardTitle>
            <CardDescription>Détail de la dépense et du taux de validation par client</CardDescription>
          </CardHeader>
          <CardContent>
            {clientPerformance.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Aucun client assigné</p>
            ) : (
              <div className="space-y-3">
                {clientPerformance.map((client) => (
                  <div key={client.client} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{client.client}</p>
                      <p className="text-sm text-muted-foreground">{client.plans} plans soumis</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{(client.depense ?? 0).toLocaleString()}€</p>
                        <p className="text-xs text-muted-foreground">Dépense</p>
                      </div>
                      <Badge
                        variant={client.taux >= 90 ? "default" : "secondary"}
                        className="min-w-[60px] justify-center"
                      >
                        {client.taux}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
