"use client"

import { useEffect, useState } from "react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { getAffiliates } from "@/lib/supabase/queries/affiliates"
import { getCampaigns } from "@/lib/supabase/queries/campaigns"
import { getClients } from "@/lib/supabase/queries/clients"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Download,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Check,
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ReportMetric =
  | "margeBrute"
  | "depenseClient"
  | "plans"
  | "clients"
  | "affiliates"
  | "campaigns"
  | "commission"
  | "plansValides"
  | "plansRejetes"
  | "tauxValidation"
  | "nouveauxClients" // Added this metric
type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly"
type ExportFormat = "excel" | "csv"
type GroupBy = "am" | "affiliate" | "campaign" | "client" | "none"

interface CustomReportConfig {
  // Entity selection
  selectedAMs: string[]
  selectedAffiliates: string[]
  selectedCampaigns: string[]
  selectedClients: string[]

  // Metric selection
  selectedMetrics: string[]

  // Date range
  datePreset: string
  customStartDate: string
  customEndDate: string

  // Export options
  exportFormat: ExportFormat
  groupBy: GroupBy
  includeSummary: boolean
  includeCharts: boolean
}

interface ScheduledReport extends CustomReportConfig {
  id: string
  name: string
  frequency: ReportFrequency
  recipients: string[]
  lastSent: string
  nextSend: string
  active: boolean
}

export default function ManagerReportsPage() {
  const [isCustomReportOpen, setIsCustomReportOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null)

  const [openAMsPopover, setOpenAMsPopover] = useState(false)
  const [openAffiliatesPopover, setOpenAffiliatesPopover] = useState(false)
  const [openCampaignsPopover, setOpenCampaignsPopover] = useState(false)
  const [openClientsPopover, setOpenClientsPopover] = useState(false)

  const [accountManagers, setAccountManagers] = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [amsData, affiliatesData, campaignsData, clientsData] = await Promise.all([
          getAllAccountManagers(),
          getAffiliates(),
          getCampaigns(),
          getClients(),
        ])
        setAccountManagers(amsData)
        setAffiliates(affiliatesData)
        setCampaigns(campaignsData)
        setClients(clientsData)
        console.log("[v0] Reports data loaded from Supabase:", {
          ams: amsData?.length,
          affiliates: affiliatesData?.length,
          campaigns: campaignsData?.length,
          clients: clientsData?.length,
        })
      } catch (error) {
        console.error("[v0] Error loading reports data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  console.log("[v0] Reports data from Supabase:", {
    ams: accountManagers?.length,
    affiliates: affiliates?.length,
    campaigns: campaigns?.length,
    clients: clients?.length,
  })

  const [reportConfig, setReportConfig] = useState<CustomReportConfig>({
    selectedAMs: [],
    selectedAffiliates: [],
    selectedCampaigns: [],
    selectedClients: [],
    selectedMetrics: ["margeBrute", "depenseClient", "plans"],
    datePreset: "monthly",
    customStartDate: "",
    customEndDate: "",
    exportFormat: "excel",
    groupBy: "am",
    includeSummary: true,
    includeCharts: false,
  })

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Rapport mensuel équipe complète",
      frequency: "monthly",
      selectedAMs: ["1", "2", "3"],
      selectedAffiliates: [],
      selectedCampaigns: [],
      selectedClients: [],
      selectedMetrics: ["margeBrute", "depenseClient", "plans", "clients"],
      datePreset: "monthly",
      customStartDate: "",
      customEndDate: "",
      exportFormat: "excel",
      groupBy: "am",
      includeSummary: true,
      includeCharts: true,
      recipients: ["manager@trinity.com"],
      lastSent: "2025-09-25",
      nextSend: "2025-10-25",
      active: true,
    },
  ])

  // Removed hardcoded accountManagers, affiliates, campaigns, clients arrays

  const metricOptions = [
    { value: "margeBrute", label: "Marge brute", category: "Financier" },
    { value: "depenseClient", label: "Dépense client", category: "Financier" },
    { value: "commission", label: "Commission", category: "Financier" },
    { value: "plans", label: "Nombre de plans", category: "Performance" },
    { value: "plansValides", label: "Plans validés", category: "Performance" },
    { value: "plansRejetes", label: "Plans rejetés", category: "Performance" },
    { value: "tauxValidation", label: "Taux de validation", category: "Performance" },
    { value: "clients", label: "Nombre de clients", category: "Clients" },
    { value: "nouveauxClients", label: "Nouveaux clients", category: "Clients" },
    { value: "affiliates", label: "Nombre d'affiliés", category: "Affiliés" },
    { value: "campaigns", label: "Nombre de campagnes", category: "Campagnes" },
  ]

  const datePresets = [
    { value: "today", label: "Aujourd'hui" },
    { value: "yesterday", label: "Hier" },
    { value: "last7days", label: "7 derniers jours" },
    { value: "last30days", label: "30 derniers jours" },
    { value: "thisMonth", label: "Ce mois" },
    { value: "lastMonth", label: "Mois dernier" },
    { value: "thisQuarter", label: "Ce trimestre" },
    { value: "lastQuarter", label: "Trimestre dernier" },
    { value: "thisYear", label: "Cette année" },
    { value: "lastYear", label: "Année dernière" },
    { value: "custom", label: "Personnalisé" },
  ]

  const handleSelectAll = (entityType: "ams" | "affiliates" | "campaigns" | "clients") => {
    setReportConfig((prev) => {
      switch (entityType) {
        case "ams":
          return { ...prev, selectedAMs: (accountManagers || []).map((am) => am.id) }
        case "affiliates":
          return { ...prev, selectedAffiliates: (affiliates || []).map((a) => a.id) }
        case "campaigns":
          return { ...prev, selectedCampaigns: (campaigns || []).map((c) => c.id) }
        case "clients":
          return { ...prev, selectedClients: (clients || []).map((c) => c.id) }
      }
    })
  }

  const handleDeselectAll = (entityType: "ams" | "affiliates" | "campaigns" | "clients") => {
    setReportConfig((prev) => {
      switch (entityType) {
        case "ams":
          return { ...prev, selectedAMs: [] }
        case "affiliates":
          return { ...prev, selectedAffiliates: [] }
        case "campaigns":
          return { ...prev, selectedCampaigns: [] }
        case "clients":
          return { ...prev, selectedClients: [] }
      }
    })
  }

  const handleGenerateCustomReport = () => {
    if (reportConfig.selectedMetrics.length === 0) {
      toast.error("Veuillez sélectionner au moins une métrique")
      return
    }

    console.log("[v0] Generating custom report with config:", reportConfig)

    const wb = XLSX.utils.book_new()

    const selectedAMsList =
      reportConfig.selectedAMs.length > 0
        ? (accountManagers || []).filter((am) => reportConfig.selectedAMs.includes(am.id))
        : accountManagers || []

    const selectedAffiliatesList =
      reportConfig.selectedAffiliates.length > 0
        ? (affiliates || []).filter((a) => reportConfig.selectedAffiliates.includes(a.id))
        : affiliates || []

    const selectedCampaignsList =
      reportConfig.selectedCampaigns.length > 0
        ? (campaigns || []).filter((c) => reportConfig.selectedCampaigns.includes(c.id))
        : campaigns || []

    const selectedClientsList =
      reportConfig.selectedClients.length > 0
        ? (clients || []).filter((c) => reportConfig.selectedClients.includes(c.id))
        : clients || []

    // Summary sheet with better structure
    if (reportConfig.includeSummary) {
      const summaryData: any[][] = [
        ["RAPPORT PERSONNALISÉ"],
        [],
        ["Informations générales"],
        ["Date de génération", new Date().toLocaleDateString("fr-FR", { dateStyle: "full" })],
        ["Heure de génération", new Date().toLocaleTimeString("fr-FR")],
        [
          "Période",
          reportConfig.datePreset === "custom"
            ? `${reportConfig.customStartDate} au ${reportConfig.customEndDate}`
            : datePresets.find((p) => p.value === reportConfig.datePreset)?.label || "Non spécifiée",
        ],
        [],
        ["Filtres appliqués"],
        ["Account Managers", reportConfig.selectedAMs.length > 0 ? reportConfig.selectedAMs.length : "Tous"],
        ["Affiliés", reportConfig.selectedAffiliates.length > 0 ? reportConfig.selectedAffiliates.length : "Tous"],
        ["Campagnes", reportConfig.selectedCampaigns.length > 0 ? reportConfig.selectedCampaigns.length : "Toutes"],
        ["Clients", reportConfig.selectedClients.length > 0 ? reportConfig.selectedClients.length : "Tous"],
        [],
        ["Configuration d'export"],
        ["Format", reportConfig.exportFormat === "excel" ? "Excel (.xlsx)" : "CSV (.csv)"],
        [
          "Groupement",
          reportConfig.groupBy === "am"
            ? "Par Account Manager"
            : reportConfig.groupBy === "affiliate"
              ? "Par Affilié"
              : reportConfig.groupBy === "campaign"
                ? "Par Campagne"
                : reportConfig.groupBy === "client"
                  ? "Par Client"
                  : "Aucun",
        ],
        ["Métriques incluses", reportConfig.selectedMetrics.length],
        [],
        ["STATISTIQUES GLOBALES"],
        [],
        ["Métrique", "Valeur", "Variation"],
      ]

      // Add global statistics with mock data
      reportConfig.selectedMetrics.forEach((metric) => {
        const metricLabel = metricOptions.find((m) => m.value === metric)?.label || metric
        const value = Math.floor(Math.random() * 100000)
        const variation = (Math.random() * 40 - 20).toFixed(1) + "%"
        summaryData.push([metricLabel, value.toLocaleString("fr-FR"), variation])
      })

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé")
    }

    // Detailed data sheets by entity type
    if (reportConfig.groupBy !== "none") {
      let entities: any[] = []
      let sheetName = ""
      let entityLabel = ""

      switch (reportConfig.groupBy) {
        case "am":
          entities = selectedAMsList
          sheetName = "Données par AM"
          entityLabel = "Account Manager"
          break
        case "affiliate":
          entities = selectedAffiliatesList
          sheetName = "Données par Affilié"
          entityLabel = "Affilié"
          break
        case "campaign":
          entities = selectedCampaignsList
          sheetName = "Données par Campagne"
          entityLabel = "Campagne"
          break
        case "client":
          entities = selectedClientsList
          sheetName = "Données par Client"
          entityLabel = "Client"
          break
      }

      const detailedData: any[][] = [
        [sheetName.toUpperCase()],
        [],
        [
          entityLabel,
          ...reportConfig.selectedMetrics.map((m) => metricOptions.find((opt) => opt.value === m)?.label || m),
        ],
      ]

      entities.forEach((entity) => {
        const row = [
          entity.name || entity.entity || "N/A",
          ...reportConfig.selectedMetrics.map(() => Math.floor(Math.random() * 50000)),
        ]
        detailedData.push(row)
      })

      // Add totals row
      const totalsRow = [
        "TOTAL",
        ...reportConfig.selectedMetrics.map((_, index) => {
          return entities.reduce((sum) => sum + Math.floor(Math.random() * 50000), 0)
        }),
      ]
      detailedData.push([])
      detailedData.push(totalsRow)

      const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData)
      wsDetailed["!cols"] = [{ wch: 30 }, ...reportConfig.selectedMetrics.map(() => ({ wch: 18 }))]
      XLSX.utils.book_append_sheet(wb, wsDetailed, sheetName)
    }

    // Additional sheets for each entity type with details
    if (selectedAMsList.length > 0) {
      const amData: any[][] = [
        ["ACCOUNT MANAGERS - DÉTAILS"],
        [],
        ["Nom", "Email", "Clients actifs", "Plans en cours", "Taux de validation"],
      ]

      selectedAMsList.forEach((am) => {
        amData.push([
          am.name,
          `${am.name.toLowerCase().replace(" ", ".")}@trinity.com`,
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 15),
          (Math.random() * 100).toFixed(1) + "%",
        ])
      })

      const wsAMs = XLSX.utils.aoa_to_sheet(amData)
      wsAMs["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 18 }]
      XLSX.utils.book_append_sheet(wb, wsAMs, "Account Managers")
    }

    if (selectedAffiliatesList.length > 0) {
      const affiliateData: any[][] = [
        ["AFFILIÉS - DÉTAILS"],
        [],
        ["Nom", "Entité", "Plans soumis", "Plans validés", "Commission totale"],
      ]

      selectedAffiliatesList.forEach((affiliate) => {
        affiliateData.push([
          affiliate.name,
          affiliate.entity,
          Math.floor(Math.random() * 30),
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 50000).toLocaleString("fr-FR") + " €",
        ])
      })

      const wsAffiliates = XLSX.utils.aoa_to_sheet(affiliateData)
      wsAffiliates["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(wb, wsAffiliates, "Affiliés")
    }

    if (selectedCampaignsList.length > 0) {
      const campaignData: any[][] = [
        ["CAMPAGNES - DÉTAILS"],
        [],
        ["Nom", "Statut", "Affiliés assignés", "Budget", "ROI"],
      ]

      selectedCampaignsList.forEach((campaign) => {
        campaignData.push([
          campaign.name,
          Math.random() > 0.5 ? "Active" : "Terminée",
          Math.floor(Math.random() * 15),
          Math.floor(Math.random() * 100000).toLocaleString("fr-FR") + " €",
          (Math.random() * 300).toFixed(1) + "%",
        ])
      })

      const wsCampaigns = XLSX.utils.aoa_to_sheet(campaignData)
      wsCampaigns["!cols"] = [{ wch: 35 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, wsCampaigns, "Campagnes")
    }

    if (selectedClientsList.length > 0) {
      const clientData: any[][] = [
        ["CLIENTS - DÉTAILS"],
        [],
        ["Nom", "Secteur", "Dépense totale", "Plans actifs", "Satisfaction"],
      ]

      selectedClientsList.forEach((client) => {
        clientData.push([
          client.name,
          ["Tech", "Finance", "Retail", "Services"][Math.floor(Math.random() * 4)],
          Math.floor(Math.random() * 200000).toLocaleString("fr-FR") + " €",
          Math.floor(Math.random() * 10),
          (Math.random() * 2 + 3).toFixed(1) + "/5",
        ])
      })

      const wsClients = XLSX.utils.aoa_to_sheet(clientData)
      wsClients["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, wsClients, "Clients")
    }

    // Export
    if (reportConfig.exportFormat === "excel") {
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/octet-stream" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `rapport_personnalise_${new Date().toISOString().split("T")[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const csvData: string[] = []
      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(ws)
        csvData.push(`\n=== ${sheetName} ===\n${csv}`)
      })

      const blob = new Blob([csvData.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `rapport_personnalise_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }

    toast.success("Rapport généré avec succès")
    setIsCustomReportOpen(false)
  }

  const handleQuickReport = (type: "monthly" | "quarterly" | "yearly") => {
    const config: CustomReportConfig = {
      selectedAMs: [],
      selectedAffiliates: [],
      selectedCampaigns: [],
      selectedClients: [],
      selectedMetrics: ["margeBrute", "depenseClient", "plans", "plansValides", "clients", "affiliates"],
      datePreset: type === "monthly" ? "thisMonth" : type === "quarterly" ? "thisQuarter" : "thisYear",
      customStartDate: "",
      customEndDate: "",
      exportFormat: "excel",
      groupBy: "am",
      includeSummary: true,
      includeCharts: false,
    }

    setReportConfig(config)
    setTimeout(() => {
      handleGenerateCustomReport()
    }, 100)

    toast.success(
      `Génération du rapport ${type === "monthly" ? "mensuel" : type === "quarterly" ? "trimestriel" : "annuel"}...`,
    )
  }

  const handleExportEverything = () => {
    const config: CustomReportConfig = {
      selectedAMs: (accountManagers || []).map((am) => am.id),
      selectedAffiliates: (affiliates || []).map((a) => a.id),
      selectedCampaigns: (campaigns || []).map((c) => c.id),
      selectedClients: (clients || []).map((c) => c.id),
      selectedMetrics: metricOptions.map((m) => m.value),
      datePreset: "thisYear",
      customStartDate: "",
      customEndDate: "",
      exportFormat: "excel",
      groupBy: "am",
      includeSummary: true,
      includeCharts: false,
    }

    setReportConfig(config)
    setTimeout(() => {
      handleGenerateCustomReport()
    }, 100)

    toast.success("Export complet de toutes les données en cours...")
  }

  const handleEditScheduledReport = (report: ScheduledReport) => {
    setEditingReport(report)
    setReportConfig({
      selectedAMs: report.selectedAMs,
      selectedAffiliates: report.selectedAffiliates,
      selectedCampaigns: report.selectedCampaigns,
      selectedClients: report.selectedClients,
      selectedMetrics: report.selectedMetrics,
      datePreset: report.datePreset,
      customStartDate: report.customStartDate,
      customEndDate: report.customEndDate,
      exportFormat: report.exportFormat,
      groupBy: report.groupBy,
      includeSummary: report.includeSummary,
      includeCharts: report.includeCharts,
    })
    setIsCustomReportOpen(true)
  }

  const handleSaveEditedReport = () => {
    if (!editingReport) return

    setScheduledReports((prev) =>
      prev.map((r) =>
        r.id === editingReport.id
          ? {
              ...r,
              ...reportConfig,
            }
          : r,
      ),
    )

    toast.success("Rapport planifié mis à jour")
    setEditingReport(null)
    setIsCustomReportOpen(false)
  }

  const periodComparisons = [
    {
      metric: "Marge brute",
      current: 163000,
      previous: 145000,
      change: 18000,
      changePercent: 12.4,
    },
    {
      metric: "Dépense client",
      current: 935000,
      previous: 820000,
      change: 115000,
      changePercent: 14.0,
    },
    {
      metric: "Plans validés",
      current: 45,
      previous: 38,
      change: 7,
      changePercent: 18.4,
    },
    {
      metric: "Nouveaux clients",
      current: 8,
      previous: 12,
      change: -4,
      changePercent: -33.3,
    },
  ]

  // Add loading state check
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Chargement des données...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rapports Avancés</h1>
            <p className="text-muted-foreground">Générez, planifiez et exportez vos données</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportEverything}>
              <Download className="w-4 h-4 mr-2" />
              Tout exporter
            </Button>

            <Dialog open={isCustomReportOpen} onOpenChange={setIsCustomReportOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Rapport personnalisé
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>
                    {editingReport ? "Modifier le rapport planifié" : "Créer un rapport personnalisé"}
                  </DialogTitle>
                  <DialogDescription>
                    Sélectionnez les entités, métriques et options pour générer votre rapport
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">Sélection des entités</Label>
                        <p className="text-sm text-muted-foreground">Laissez vide pour inclure toutes les entités</p>
                      </div>

                      <div className="space-y-3">
                        {/* Account Managers */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Account Managers</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleSelectAll("ams")}
                              >
                                Tout sélectionner
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleDeselectAll("ams")}
                              >
                                Désélectionner
                              </Button>
                            </div>
                          </div>
                          <Popover open={openAMsPopover} onOpenChange={setOpenAMsPopover}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start bg-transparent">
                                {reportConfig.selectedAMs.length > 0
                                  ? `${reportConfig.selectedAMs.length} sélectionné(s)`
                                  : "Tous les Account Managers"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandList>
                                  <CommandEmpty>Aucun résultat</CommandEmpty>
                                  <CommandGroup>
                                    {(accountManagers || []).map((am) => (
                                      <CommandItem
                                        key={am.id}
                                        onSelect={() => {
                                          setReportConfig((prev) => ({
                                            ...prev,
                                            selectedAMs: prev.selectedAMs.includes(am.id)
                                              ? prev.selectedAMs.filter((id) => id !== am.id)
                                              : [...prev.selectedAMs, am.id],
                                          }))
                                        }}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div
                                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                                              reportConfig.selectedAMs.includes(am.id)
                                                ? "bg-primary border-primary"
                                                : "border-input"
                                            }`}
                                          >
                                            {reportConfig.selectedAMs.includes(am.id) && (
                                              <Check className="w-3 h-3 text-primary-foreground" />
                                            )}
                                          </div>
                                          <span>{am.name}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Affiliates */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Affiliés</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleSelectAll("affiliates")}
                              >
                                Tout sélectionner
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleDeselectAll("affiliates")}
                              >
                                Désélectionner
                              </Button>
                            </div>
                          </div>
                          <Popover open={openAffiliatesPopover} onOpenChange={setOpenAffiliatesPopover}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start bg-transparent">
                                {reportConfig.selectedAffiliates.length > 0
                                  ? `${reportConfig.selectedAffiliates.length} sélectionné(s)`
                                  : "Tous les affiliés"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandList>
                                  <CommandEmpty>Aucun résultat</CommandEmpty>
                                  <CommandGroup>
                                    {(affiliates || []).map((affiliate) => (
                                      <CommandItem
                                        key={affiliate.id}
                                        onSelect={() => {
                                          setReportConfig((prev) => ({
                                            ...prev,
                                            selectedAffiliates: prev.selectedAffiliates.includes(affiliate.id)
                                              ? prev.selectedAffiliates.filter((id) => id !== affiliate.id)
                                              : [...prev.selectedAffiliates, affiliate.id],
                                          }))
                                        }}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div
                                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                                              reportConfig.selectedAffiliates.includes(affiliate.id)
                                                ? "bg-primary border-primary"
                                                : "border-input"
                                            }`}
                                          >
                                            {reportConfig.selectedAffiliates.includes(affiliate.id) && (
                                              <Check className="w-3 h-3 text-primary-foreground" />
                                            )}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-sm">{affiliate.name}</span>
                                            <span className="text-xs text-muted-foreground">{affiliate.entity}</span>
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Campaigns */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Campagnes</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleSelectAll("campaigns")}
                              >
                                Tout sélectionner
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleDeselectAll("campaigns")}
                              >
                                Désélectionner
                              </Button>
                            </div>
                          </div>
                          <Popover open={openCampaignsPopover} onOpenChange={setOpenCampaignsPopover}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start bg-transparent">
                                {reportConfig.selectedCampaigns.length > 0
                                  ? `${reportConfig.selectedCampaigns.length} sélectionnée(s)`
                                  : "Toutes les campagnes"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandList>
                                  <CommandEmpty>Aucun résultat</CommandEmpty>
                                  <CommandGroup>
                                    {(campaigns || []).map((campaign) => (
                                      <CommandItem
                                        key={campaign.id}
                                        onSelect={() => {
                                          setReportConfig((prev) => ({
                                            ...prev,
                                            selectedCampaigns: prev.selectedCampaigns.includes(campaign.id)
                                              ? prev.selectedCampaigns.filter((id) => id !== campaign.id)
                                              : [...prev.selectedCampaigns, campaign.id],
                                          }))
                                        }}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div
                                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                                              reportConfig.selectedCampaigns.includes(campaign.id)
                                                ? "bg-primary border-primary"
                                                : "border-input"
                                            }`}
                                          >
                                            {reportConfig.selectedCampaigns.includes(campaign.id) && (
                                              <Check className="w-3 h-3 text-primary-foreground" />
                                            )}
                                          </div>
                                          <span className="text-sm">{campaign.name}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Clients */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Clients</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleSelectAll("clients")}
                              >
                                Tout sélectionner
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs px-2"
                                onClick={() => handleDeselectAll("clients")}
                              >
                                Désélectionner
                              </Button>
                            </div>
                          </div>
                          <Popover open={openClientsPopover} onOpenChange={setOpenClientsPopover}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start bg-transparent">
                                {reportConfig.selectedClients.length > 0
                                  ? `${reportConfig.selectedClients.length} sélectionné(s)`
                                  : "Tous les clients"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandList>
                                  <CommandEmpty>Aucun résultat</CommandEmpty>
                                  <CommandGroup>
                                    {(clients || []).map((client) => (
                                      <CommandItem
                                        key={client.id}
                                        onSelect={() => {
                                          setReportConfig((prev) => ({
                                            ...prev,
                                            selectedClients: prev.selectedClients.includes(client.id)
                                              ? prev.selectedClients.filter((id) => id !== client.id)
                                              : [...prev.selectedClients, client.id],
                                          }))
                                        }}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div
                                            className={`w-4 h-4 border rounded flex items-center justify-center ${
                                              reportConfig.selectedClients.includes(client.id)
                                                ? "bg-primary border-primary"
                                                : "border-input"
                                            }`}
                                          >
                                            {reportConfig.selectedClients.includes(client.id) && (
                                              <Check className="w-3 h-3 text-primary-foreground" />
                                            )}
                                          </div>
                                          <span>{client.name}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Métriques à inclure</Label>
                      {["Financier", "Performance", "Clients", "Affiliés", "Campagnes"].map((category) => {
                        const categoryMetrics = metricOptions.filter((m) => m.category === category)
                        return (
                          <div key={category} className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">{category}</Label>
                            <div className="grid grid-cols-3 gap-3">
                              {categoryMetrics.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={option.value}
                                    checked={reportConfig.selectedMetrics.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      setReportConfig((prev) => ({
                                        ...prev,
                                        selectedMetrics: checked
                                          ? [...prev.selectedMetrics, option.value]
                                          : prev.selectedMetrics.filter((m) => m !== option.value),
                                      }))
                                    }}
                                  />
                                  <Label htmlFor={option.value} className="cursor-pointer text-sm">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Période</Label>
                      <Select
                        value={reportConfig.datePreset}
                        onValueChange={(value) => setReportConfig((prev) => ({ ...prev, datePreset: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {datePresets.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {reportConfig.datePreset === "custom" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Date de début</Label>
                            <Input
                              type="date"
                              value={reportConfig.customStartDate}
                              onChange={(e) =>
                                setReportConfig((prev) => ({ ...prev, customStartDate: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Date de fin</Label>
                            <Input
                              type="date"
                              value={reportConfig.customEndDate}
                              onChange={(e) => setReportConfig((prev) => ({ ...prev, customEndDate: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Options d'export</Label>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Format</Label>
                          <Select
                            value={reportConfig.exportFormat}
                            onValueChange={(v) =>
                              setReportConfig((prev) => ({ ...prev, exportFormat: v as ExportFormat }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                              <SelectItem value="csv">CSV (.csv)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Grouper par</Label>
                          <Select
                            value={reportConfig.groupBy}
                            onValueChange={(v) => setReportConfig((prev) => ({ ...prev, groupBy: v as GroupBy }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun groupement</SelectItem>
                              <SelectItem value="am">Account Manager</SelectItem>
                              <SelectItem value="affiliate">Affilié</SelectItem>
                              <SelectItem value="campaign">Campagne</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeSummary"
                            checked={reportConfig.includeSummary}
                            onCheckedChange={(checked) =>
                              setReportConfig((prev) => ({ ...prev, includeSummary: !!checked }))
                            }
                          />
                          <Label htmlFor="includeSummary" className="cursor-pointer text-sm">
                            Inclure une feuille de résumé
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeCharts"
                            checked={reportConfig.includeCharts}
                            onCheckedChange={(checked) =>
                              setReportConfig((prev) => ({ ...prev, includeCharts: !!checked }))
                            }
                          />
                          <Label htmlFor="includeCharts" className="cursor-pointer text-sm">
                            Inclure des graphiques (Excel uniquement)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCustomReportOpen(false)
                      setEditingReport(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={editingReport ? handleSaveEditedReport : handleGenerateCustomReport}>
                    <Download className="w-4 h-4 mr-2" />
                    {editingReport ? "Enregistrer les modifications" : "Générer le rapport"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Planifier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Planifier un rapport automatique</DialogTitle>
                  <DialogDescription>Configurez l'envoi automatique de rapports par email</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Créez d'abord un rapport personnalisé, puis planifiez son envoi automatique.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setIsScheduleOpen(false)
                      setIsCustomReportOpen(true)
                    }}
                  >
                    Créer un rapport personnalisé
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comparison">Comparaison de périodes</TabsTrigger>
            <TabsTrigger value="scheduled">Rapports planifiés ({scheduledReports.length})</TabsTrigger>
            <TabsTrigger value="quick">Rapports rapides</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison : Ce mois vs Mois dernier</CardTitle>
                <CardDescription>Analyse comparative des performances entre les deux périodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {periodComparisons.map((comparison, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{comparison.metric}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Actuel: {comparison.current.toLocaleString("fr-FR")}</span>
                            <span>Précédent: {comparison.previous.toLocaleString("fr-FR")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {comparison.change > 0 ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                          <div className="text-right">
                            <p
                              className={`font-semibold ${comparison.change > 0 ? "text-emerald-600" : "text-red-600"}`}
                            >
                              {comparison.change > 0 ? "+" : ""}
                              {comparison.changePercent.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {comparison.change > 0 ? "+" : ""}
                              {comparison.change.toLocaleString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < periodComparisons.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun rapport planifié</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsScheduleOpen(true)}>
                    Créer un rapport planifié
                  </Button>
                </CardContent>
              </Card>
            ) : (
              scheduledReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {report.name}
                          <Badge variant={report.active ? "default" : "secondary"}>
                            {report.active ? "Actif" : "Inactif"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Fréquence:{" "}
                          {report.frequency === "daily"
                            ? "Quotidien"
                            : report.frequency === "weekly"
                              ? "Hebdomadaire"
                              : report.frequency === "monthly"
                                ? "Mensuel"
                                : "Trimestriel"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditScheduledReport(report)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setScheduledReports((prev) =>
                              prev.map((r) => (r.id === report.id ? { ...r, active: !r.active } : r)),
                            )
                            toast.success(report.active ? "Rapport mis en pause" : "Rapport activé")
                          }}
                        >
                          {report.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setScheduledReports((prev) => prev.filter((r) => r.id !== report.id))
                            toast.success("Rapport supprimé")
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-2">Configuration</p>
                        <div className="space-y-1">
                          <p>• AMs: {report.selectedAMs.length || "Tous"}</p>
                          <p>• Affiliés: {report.selectedAffiliates.length || "Tous"}</p>
                          <p>• Campagnes: {report.selectedCampaigns.length || "Toutes"}</p>
                          <p>• Clients: {report.selectedClients.length || "Tous"}</p>
                          <p>• Métriques: {report.selectedMetrics.length}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2">Planification</p>
                        <div className="space-y-1">
                          <p>• Destinataires: {report.recipients.length}</p>
                          <p>• Format: {report.exportFormat === "excel" ? "Excel" : "CSV"}</p>
                          <p>
                            • Groupé par:{" "}
                            {report.groupBy === "am"
                              ? "AM"
                              : report.groupBy === "affiliate"
                                ? "Affilié"
                                : report.groupBy === "campaign"
                                  ? "Campagne"
                                  : report.groupBy === "client"
                                    ? "Client"
                                    : "Aucun"}
                          </p>
                          <p>• Dernier envoi: {report.lastSent}</p>
                          <p>
                            • Prochain envoi: <span className="font-medium">{report.nextSend}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Rapport mensuel</CardTitle>
                  <CardDescription>Performance de l'équipe ce mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleQuickReport("monthly")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rapport trimestriel</CardTitle>
                  <CardDescription>Vue d'ensemble du trimestre</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleQuickReport("quarterly")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rapport annuel</CardTitle>
                  <CardDescription>Vue d'ensemble de l'année</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleQuickReport("yearly")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
