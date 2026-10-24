"use client"

import { useEffect, useState, useMemo } from "react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { getClients } from "@/lib/supabase/queries/clients"
import { getCampaigns } from "@/lib/supabase/queries/campaigns"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, TrendingUp, Users, AlertTriangle, CheckCircle2, Calendar, Download, Filter } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

import { objectivesStore, getAMObjectivesForDisplay } from "@/lib/data/objectives-store"

const ManagerObjectifsPage = () => {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [amObjectivesMap, setAmObjectivesMap] = useState<Record<number, any>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [amsData, clientsData, campaignsData] = await Promise.all([
          getAllAccountManagers(),
          getClients(),
          getCampaigns(),
        ])
        setAccountManagers(amsData)
        setClients(clientsData)
        setCampaigns(campaignsData)
        console.log("[v0] Objectifs data from Supabase:", {
          ams: amsData?.length,
          clients: clientsData?.length,
          campaigns: campaignsData?.length,
        })

        const objectivesMap: Record<number, any> = {}
        amsData.forEach((am) => {
          objectivesMap[am.id] = getAMObjectivesForDisplay(am.id)
        })
        setAmObjectivesMap(objectivesMap)
      } catch (error) {
        console.error("[v0] Error loading objectifs data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  console.log("[v0] Objectifs data from Supabase:", {
    ams: accountManagers?.length,
    clients: clients?.length,
    campaigns: campaigns?.length,
  })

  const [selectedAM, setSelectedAM] = useState("")
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly" | "custom">("monthly")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const [objectives, setObjectives] = useState({
    margeBrute: "",
    depenses: "",
  })

  const [objectivesHistory, setObjectivesHistory] = useState([
    {
      id: 1,
      amId: 1,
      amName: "Sophie Martin",
      period: "Décembre 2024",
      periodType: "monthly",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      clientName: "TechCorp",
      campaignName: "Black Friday 2024",
      objectives: {
        margeBrute: { target: 10000, achieved: 11200 },
        depenses: { target: 50000, achieved: 52000 },
      },
      status: "achieved",
    },
    {
      id: 2,
      amId: 1,
      amName: "Sophie Martin",
      period: "Q4 2024",
      periodType: "quarterly",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      clientName: "TechCorp",
      campaignName: "Campagne Q4",
      objectives: {
        margeBrute: { target: 30000, achieved: 28500 },
        depenses: { target: 150000, achieved: 142000 },
      },
      status: "partial",
    },
    {
      id: 3,
      amId: 2,
      amName: "Thomas Dubois",
      period: "Novembre 2024",
      periodType: "monthly",
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      clientName: "StartupXYZ",
      campaignName: "Lancement produit",
      objectives: {
        margeBrute: { target: 8000, achieved: 6500 },
        depenses: { target: 40000, achieved: 35000 },
      },
      status: "missed",
    },
  ])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500"
    if (percentage >= 70) return "bg-blue-500"
    if (percentage >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90)
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Excellent
        </Badge>
      )
    if (percentage >= 70)
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <TrendingUp className="w-3 h-3 mr-1" />
          Bon
        </Badge>
      )
    if (percentage >= 50)
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Attention
        </Badge>
      )
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Critique
      </Badge>
    )
  }

  const calculatePercentage = (current: number, target: number) => {
    if (!target || target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const handleSetObjectives = () => {
    const margeBruteValue = Number.parseInt(objectives.margeBrute) || 0
    const depensesValue = Number.parseInt(objectives.depenses) || 0

    if (!selectedAM) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un Account Manager",
        variant: "destructive",
      })
      return
    }

    if (periodType === "custom" && (!customStartDate || !customEndDate)) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une période personnalisée",
        variant: "destructive",
      })
      return
    }

    const amId = Number.parseInt(selectedAM)
    const am = accountManagers.find((a) => a.id === amId)
    if (!am) return

    const periodLabel =
      periodType === "monthly"
        ? `${new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" })}`
        : periodType === "quarterly"
          ? `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`
          : `${customStartDate} → ${customEndDate}`

    const startDate =
      periodType === "monthly"
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
        : periodType === "quarterly"
          ? new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1).toISOString().split("T")[0]
          : customStartDate

    const endDate =
      periodType === "monthly"
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
        : periodType === "quarterly"
          ? new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0)
              .toISOString()
              .split("T")[0]
          : customEndDate

    objectivesStore.setObjectives({
      amId,
      amName: am.name,
      period: {
        type: periodType,
        startDate,
        endDate,
        label: periodLabel,
      },
      metrics: {
        margeBrute: { target: margeBruteValue, current: 0 },
        depenses: { target: depensesValue, current: 0 },
      },
      createdAt: new Date().toISOString(),
      createdBy: "Manager",
    })

    console.log("[v0] Setting objectives:", {
      am: selectedAM,
      periodType,
      customPeriod: periodType === "custom" ? { start: customStartDate, end: customEndDate } : null,
      objectives,
    })

    toast({
      title: "Objectifs définis",
      description: `Les objectifs ${periodType === "monthly" ? "mensuels" : periodType === "quarterly" ? "trimestriels" : "personnalisés"} ont été définis avec succès pour ${am.name}`,
    })

    // Reset form
    setSelectedAM("")
    setPeriodType("monthly")
    setCustomStartDate("")
    setCustomEndDate("")
    setObjectives({ margeBrute: "", depenses: "" })

    setIsDialogOpen(false)

    // Force component re-render by updating a state variable
  }

  const getHistoryStatusBadge = (status: string) => {
    if (status === "achieved")
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Atteint
        </Badge>
      )
    if (status === "partial")
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Partiel
        </Badge>
      )
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Non atteint
      </Badge>
    )
  }

  // Updated state to include customApplied for better filter management
  const [historyFilters, setHistoryFilters] = useState({
    am: "all",
    client: "all",
    campaign: "all",
    period: "all",
    customStartDate: "",
    customEndDate: "",
    customApplied: false, // Track if custom filter is applied
  })

  const availableClients = useMemo(() => {
    if (historyFilters.am === "all") {
      return clients || []
    }
    // For now, return all clients - could be filtered by AM relationship
    return clients || []
  }, [historyFilters.am, clients])

  const availableCampaigns = useMemo(() => {
    if (historyFilters.am === "all") {
      return campaigns || []
    }
    // For now, return all campaigns - could be filtered by AM relationship
    return campaigns || []
  }, [historyFilters.am, historyFilters.client, campaigns])

  const handleAMFilterChange = (value: string) => {
    setHistoryFilters({
      ...historyFilters,
      am: value,
      client: "all", // Reset client when AM changes
      campaign: "all", // Reset campaign when AM changes
    })
  }

  const handleClientFilterChange = (value: string) => {
    setHistoryFilters({
      ...historyFilters,
      client: value,
      campaign: "all", // Reset campaign when client changes
    })
  }

  const handleApplyCustomFilter = () => {
    if (!historyFilters.customStartDate || !historyFilters.customEndDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date de début et de fin",
        variant: "destructive",
      })
      return
    }

    setHistoryFilters({ ...historyFilters, customApplied: true })

    toast({
      title: "Filtre appliqué",
      description: `Période: ${historyFilters.customStartDate} → ${historyFilters.customEndDate}`,
    })
  }

  const exportHistoryToExcel = () => {
    const filteredHistory = objectivesHistory.filter((h) => {
      if (historyFilters.am !== "all" && h.amId.toString() !== historyFilters.am) return false
      if (historyFilters.client !== "all" && h.clientName !== historyFilters.client) return false
      if (historyFilters.campaign !== "all" && h.campaignName !== historyFilters.campaign) return false
      if (
        historyFilters.period !== "all" &&
        historyFilters.period !== "custom" &&
        h.periodType !== historyFilters.period
      )
        return false
      if (historyFilters.period === "custom" && historyFilters.customApplied) {
        if (historyFilters.customStartDate && h.startDate < historyFilters.customStartDate) return false
        if (historyFilters.customEndDate && h.endDate > historyFilters.customEndDate) return false
      }
      return true
    })

    const wb = XLSX.utils.book_new()

    // Title and metadata
    const wsData: any[][] = [
      ["HISTORIQUE DES OBJECTIFS - EXPORT"],
      [],
      ["Date d'export:", new Date().toLocaleDateString("fr-FR")],
      ["Nombre d'enregistrements:", filteredHistory.length],
      [],
      [],
      ["DÉTAILS PAR ACCOUNT MANAGER"],
      [
        "Account Manager",
        "Période",
        "Type",
        "Date début",
        "Date fin",
        "Client",
        "Campagne",
        "Marge Brute Cible (€)",
        "Marge Brute Atteinte (€)",
        "Taux d'atteinte MB (%)",
        "Dépenses Cible (€)",
        "Dépenses Atteintes (€)",
        "Taux d'atteinte Dép (%)",
        "Statut",
      ],
    ]

    // Add detail rows
    filteredHistory.forEach((h) => {
      wsData.push([
        h.amName,
        h.period,
        h.periodType === "monthly" ? "Mensuel" : h.periodType === "quarterly" ? "Trimestriel" : "Personnalisé",
        h.startDate,
        h.endDate,
        h.clientName,
        h.campaignName,
        h.objectives.margeBrute.target,
        h.objectives.margeBrute.achieved,
        Number.parseFloat(((h.objectives.margeBrute.achieved / h.objectives.margeBrute.target) * 100).toFixed(1)),
        h.objectives.depenses.target,
        h.objectives.depenses.achieved,
        Number.parseFloat(((h.objectives.depenses.achieved / h.objectives.depenses.target) * 100).toFixed(1)),
        h.status === "achieved" ? "Atteint" : h.status === "partial" ? "Partiel" : "Non atteint",
      ])
    })

    wsData.push(
      [],
      [],
      ["SYNTHÈSE PAR CAMPAGNE"],
      ["Campagne", "Nombre d'objectifs", "Marge Brute Totale Cible", "Marge Brute Totale Atteinte", "Taux moyen"],
    )

    // Group by campaign
    const campaignGroups = filteredHistory.reduce(
      (acc, h) => {
        if (!acc[h.campaignName]) {
          acc[h.campaignName] = { count: 0, targetMB: 0, achievedMB: 0 }
        }
        acc[h.campaignName].count++
        acc[h.campaignName].targetMB += h.objectives.margeBrute.target
        acc[h.campaignName].achievedMB += h.objectives.margeBrute.achieved
        return acc
      },
      {} as Record<string, { count: number; targetMB: number; achievedMB: number }>,
    )

    Object.entries(campaignGroups).forEach(([campaign, data]) => {
      wsData.push([
        campaign,
        data.count,
        data.targetMB,
        data.achievedMB,
        Number.parseFloat(((data.achievedMB / data.targetMB) * 100).toFixed(1)),
      ])
    })

    wsData.push(
      [],
      [],
      ["SYNTHÈSE PAR CLIENT"],
      ["Client", "Nombre d'objectifs", "Dépenses Totales Cible", "Dépenses Totales Atteintes", "Taux moyen"],
    )

    // Group by client
    const clientGroups = filteredHistory.reduce(
      (acc, h) => {
        if (!acc[h.clientName]) {
          acc[h.clientName] = { count: 0, targetDep: 0, achievedDep: 0 }
        }
        acc[h.clientName].count++
        acc[h.clientName].targetDep += h.objectives.depenses.target
        acc[h.clientName].achievedDep += h.objectives.depenses.achieved
        return acc
      },
      {} as Record<string, { count: number; targetDep: number; achievedDep: number }>,
    )

    Object.entries(clientGroups).forEach(([client, data]) => {
      wsData.push([
        client,
        data.count,
        data.targetDep,
        data.achievedDep,
        Number.parseFloat(((data.achievedDep / data.targetDep) * 100).toFixed(1)),
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Account Manager
      { wch: 15 }, // Période
      { wch: 12 }, // Type
      { wch: 12 }, // Date début
      { wch: 12 }, // Date fin
      { wch: 15 }, // Client
      { wch: 20 }, // Campagne
      { wch: 18 }, // Marge Brute Cible
      { wch: 20 }, // Marge Brute Atteinte
      { wch: 18 }, // Taux MB
      { wch: 18 }, // Dépenses Cible
      { wch: 20 }, // Dépenses Atteintes
      { wch: 18 }, // Taux Dép
      { wch: 12 }, // Statut
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Historique Objectifs")

    // Generate file data as array buffer
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Create blob and download link
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `historique_objectifs_${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "L'historique des objectifs a été exporté en Excel",
    })
  }

  const exportHistoryToCSV = () => {
    const filteredHistory = objectivesHistory.filter((h) => {
      if (historyFilters.am !== "all" && h.amId.toString() !== historyFilters.am) return false
      if (historyFilters.client !== "all" && h.clientName !== historyFilters.client) return false
      if (historyFilters.campaign !== "all" && h.campaignName !== historyFilters.campaign) return false
      if (
        historyFilters.period !== "all" &&
        historyFilters.period !== "custom" &&
        h.periodType !== historyFilters.period
      )
        return false
      if (historyFilters.period === "custom" && historyFilters.customApplied) {
        const historyStart = new Date(h.startDate)
        const historyEnd = new Date(h.endDate)
        const filterStart = new Date(historyFilters.customStartDate)
        const filterEnd = new Date(historyFilters.customEndDate)
        if (historyEnd < filterStart || historyStart > filterEnd) return false
      }
      return true
    })

    const csvContent = [
      [
        "Account Manager",
        "Période",
        "Type",
        "Date début",
        "Date fin",
        "Client",
        "Campagne",
        "Marge Brute Cible",
        "Marge Brute Atteinte",
        "Taux MB (%)",
        "Dépenses Cible",
        "Dépenses Atteintes",
        "Taux Dép (%)",
        "Statut",
      ].join(","),
      ...filteredHistory.map((h) =>
        [
          h.amName,
          h.period,
          h.periodType === "monthly" ? "Mensuel" : h.periodType === "quarterly" ? "Trimestriel" : "Personnalisé",
          h.startDate,
          h.endDate,
          h.clientName,
          h.campaignName,
          h.objectives.margeBrute.target,
          h.objectives.margeBrute.achieved,
          ((h.objectives.margeBrute.achieved / h.objectives.margeBrute.target) * 100).toFixed(1),
          h.objectives.depenses.target,
          h.objectives.depenses.achieved,
          ((h.objectives.depenses.achieved / h.objectives.depenses.target) * 100).toFixed(1),
          h.status === "achieved" ? "Atteint" : h.status === "partial" ? "Partiel" : "Non atteint",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `historique_objectifs_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: "L'historique des objectifs a été exporté en CSV",
    })
  }

  const filteredHistory = objectivesHistory.filter((h) => {
    if (historyFilters.am !== "all" && h.amId.toString() !== historyFilters.am) return false
    if (historyFilters.client !== "all" && h.clientName !== historyFilters.client) return false
    if (historyFilters.campaign !== "all" && h.campaignName !== historyFilters.campaign) return false
    if (historyFilters.period !== "all" && historyFilters.period !== "custom" && h.periodType !== historyFilters.period)
      return false

    if (historyFilters.period === "custom" && historyFilters.customApplied) {
      const historyStart = new Date(h.startDate)
      const historyEnd = new Date(h.endDate)
      const filterStart = new Date(historyFilters.customStartDate)
      const filterEnd = new Date(historyFilters.customEndDate)

      // Include if history period overlaps with filter period
      if (historyEnd < filterStart || historyStart > filterEnd) return false
    }

    return true
  })

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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des Objectifs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Définissez et suivez les objectifs de vos Account Managers
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Target className="w-4 h-4 mr-2" />
                Définir des objectifs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Définir des objectifs</DialogTitle>
                <DialogDescription>Configurez les objectifs pour un Account Manager</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="am-select">Account Manager</Label>
                  <Select value={selectedAM} onValueChange={setSelectedAM}>
                    <SelectTrigger id="am-select">
                      <SelectValue placeholder="Sélectionner un AM" />
                    </SelectTrigger>
                    <SelectContent>
                      {(accountManagers || []).map((am) => (
                        <SelectItem key={am.id} value={am.id.toString()}>
                          {am.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period-type">Type de période</Label>
                  <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                    <SelectTrigger id="period-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="custom">Période personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodType === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Date de début</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Date de fin</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Objectifs</h4>

                  <div className="space-y-2">
                    <Label htmlFor="marge-brute">Marge brute (€)</Label>
                    <Input
                      id="marge-brute"
                      type="text"
                      inputMode="numeric"
                      placeholder="10000"
                      value={objectives.margeBrute}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setObjectives({ ...objectives, margeBrute: value })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Commission totale à générer sur la période</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depenses">Dépenses client (€)</Label>
                    <Input
                      id="depenses"
                      type="text"
                      inputMode="numeric"
                      placeholder="50000"
                      value={objectives.depenses}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setObjectives({ ...objectives, depenses: value })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total des dépenses clients à facturer (frais fixes + commission)
                    </p>
                  </div>
                </div>

                <Button onClick={handleSetObjectives} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Enregistrer les objectifs
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AMs suivis</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountManagers?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Account Managers actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectifs atteints</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67%</div>
              <p className="text-xs text-muted-foreground">En moyenne ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En difficulté</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">AM sous les 50%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance globale</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">+12%</div>
              <p className="text-xs text-muted-foreground">vs mois dernier</p>
            </CardContent>
          </Card>
        </div>

        {/* AMs List with Objectives */}
        <div className="space-y-4">
          {(accountManagers || []).map((am) => {
            const amObjectives = amObjectivesMap[am.id] || {
              monthly: {
                margeBrute: { target: 0, current: 0 },
                depenses: { target: 0, current: 0 },
              },
              quarterly: {
                margeBrute: { target: 0, current: 0 },
                depenses: { target: 0, current: 0 },
              },
            }

            return (
              <Card key={am.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {am.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{am.name}</CardTitle>
                        <CardDescription>Objectifs mensuels et trimestriels</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/manager/ams/${am.id}`}>Voir le profil</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Monthly Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">Objectifs mensuels</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Marge Brute */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Marge brute</span>
                          {getStatusBadge(
                            calculatePercentage(
                              amObjectives.monthly.margeBrute.current,
                              amObjectives.monthly.margeBrute.target,
                            ),
                          )}
                        </div>
                        <Progress
                          value={calculatePercentage(
                            amObjectives.monthly.margeBrute.current,
                            amObjectives.monthly.margeBrute.target,
                          )}
                          className="h-2"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              amObjectives.monthly.margeBrute.current,
                              amObjectives.monthly.margeBrute.target,
                            ),
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(amObjectives.monthly.margeBrute.current ?? 0).toLocaleString()}€ /{" "}
                          {(amObjectives.monthly.margeBrute.target ?? 0).toLocaleString()}€
                        </p>
                      </div>

                      {/* Dépenses */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Dépenses client</span>
                          {getStatusBadge(
                            calculatePercentage(
                              amObjectives.monthly.depenses.current,
                              amObjectives.monthly.depenses.target,
                            ),
                          )}
                        </div>
                        <Progress
                          value={calculatePercentage(
                            amObjectives.monthly.depenses.current,
                            amObjectives.monthly.depenses.target,
                          )}
                          className="h-2"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              amObjectives.monthly.depenses.current,
                              amObjectives.monthly.depenses.target,
                            ),
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(amObjectives.monthly.depenses.current ?? 0).toLocaleString()}€ /{" "}
                          {(amObjectives.monthly.depenses.target ?? 0).toLocaleString()}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quarterly Objectives */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">Objectifs trimestriels</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Marge Brute */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Marge brute</span>
                          {getStatusBadge(
                            calculatePercentage(
                              amObjectives.quarterly.margeBrute.current,
                              amObjectives.quarterly.margeBrute.target,
                            ),
                          )}
                        </div>
                        <Progress
                          value={calculatePercentage(
                            amObjectives.quarterly.margeBrute.current,
                            amObjectives.quarterly.margeBrute.target,
                          )}
                          className="h-2"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              amObjectives.quarterly.margeBrute.current,
                              amObjectives.quarterly.margeBrute.target,
                            ),
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(amObjectives.quarterly.margeBrute.current ?? 0).toLocaleString()}€ /{" "}
                          {(amObjectives.quarterly.margeBrute.target ?? 0).toLocaleString()}€
                        </p>
                      </div>

                      {/* Dépenses */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Dépenses client</span>
                          {getStatusBadge(
                            calculatePercentage(
                              amObjectives.quarterly.depenses.current,
                              amObjectives.quarterly.depenses.target,
                            ),
                          )}
                        </div>
                        <Progress
                          value={calculatePercentage(
                            amObjectives.quarterly.depenses.current,
                            amObjectives.quarterly.depenses.target,
                          )}
                          className="h-2"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              amObjectives.quarterly.depenses.current,
                              amObjectives.quarterly.depenses.target,
                            ),
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(amObjectives.quarterly.depenses.current ?? 0).toLocaleString()}€ /{" "}
                          {(amObjectives.quarterly.depenses.target ?? 0).toLocaleString()}€
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historique des objectifs</CardTitle>
                <CardDescription>Consultez les objectifs passés et leur atteinte</CardDescription>
              </div>
              <Select onValueChange={(value) => (value === "excel" ? exportHistoryToExcel() : exportHistoryToCSV())}>
                <SelectTrigger className="w-[140px]">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Exporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres intelligents:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={historyFilters.am} onValueChange={handleAMFilterChange}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Tous les AMs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les AMs</SelectItem>
                    {(accountManagers || []).map((am) => (
                      <SelectItem key={am.id} value={am.id.toString()}>
                        {am.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={historyFilters.client} onValueChange={handleClientFilterChange}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {availableClients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={historyFilters.campaign}
                  onValueChange={(value) => setHistoryFilters({ ...historyFilters, campaign: value })}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Toutes les campagnes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les campagnes</SelectItem>
                    {availableCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.name}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={historyFilters.period}
                  onValueChange={(value) =>
                    setHistoryFilters({ ...historyFilters, period: value, customApplied: false })
                  }
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="monthly">Mensuels</SelectItem>
                    <SelectItem value="quarterly">Trimestriels</SelectItem>
                    <SelectItem value="custom">Personnalisés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {historyFilters.period === "custom" && (
                <div className="flex gap-3 pt-2 border-t items-end">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="filter-start-date" className="text-xs">
                      Date de début
                    </Label>
                    <Input
                      id="filter-start-date"
                      type="date"
                      value={historyFilters.customStartDate}
                      onChange={(e) =>
                        setHistoryFilters({ ...historyFilters, customStartDate: e.target.value, customApplied: false })
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="filter-end-date" className="text-xs">
                      Date de fin
                    </Label>
                    <Input
                      id="filter-end-date"
                      type="date"
                      value={historyFilters.customEndDate}
                      onChange={(e) =>
                        setHistoryFilters({ ...historyFilters, customEndDate: e.target.value, customApplied: false })
                      }
                      className="h-9"
                    />
                  </div>
                  <Button onClick={handleApplyCustomFilter} size="sm" className="h-9">
                    Valider
                  </Button>
                </div>
              )}

              {(historyFilters.am !== "all" ||
                historyFilters.client !== "all" ||
                historyFilters.campaign !== "all" ||
                historyFilters.period !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setHistoryFilters({
                      am: "all",
                      client: "all",
                      campaign: "all",
                      period: "all",
                      customStartDate: "",
                      customEndDate: "",
                      customApplied: false,
                    })
                  }
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun historique trouvé avec ces filtres</p>
                </div>
              ) : (
                filteredHistory.map((history) => (
                  <div key={history.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{history.amName}</p>
                          {getHistoryStatusBadge(history.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {history.period} ({history.startDate} → {history.endDate})
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {history.clientName}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {history.campaignName}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {history.periodType === "monthly"
                          ? "Mensuel"
                          : history.periodType === "quarterly"
                            ? "Trimestriel"
                            : "Personnalisé"}
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Marge brute</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            {(history.objectives.margeBrute.achieved ?? 0).toLocaleString()}€
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {(history.objectives.margeBrute.target ?? 0).toLocaleString()}€
                          </span>
                        </div>
                        <Progress
                          value={calculatePercentage(
                            history.objectives.margeBrute.achieved,
                            history.objectives.margeBrute.target,
                          )}
                          className="h-1.5"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              history.objectives.margeBrute.achieved,
                              history.objectives.margeBrute.target,
                            ),
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Dépenses client</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            {(history.objectives.depenses.achieved ?? 0).toLocaleString()}€
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {(history.objectives.depenses.target ?? 0).toLocaleString()}€
                          </span>
                        </div>
                        <Progress
                          value={calculatePercentage(
                            history.objectives.depenses.achieved,
                            history.objectives.depenses.target,
                          )}
                          className="h-1.5"
                          indicatorClassName={getProgressColor(
                            calculatePercentage(
                              history.objectives.depenses.achieved,
                              history.objectives.depenses.target,
                            ),
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ManagerObjectifsPage
