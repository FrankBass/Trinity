"use client"

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  TrendingUp,
  Search,
  ArrowUpRight,
  Mail,
  Phone,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Save,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import * as XLSX from "xlsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  getAllAccountManagers,
  createAccountManager,
  type AccountManager,
} from "@/lib/supabase/queries/account-managers"
import { getClients } from "@/lib/supabase/queries/clients"
import { getPlans } from "@/lib/supabase/queries/plans"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { calculateClientExpense, calculateOurCommission } from "@/lib/supabase/queries/stats"
import { LayoutGrid, LayoutList } from "lucide-react"

export default function ManagerAMsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const [period, setPeriod] = useState("30d")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = useState<"name" | "clients" | "marge" | "performance">("name")
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const { toast } = useToast()

  const [customAMs, setCustomAMs] = useState<AccountManager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    async function loadAMs() {
      try {
        console.log("[v0] Loading account managers from Supabase...")
        const [ams, clientsData, plansData] = await Promise.all([getAllAccountManagers(), getClients(), getPlans()])
        console.log("[v0] Loaded AMs:", ams)
        setCustomAMs(ams)
        setClients(clientsData)
        setPlans(plansData)
      } catch (error) {
        console.error("[v0] Failed to load account managers:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les Account Managers.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAMs()
  }, [toast])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    level: "junior",
    monthlyObjective: "",
    password: "",
    confirmPassword: "",
  })

  const getAMBadge = (am: any, stats: any): "nouveau" | "attention" | "bon" | "excellent" => {
    const joinDateStr = am.joinDate || am.join_date
    const [day, month, year] = joinDateStr.split("/")
    const joinDate = new Date(Number(year), Number(month) - 1, Number(day))
    const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceJoin < 30 && stats.approvedPlansCount === 0) {
      return "nouveau"
    }

    const monthlyObjective = am.monthlyObjective || am.monthly_objective
    if (monthlyObjective && monthlyObjective > 0) {
      const performance = (stats.totalCommission / monthlyObjective) * 100
      const conversionRate = stats.plansCount > 0 ? (stats.approvedPlansCount / stats.plansCount) * 100 : 0

      if (performance < 80 || conversionRate < 50) {
        return "attention"
      } else if (performance > 120 && conversionRate > 70) {
        return "excellent"
      } else {
        return "bon"
      }
    }

    const conversionRate = stats.plansCount > 0 ? (stats.approvedPlansCount / stats.plansCount) * 100 : 0

    if (stats.approvedPlansCount === 0) {
      return "nouveau"
    } else if (conversionRate < 50) {
      return "attention"
    } else if (conversionRate > 70 && stats.approvedPlansCount > 5) {
      return "excellent"
    } else {
      return "bon"
    }
  }

  const allAccountManagers = useMemo(() => {
    return customAMs
  }, [customAMs])

  const amsWithStats = useMemo(() => {
    return allAccountManagers.map((am) => {
      const amClients = clients.filter((c) => c.account_manager_id === am.id)
      const amPlans = plans.filter((p) => p.account_manager_id === am.id)
      const approvedPlans = amPlans.filter((p) => p.status === "approved")
      const pendingPlans = amPlans.filter((p) => p.status === "pending")
      const rejectedPlans = amPlans.filter((p) => p.status === "rejected")

      const totalDepense = amPlans.reduce((sum, p) => sum + calculateClientExpense(p), 0)
      const validatedDepense = approvedPlans.reduce((sum, p) => sum + calculateClientExpense(p), 0)

      const totalMarge = amPlans.reduce((sum, p) => sum + calculateOurCommission(p), 0)
      const validatedMarge = approvedPlans.reduce((sum, p) => sum + calculateOurCommission(p), 0)
      const pendingMarge = pendingPlans.reduce((sum, p) => sum + calculateOurCommission(p), 0)

      const uniqueAffiliates = new Set(amPlans.map((p) => p.affiliate_id))

      const monthlyObjective = am.monthly_objective || 50000
      const performance = monthlyObjective > 0 ? (validatedMarge / monthlyObjective) * 100 : 0

      const avgCommissionRate =
        approvedPlans.length > 0
          ? approvedPlans.reduce((sum, p) => sum + (p.hdr_pct || 0), 0) / approvedPlans.length
          : 0

      const stats = {
        clientsCount: amClients.length,
        plansCount: amPlans.length,
        approvedPlansCount: approvedPlans.length,
        totalRevenue: totalDepense,
        totalCommission: validatedMarge,
      }

      const badge = getAMBadge(am, stats)

      return {
        id: am.id,
        name: am.name,
        email: am.email,
        phone: am.phone || "+33 6 00 00 00 00",
        clients: amClients.length,
        affiliates: uniqueAffiliates.size,
        totalDepense,
        validatedDepense,
        totalMarge,
        validatedMarge,
        pendingMarge,
        performance: performance,
        avgCommissionRate: avgCommissionRate,
        status: badge,
        plansEnCours: pendingPlans.length,
        plansValides: approvedPlans.length,
        totalPlans: amPlans.length,
        amStatus: am.status,
      }
    })
  }, [allAccountManagers, clients, plans])

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    const wsData: any[][] = [
      ["LISTE DES ACCOUNT MANAGERS - EXPORT"],
      [],
      ["Date d'export:", new Date().toLocaleDateString("fr-FR")],
      ["Période:", period === "30d" ? "30 derniers jours" : period === "7d" ? "7 derniers jours" : "Aujourd'hui"],
      ["Nombre d'AMs:", amsWithStats.length],
      [],
      [],
      ["STATISTIQUES GLOBALES"],
      ["Total Clients", "Dépense Client Totale", "Marge Brute Totale", "Performance Moyenne"],
      [
        `Total Clients`,
        `${(amsWithStats.reduce((sum, am) => sum + am.totalDepense, 0) / 1000).toFixed(1)}K€`,
        `${(amsWithStats.reduce((sum, am) => sum + am.validatedMarge, 0) / 1000).toFixed(1)}K€`,
        `+15%`,
      ],
      [],
      [],
      ["DÉTAILS PAR ACCOUNT MANAGER"],
      [
        "Nom",
        "Email",
        "Téléphone",
        "Clients",
        "Affiliés",
        "Dépense Client",
        "Marge Brute",
        "Performance",
        "Plans en cours",
        "Plans validés",
        "Statut",
        "Com. moy.",
      ],
    ]

    amsWithStats.forEach((am) => {
      wsData.push([
        am.name,
        am.email,
        am.phone,
        am.clients,
        am.affiliates,
        `${(am.totalDepense / 1000).toFixed(1)}K€`,
        `${(am.validatedMarge / 1000).toFixed(1)}K€`,
        am.performance,
        am.plansEnCours,
        am.plansValides,
        am.status,
        am.avgCommissionRate.toFixed(0) + "%",
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Account Managers")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `account_managers_${new Date().toISOString().split("T")[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    let csvContent = "LISTE DES ACCOUNT MANAGERS - EXPORT\n\n"
    csvContent += `Date d'export:,${new Date().toLocaleDateString("fr-FR")}\n`
    csvContent += `Période:,${period === "30d" ? "30 derniers jours" : period === "7d" ? "7 derniers jours" : "Aujourd'hui"}\n`
    csvContent += `Nombre d'AMs:,${amsWithStats.length}\n\n`

    csvContent += "STATISTIQUES GLOBALES\n"
    csvContent += `Total Clients,Dépense Client Totale,Marge Brute Totale,Performance Moyenne\n`
    csvContent += `Total Clients,${(amsWithStats.reduce((sum, am) => sum + am.totalDepense, 0) / 1000).toFixed(1)}K€,${(amsWithStats.reduce((sum, am) => sum + am.validatedMarge, 0) / 1000).toFixed(1)}K€,+15%\n\n`

    csvContent += "DÉTAILS PAR ACCOUNT MANAGER\n"
    csvContent +=
      "Nom,Email,Téléphone,Clients,Affiliés,Dépense Client,Marge Brute,Performance,Plans en cours,Plans validés,Statut,Com. moy.\n"
    amsWithStats.forEach((am) => {
      csvContent += `${am.name},${am.email},${am.phone},${am.clients},${am.affiliates},${(am.totalDepense / 1000).toFixed(1)}K€,${(am.validatedMarge / 1000).toFixed(1)}K€,${am.performance},${am.plansEnCours},${am.plansValides},${am.status},${am.avgCommissionRate.toFixed(0)}%\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `account_managers_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Creating new account manager...")
      const newAM = await createAccountManager({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || "+33 6 00 00 00 00",
        avatar: "/am-avatar.jpg",
        status: "active",
        join_date: new Date().toLocaleDateString("fr-FR"),
        level: formData.level as "senior" | "junior" | "stagiaire",
        monthly_objective: formData.monthlyObjective ? Number(formData.monthlyObjective) : undefined,
        location: formData.location || undefined,
      })

      console.log("[v0] Account manager created:", newAM)

      setCustomAMs([...customAMs, newAM])

      toast({
        title: "Account Manager créé",
        description: `${newAM.name} a été ajouté avec succès.`,
      })

      setShowCreateDialog(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        level: "junior",
        monthlyObjective: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("[v0] Failed to create account manager:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'Account Manager.",
        variant: "destructive",
      })
    }
  }

  const filteredAMs = useMemo(() => {
    let filtered = amsWithStats

    if (performanceFilter === "inactive") {
      filtered = filtered.filter((am) => am.amStatus === "inactive")
    } else if (performanceFilter !== "transferred") {
      filtered = filtered.filter((am) => am.amStatus !== "inactive" && am.amStatus !== "transferred")
    } else {
      filtered = filtered.filter((am) => am.amStatus === "transferred")
    }

    if (performanceFilter !== "all" && performanceFilter !== "transferred" && performanceFilter !== "inactive") {
      filtered = filtered.filter((am) => am.status === performanceFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (am) =>
          am.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          am.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "clients":
          return b.clients - a.clients
        case "marge":
          return b.validatedMarge - a.validatedMarge
        case "performance":
          return b.performance - a.performance
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [amsWithStats, performanceFilter, searchQuery, sortBy])

  const alerts = useMemo(() => {
    const lowPerformers = amsWithStats.filter(
      (am) => am.amStatus !== "inactive" && am.performance < 50 && am.status !== "nouveau",
    )
    const noActivity = amsWithStats.filter((am) => am.amStatus !== "inactive" && am.totalPlans === 0)
    const urgentPlans = amsWithStats.filter((am) => am.plansEnCours > 10)

    return { lowPerformers, noActivity, urgentPlans }
  }, [amsWithStats])

  const performanceChartData = useMemo(() => {
    const activeAMs = amsWithStats.filter((am) => am.amStatus !== "inactive" && am.amStatus !== "transferred")
    return activeAMs.slice(0, 10).map((am) => ({
      name: am.name.split(" ")[0],
      marge: Math.round(am.validatedMarge / 1000),
      performance: Math.round(am.performance),
    }))
  }, [amsWithStats])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des Account Managers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Account Managers</h1>
            <p className="text-lg text-muted-foreground">Supervisez les performances de votre équipe</p>
          </div>
          <div className="flex gap-3">
            <DateRangePicker value={period} onChange={setPeriod} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nouvel AM
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvel Account Manager</DialogTitle>
                  <DialogDescription>
                    Créez un compte pour un nouveau membre de votre équipe. Des identifiants de connexion seront
                    générés.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@trinity.com"
                    />
                    <p className="text-xs text-muted-foreground">Cet email servira d'identifiant de connexion</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe *</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        minLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Paris, France"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Niveau *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger id="level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stagiaire">Account Manager Stagiaire</SelectItem>
                        <SelectItem value="junior">Account Manager Junior</SelectItem>
                        <SelectItem value="senior">Account Manager Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyObjective">Objectif mensuel (€)</Label>
                    <Input
                      id="monthlyObjective"
                      type="number"
                      value={formData.monthlyObjective}
                      onChange={(e) => setFormData({ ...formData, monthlyObjective: e.target.value })}
                      placeholder="50000"
                    />
                    <p className="text-sm text-muted-foreground">Objectif de dépense client mensuelle (optionnel)</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Créer le compte
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {(alerts.lowPerformers.length > 0 || alerts.noActivity.length > 0 || alerts.urgentPlans.length > 0) && (
          <div className="grid gap-3">
            {alerts.lowPerformers.length > 0 && !dismissedAlerts.includes("lowPerformers") && (
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-50/50">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">
                    {alerts.lowPerformers.length} AMs sous 50% de performance
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">{alerts.lowPerformers.map((am) => am.name).join(", ")}</p>
                </div>
                <Badge className="bg-orange-600 text-white">Action requise</Badge>
                <button
                  onClick={() => setDismissedAlerts([...dismissedAlerts, "lowPerformers"])}
                  className="p-1 rounded-md hover:bg-orange-100 transition-colors"
                  aria-label="Fermer l'alerte"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            {alerts.noActivity.length > 0 && !dismissedAlerts.includes("noActivity") && (
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-50/50">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">{alerts.noActivity.length} AMs sans plans</h3>
                  <p className="text-sm text-orange-700 mt-1">{alerts.noActivity.map((am) => am.name).join(", ")}</p>
                </div>
                <Badge className="bg-orange-600 text-white">À surveiller</Badge>
                <button
                  onClick={() => setDismissedAlerts([...dismissedAlerts, "noActivity"])}
                  className="p-1 rounded-md hover:bg-orange-100 transition-colors"
                  aria-label="Fermer l'alerte"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
            {alerts.urgentPlans.length > 0 && !dismissedAlerts.includes("urgentPlans") && (
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-50/50">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">
                    {alerts.urgentPlans.length} AMs avec +10 plans en attente
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">{alerts.urgentPlans.map((am) => am.name).join(", ")}</p>
                </div>
                <Badge className="bg-orange-600 text-white">Urgence validation</Badge>
                <button
                  onClick={() => setDismissedAlerts([...dismissedAlerts, "urgentPlans"])}
                  className="p-1 rounded-md hover:bg-orange-100 transition-colors"
                  aria-label="Fermer l'alerte"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Total AMs</p>
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {amsWithStats.filter((am) => am.amStatus !== "inactive" && am.amStatus !== "transferred").length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Actifs dans l'équipe</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Clients totaux</p>
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {amsWithStats.reduce((sum, am) => sum + am.clients, 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Répartis entre les AMs</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Dépense Client</p>
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight text-blue-600">
                {formatCurrency(amsWithStats.reduce((sum, am) => sum + am.validatedDepense, 0))}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(
                  amsWithStats.reduce((sum, am) => sum + am.validatedDepense, 0) -
                    amsWithStats.reduce((sum, am) => sum + am.validatedMarge, 0),
                )}{" "}
                gains affiliés
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Marge Brute</p>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight text-emerald-600">
                {formatCurrency(amsWithStats.reduce((sum, am) => sum + am.validatedMarge, 0))}
              </p>
              <p className="text-sm text-orange-600 mt-2">
                +{formatCurrency(amsWithStats.reduce((sum, am) => sum + am.pendingMarge, 0))} en attente
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold">Liste des Account Managers</h2>
                <p className="text-muted-foreground mt-1">Cliquez sur un AM pour voir les détails</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un AM..."
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="bon">Bon</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nom (A-Z)</SelectItem>
                    <SelectItem value="clients">Nombre de clients</SelectItem>
                    <SelectItem value="marge">Marge brute</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 border rounded-lg p-1 h-11">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {viewMode === "list" ? (
              <div className="space-y-4">
                {filteredAMs.map((am) => (
                  <Link key={am.id} href={`/manager/ams/${am.id}`}>
                    <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {am.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {am.status === "excellent" && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                              <span className="text-xs">⭐</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{am.name}</h3>
                            {am.status === "excellent" && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Excellent</Badge>
                            )}
                            {am.status === "attention" && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Attention</Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4" />
                              {am.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4" />
                              {am.phone}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-6 text-center">
                          <div>
                            <p className="text-2xl font-bold">{am.clients}</p>
                            <p className="text-xs text-muted-foreground mt-1">Clients</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(am.validatedDepense)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Dépense</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(am.validatedMarge)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Marge validée</p>
                            {am.pendingMarge > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                +{formatCurrency(am.pendingMarge)} en attente
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{am.plansEnCours}</p>
                            <p className="text-xs text-muted-foreground mt-1">En attente</p>
                          </div>
                          <div>
                            <p
                              className={`text-2xl font-bold ${am.performance >= 100 ? "text-emerald-500" : am.performance >= 80 ? "text-blue-500" : "text-orange-500"}`}
                            >
                              {formatPercentage(am.performance)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Perf.</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredAMs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Aucun AM trouvé</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAMs.map((am) => (
                  <Link key={am.id} href={`/manager/ams/${am.id}`}>
                    <div className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all h-full">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16" />
                      <div className="relative p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
                            {am.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{am.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{am.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                          {am.status === "excellent" && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Excellent</Badge>
                          )}
                          {am.status === "attention" && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">Attention</Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">Clients</span>
                            <span className="text-lg font-bold">{am.clients}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Marge validée</span>
                              <span className="text-lg font-bold text-emerald-600">
                                {formatCurrency(am.validatedMarge)}
                              </span>
                            </div>
                            {am.pendingMarge > 0 && (
                              <div className="flex justify-between items-center text-orange-600 mt-2 pt-2 border-t border-orange-200/50">
                                <span className="text-xs font-medium">En attente</span>
                                <span className="text-sm font-semibold">+{formatCurrency(am.pendingMarge)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">Performance</span>
                            <span
                              className={`text-lg font-bold ${am.performance >= 100 ? "text-emerald-500" : am.performance >= 80 ? "text-blue-500" : "text-orange-500"}`}
                            >
                              {formatPercentage(am.performance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredAMs.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Aucun AM trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
