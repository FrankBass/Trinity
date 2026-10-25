"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Target, Download } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getPlans } from "@/lib/supabase/queries/plans"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"

export default function ManagerPerformancePage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [selectedAM, setSelectedAM] = React.useState<string>("all")

  const [plans, setPlans] = useState<any[]>([])
  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, amsData] = await Promise.all([getPlans(), getAllAccountManagers()])
        setPlans(plansData)
        setAccountManagers(amsData)
        console.log("[v0] Performance data from Supabase:", {
          plans: plansData?.length,
          ams: amsData?.length,
        })
      } catch (error) {
        console.error("[v0] Error loading performance data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const { stats, monthlyData, amPerformance, plansByStatus } = React.useMemo(() => {
    const baseMonthlyData = [
      { month: "Jan", depenseClient: 180000, margeBrute: 36000, objectif: 200000 },
      { month: "Fév", depenseClient: 220000, margeBrute: 44000, objectif: 200000 },
      { month: "Mar", depenseClient: 250000, margeBrute: 50000, objectif: 200000 },
      { month: "Avr", depenseClient: 285000, margeBrute: 57000, objectif: 250000 },
    ]

    const baseAMPerformance = (accountManagers || []).map((am) => {
      const amPlans = (plans || []).filter((p) => p.account_manager_id === am.id)
      const depenseClient = amPlans.reduce((sum, p) => sum + (p.depense_client || 0), 0)
      const margeBrute = amPlans.reduce((sum, p) => sum + (p.notre_marge || 0), 0)

      return {
        id: am.id,
        name: am.name,
        depenseClient,
        margeBrute,
        plans: amPlans.length,
      }
    })

    const approvedCount = (plans || []).filter((p) => p.status === "approved").length
    const pendingCount = (plans || []).filter((p) => p.status === "pending").length
    const rejectedCount = (plans || []).filter((p) => p.status === "rejected").length

    const basePlansByStatus = [
      { name: "Validés", value: approvedCount, color: "#10b981" },
      { name: "En attente", value: pendingCount, color: "#f59e0b" },
      { name: "Rejetés", value: rejectedCount, color: "#ef4444" },
    ]

    let filteredAMPerformance = baseAMPerformance
    if (selectedAM !== "all") {
      filteredAMPerformance = baseAMPerformance.filter((am) => am.id === selectedAM)
    }

    const totalDepense = filteredAMPerformance.reduce((sum, am) => sum + am.depenseClient, 0)
    const totalMarge = filteredAMPerformance.reduce((sum, am) => sum + am.margeBrute, 0)
    const totalPlans = filteredAMPerformance.reduce((sum, am) => sum + am.plans, 0)
    const objectif = 250000
    const objectifPercent = Math.round((totalDepense / objectif) * 100)

    const stats = [
      {
        label: "Dépense Client",
        value: `${Math.round(totalDepense / 1000)}K€`,
        trend: "+12% vs mois dernier",
        icon: TrendingUp,
        color: "text-blue-500",
      },
      {
        label: "Marge Brute",
        value: `${Math.round(totalMarge / 1000)}K€`,
        trend: "Notre commission (20%)",
        icon: TrendingUp,
        color: "text-emerald-500",
      },
      {
        label: "Objectif",
        value: `${objectifPercent}%`,
        trend: `${Math.round(totalDepense / 1000)}K€ / ${objectif / 1000}K€`,
        icon: Target,
        color: "text-indigo-500",
      },
      {
        label: "Plans traités",
        value: totalPlans.toString(),
        trend: "Ce mois",
        icon: Users,
        color: "text-purple-500",
      },
    ]

    return {
      stats,
      monthlyData: baseMonthlyData,
      amPerformance: filteredAMPerformance,
      plansByStatus: basePlansByStatus,
    }
  }, [selectedAM, dateRange, plans, accountManagers])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
            <p className="text-muted-foreground">Analyse de performance de votre équipe</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Select value={selectedAM} onValueChange={setSelectedAM}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les AMs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les AMs</SelectItem>
                {(accountManagers || []).map((am) => (
                  <SelectItem key={am.id} value={am.id}>
                    {am.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>Dépense client et marge brute par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="depenseClient" stroke="#3b82f6" name="Dépense Client" />
                  <Line type="monotone" dataKey="margeBrute" stroke="#10b981" name="Marge Brute" />
                  <Line type="monotone" dataKey="objectif" stroke="#6366f1" strokeDasharray="5 5" name="Objectif" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance par AM</CardTitle>
              <CardDescription>Comparaison des Account Managers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={amPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="depenseClient" fill="#3b82f6" name="Dépense Client" />
                  <Bar dataKey="margeBrute" fill="#10b981" name="Marge Brute" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des plans</CardTitle>
              <CardDescription>Statut des plans traités</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={plansByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {plansByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métriques détaillées</CardTitle>
              <CardDescription>Indicateurs clés de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {amPerformance.map((am) => (
                  <div key={am.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{am.name}</p>
                      <p className="text-sm text-muted-foreground">{am.plans} plans traités</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{(am.depenseClient / 1000).toFixed(0)}K€</p>
                      <p className="text-sm text-emerald-600">{(am.margeBrute / 1000).toFixed(1)}K€ marge</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
