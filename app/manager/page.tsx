"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Download,
  Settings,
  Target,
  FileSpreadsheet,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import React from "react"
import * as XLSX from "xlsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { getDashboardStats, calculateClientExpense, calculateOurCommission } from "@/lib/supabase/queries/stats"
import { formatCurrency, formatPercentage } from "@/lib/utils"

export default function ManagerDashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  const [accountManagers, setAccountManagers] = React.useState<any[]>([])
  const [clients, setClients] = React.useState<any[]>([])
  const [plans, setPlans] = React.useState<any[]>([])
  const [affiliates, setAffiliates] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      console.log("[v0] Loading dashboard data from Supabase")
      setLoading(true)

      const data = await getDashboardStats()

      console.log("[v0] Dashboard data loaded:", {
        accountManagers: data.accountManagers.length,
        clients: data.clients.length,
        plans: data.plans.length,
        affiliates: data.affiliates.length,
      })

      setAccountManagers(data.accountManagers)
      setClients(data.clients)
      setPlans(data.plans)
      setAffiliates(data.affiliates)
      setLoading(false)
    }

    loadData()
  }, [])

  const activeAccountManagers = React.useMemo(() => {
    return accountManagers.filter((am) => am.status !== "inactive" && am.status !== "transferred")
  }, [accountManagers])

  const stats = React.useMemo(() => {
    const allPlans = plans
    const approvedPlans = plans.filter((p) => p.status === "approved")

    const totalRevenue = allPlans.reduce((sum, plan) => sum + calculateClientExpense(plan), 0)
    const validatedRevenue = approvedPlans.reduce((sum, plan) => sum + calculateClientExpense(plan), 0)

    const totalCommission = allPlans.reduce((sum, plan) => sum + calculateOurCommission(plan), 0)
    const validatedCommission = approvedPlans.reduce((sum, plan) => sum + calculateOurCommission(plan), 0)

    const avgCommissionRate =
      approvedPlans.length > 0 ? approvedPlans.reduce((sum, p) => sum + (p.hdr_pct || 0), 0) / approvedPlans.length : 0

    return [
      {
        label: "Account Managers",
        value: activeAccountManagers.length.toString(),
        icon: Users,
        trend: "Actifs dans votre équipe",
        color: "text-blue-500",
      },
      {
        label: "Plans totaux",
        value: plans.length.toString(),
        icon: Users,
        trend: `${approvedPlans.length} approuvés`,
        color: "text-purple-500",
      },
      {
        label: "Dépense Client",
        value: formatCurrency(totalRevenue),
        validated: formatCurrency(validatedRevenue),
        icon: TrendingUp,
        trend: `Com. moy: ${avgCommissionRate.toFixed(0)}%`,
        color: "text-blue-500",
      },
      {
        label: "Marge Brute",
        value: formatCurrency(totalCommission),
        validated: formatCurrency(validatedCommission),
        icon: TrendingUp,
        trend: "Commission validée",
        color: "text-emerald-500",
      },
    ]
  }, [plans, activeAccountManagers])

  const accountManagersData = React.useMemo(() => {
    return activeAccountManagers.map((am) => {
      const amPlans = plans.filter((p) => p.account_manager_id === am.id)
      const approvedPlans = amPlans.filter((p) => p.status === "approved")
      const totalRevenue = approvedPlans.reduce((sum, plan) => sum + calculateClientExpense(plan), 0)
      const totalCommission = approvedPlans.reduce((sum, plan) => sum + calculateOurCommission(plan), 0)

      const amClients = clients.filter((c) => c.account_manager_id === am.id)

      const monthlyObjective = am.monthly_objective || 50000
      const performance = monthlyObjective > 0 ? (totalCommission / monthlyObjective) * 100 : 0

      return {
        id: am.id,
        name: am.name,
        clients: amClients.length,
        depenseClient: formatCurrency(totalRevenue),
        marge: formatCurrency(totalCommission),
        performance: formatPercentage(performance),
        status: am.level === "senior" ? "excellent" : "good",
        objectiveProgress: Math.round(performance),
      }
    })
  }, [activeAccountManagers, clients, plans])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Bon</Badge>
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Attention</Badge>
    }
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    const wsData: any[][] = [
      ["TABLEAU DE BORD MANAGER - EXPORT"],
      [],
      ["Date d'export:", new Date().toLocaleDateString("fr-FR")],
      [
        "Période:",
        dateRange?.from && dateRange?.to
          ? `${dateRange.from.toLocaleDateString("fr-FR")} - ${dateRange.to.toLocaleDateString("fr-FR")}`
          : "Toutes les données",
      ],
      [],
      [],
      ["STATISTIQUES GLOBALES"],
      ["Métrique", "Valeur", "Validé", "Tendance"],
    ]

    stats.forEach((stat) => {
      wsData.push([stat.label, stat.value, stat.validated || "", stat.trend])
    })

    wsData.push([])
    wsData.push([])
    wsData.push(["PERFORMANCE DES ACCOUNT MANAGERS"])
    wsData.push([
      "Account Manager",
      "Nombre de clients",
      "Dépense Client",
      "Marge Brute",
      "Performance",
      "Progression Objectifs (%)",
      "Statut",
    ])

    accountManagersData.forEach((am) => {
      wsData.push([am.name, am.clients, am.depenseClient, am.marge, am.performance, am.objectiveProgress, am.status])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }]

    XLSX.utils.book_append_sheet(wb, ws, "Dashboard")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dashboard_manager_${new Date().toISOString().split("T")[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    let csvContent = "TABLEAU DE BORD MANAGER - EXPORT\n\n"
    csvContent += `Date d'export:,${new Date().toLocaleDateString("fr-FR")}\n`
    csvContent += `Période:,${dateRange?.from && dateRange?.to ? `${dateRange.from.toLocaleDateString("fr-FR")} - ${dateRange.to.toLocaleDateString("fr-FR")}` : "Toutes les données"}\n\n`

    csvContent += "STATISTIQUES GLOBALES\n"
    csvContent += "Métrique,Valeur,Validé,Tendance\n"
    stats.forEach((stat) => {
      csvContent += `${stat.label},${stat.value},${stat.validated || ""},${stat.trend}\n`
    })

    csvContent += "\nPERFORMANCE DES ACCOUNT MANAGERS\n"
    csvContent +=
      "Account Manager,Nombre de clients,Dépense Client,Marge Brute,Performance,Progression Objectifs (%),Statut\n"
    accountManagersData.forEach((am) => {
      csvContent += `${am.name},${am.clients},${am.depenseClient},${am.marge},${am.performance},${am.objectiveProgress},${am.status}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `dashboard_manager_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Tableau de bord Manager</h1>
            <p className="text-muted-foreground">Supervisez votre équipe d'Account Managers</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Exporter en Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Exporter en CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.validated && <p className="text-xs text-emerald-600 font-medium">{stat.validated} validé</p>}
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance des AMs</CardTitle>
              <CardDescription>Vue d'ensemble de votre équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountManagersData.map((am) => (
                  <div
                    key={am.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{am.name}</p>
                        {getStatusBadge(am.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{am.clients} clients</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{am.depenseClient}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600">{am.marge}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Objectifs:</span>
                        <span
                          className={`font-semibold ${am.objectiveProgress >= 100 ? "text-emerald-600" : am.objectiveProgress >= 75 ? "text-blue-600" : "text-orange-600"}`}
                        >
                          {am.objectiveProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${am.performance.startsWith("+") ? "text-emerald-500" : "text-orange-500"}`}
                      >
                        {am.performance}
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/manager/ams/${am.id}`}>
                          Détails <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/manager/ams">Voir tous les AMs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertes et actions</CardTitle>
              <CardDescription>Points nécessitant votre attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {plans.filter((p) => p.status === "pending").length} plans en attente de validation
                  </p>
                  <p className="text-xs text-muted-foreground">Certains plans dépassent le délai standard</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent" asChild>
                    <Link href="/manager/plans">Voir les plans</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Performance globale positive</p>
                  <p className="text-xs text-muted-foreground">
                    {plans.filter((p) => p.status === "approved").length} plans approuvés ce mois
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent" asChild>
                    <Link href="/manager/settings/objectives">
                      <Settings className="w-3 h-3 mr-1" />
                      Configurer les objectifs
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
