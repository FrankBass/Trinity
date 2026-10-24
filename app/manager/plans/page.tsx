"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Check,
  XIcon,
  Filter,
  CalendarIcon,
  Lock,
  ChevronsUpDown,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import * as XLSX from "xlsx"
import { SendMessageButton } from "@/components/messaging/send-message-button"
import { getPlans } from "@/lib/supabase/queries/plans"
import { formatCurrency } from "@/lib/utils"
import { calculateClientExpense, calculateOurCommission } from "@/lib/supabase/queries/stats"

export default function ManagerPlansPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("pending")
  const [clientFilter, setClientFilter] = useState<string[]>([])
  const [amFilter, setAmFilter] = useState<string[]>([])
  const [affiliateFilter, setAffiliateFilter] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<"validate" | "reject" | null>(null)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [amOpen, setAmOpen] = useState(false)
  const [affiliateOpen, setAffiliateOpen] = useState(false)

  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const plansData = await getPlans()

        const formattedPlans = plansData.map((plan: any) => {
          const gainsAffilié = plan.fixed_fee
          const notreMarge = calculateOurCommission(plan)
          const depenseClient = calculateClientExpense(plan)
          const commissionPct = plan.hdr_pct

          const createdDate = new Date(plan.created_at)
          const today = new Date()
          const daysWaiting =
            plan.status === "pending"
              ? Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0

          return {
            id: plan.id,
            client: plan.client?.name || "Unknown",
            affiliate: plan.affiliate?.name || "Unknown",
            campaign: plan.campaign_name || "Unknown",
            campaignDates: plan.start_date && plan.end_date ? `${plan.start_date} - ${plan.end_date}` : "",
            am: plan.account_manager?.name || "Unknown",
            depenseClient: depenseClient,
            gainsAffilié: gainsAffilié,
            marge: notreMarge,
            commissionPct: commissionPct,
            status: plan.status,
            date: plan.created_at,
            daysWaiting,
            campaignStatus: new Date(plan.end_date) < new Date() ? "completed" : "active",
          }
        })

        setPlans(formattedPlans)
      } catch (error) {
        console.error("[v0] Error loading plans:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les plans depuis la base de données.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const uniqueClients = Array.from(new Set(plans.map((p) => p.client))).sort()
  const uniqueAMs = Array.from(new Set(plans.map((p) => p.am))).sort()
  const uniqueAffiliates = Array.from(new Set(plans.map((p) => p.affiliate))).sort()

  const isCampaignEnded = (campaignStatus: string): boolean => {
    return campaignStatus === "completed"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
    }
  }

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.affiliate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.am.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    const matchesClient = clientFilter.length === 0 || clientFilter.includes(plan.client)
    const matchesAM = amFilter.length === 0 || amFilter.includes(plan.am)
    const matchesAffiliate = affiliateFilter.length === 0 || affiliateFilter.includes(plan.affiliate)

    let matchesDateRange = true
    if (dateRange?.from) {
      const planDate = new Date(plan.date)
      if (dateRange.from && planDate < dateRange.from) matchesDateRange = false
      if (dateRange.to && planDate > dateRange.to) matchesDateRange = false
    }

    return matchesSearch && matchesStatus && matchesClient && matchesAM && matchesAffiliate && matchesDateRange
  })

  const pendingCount = plans.filter((p) => p.status === "pending").length
  const approvedCount = plans.filter((p) => p.status === "approved").length
  const rejectedCount = plans.filter((p) => p.status === "rejected").length
  const avgWaitTime =
    plans.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.daysWaiting, 0) / pendingCount || 0

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) => (prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]))
  }

  const toggleSelectAll = () => {
    if (selectedPlans.length === filteredPlans.length) {
      setSelectedPlans([])
    } else {
      setSelectedPlans(filteredPlans.map((p) => p.id))
    }
  }

  const handleBulkAction = (action: "validate" | "reject") => {
    setBulkAction(action)
    setShowBulkConfirm(true)
  }

  const confirmBulkAction = () => {
    const newStatus = bulkAction === "validate" ? "approved" : "rejected"
    const actionText = bulkAction === "validate" ? "validés" : "rejetés"

    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        selectedPlans.includes(plan.id) ? { ...plan, status: newStatus, daysWaiting: 0 } : plan,
      ),
    )

    toast({
      title: `Plans ${actionText}`,
      description: `${selectedPlans.length} plan(s) ont été ${actionText} avec succès.`,
    })

    setSelectedPlans([])
    setShowBulkConfirm(false)
    setBulkAction(null)
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    const wsData = [
      ["RAPPORT D'EXPORT DES PLANS"],
      [],
      ["Informations générales"],
      [`Date d'export`, new Date().toLocaleDateString("fr-FR", { dateStyle: "full" })],
      [`Nombre de plans exportés`, filteredPlans.length],
      [
        `Filtre de statut`,
        statusFilter === "all"
          ? "Tous"
          : statusFilter === "pending"
            ? "En attente"
            : statusFilter === "approved"
              ? "Approuvés"
              : "Rejetés",
      ],
      [],
      ["DÉTAILS DES PLANS"],
      [
        "ID",
        "Client",
        "Affilié",
        "Campagne",
        "Dates Campagne",
        "Account Manager",
        "Dépense Client",
        "Gains Affilié",
        "Notre Marge",
        "Commission",
        "Statut",
        "Date Création",
        "Jours d'attente",
      ],
      ...filteredPlans.map((plan) => [
        plan.id,
        plan.client,
        plan.affiliate,
        plan.campaign,
        plan.campaignDates,
        plan.am,
        plan.depenseClient,
        plan.gainsAffilié,
        plan.marge,
        plan.commissionPct,
        plan.status === "approved" ? "Approuvé" : plan.status === "rejected" ? "Rejeté" : "En attente",
        new Date(plan.date).toLocaleDateString("fr-FR"),
        plan.status === "pending" ? plan.daysWaiting : "-",
      ]),
      [],
      ["STATISTIQUES"],
      ["Total plans", plans.length],
      ["Plans en attente", pendingCount],
      ["Plans approuvés", approvedCount],
      ["Plans rejetés", rejectedCount],
      ["Délai moyen d'attente", `${avgWaitTime.toFixed(1)} jours`],
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 22 },
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Plans")
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `plans_export_${new Date().toISOString().split("T")[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Client",
      "Affilié",
      "Campagne",
      "Dates Campagne",
      "Account Manager",
      "Dépense Client",
      "Gains Affilié",
      "Notre Marge",
      "Commission",
      "Statut",
      "Date Création",
      "Jours d'attente",
    ]
    const rows = filteredPlans.map((plan) => [
      plan.id,
      plan.client,
      plan.affiliate,
      plan.campaign,
      plan.campaignDates,
      plan.am,
      plan.depenseClient,
      plan.gainsAffilié,
      plan.marge,
      plan.commissionPct,
      plan.status === "approved" ? "Approuvé" : plan.status === "rejected" ? "Rejeté" : "En attente",
      plan.date,
      plan.daysWaiting,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `plans_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setStatusFilter("pending")
    setClientFilter([])
    setAmFilter([])
    setAffiliateFilter([])
    setSearchQuery("")
    setDateRange(undefined)
  }

  const activeFiltersCount = [
    statusFilter !== "pending" ? 1 : 0,
    clientFilter.length > 0 ? 1 : 0,
    amFilter.length > 0 ? 1 : 0,
    affiliateFilter.length > 0 ? 1 : 0,
    dateRange?.from ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const setDateRangePreset = (preset: string) => {
    const today = new Date()
    switch (preset) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "week":
        setDateRange({ from: startOfWeek(today, { locale: fr }), to: endOfWeek(today, { locale: fr }) })
        break
      case "month":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
      case "lastMonth":
        const lastMonth = subMonths(today, 1)
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
        break
      case "clear":
        setDateRange(undefined)
        break
    }
  }

  const autoRejectExpiredPlans = () => {
    const updatedPlans = plans.map((plan) => {
      const campaignEnded = isCampaignEnded(plan.campaignStatus)
      if (campaignEnded && plan.status === "pending") {
        return { ...plan, status: "rejected", daysWaiting: 0 }
      }
      return plan
    })

    const rejectedCount = updatedPlans.filter(
      (plan, index) => plan.status === "rejected" && plans[index].status === "pending",
    ).length

    if (rejectedCount > 0) {
      setPlans(updatedPlans)
      toast({
        title: "Plans expirés rejetés automatiquement",
        description: `${rejectedCount} plan(s) en attente avec campagne terminée ont été rejetés.`,
        variant: "default",
      })
    }
  }

  useEffect(() => {
    autoRejectExpiredPlans()
  }, [plans, toast]) // Added plans and toast to dependency array

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Plans</h1>
            <p className="text-muted-foreground">Validez et gérez tous les plans d'action</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToExcel}>
                <FileText className="w-4 h-4 mr-2" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="w-4 h-4 mr-2" />
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Délai moyen: {avgWaitTime.toFixed(0)} jours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground">Tous les plans</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Chargement des plans...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Liste des plans</CardTitle>
                    <CardDescription>
                      {selectedPlans.length > 0
                        ? `${selectedPlans.length} plan(s) sélectionné(s)`
                        : `${filteredPlans.length} plan(s) affiché(s)`}
                    </CardDescription>
                  </div>
                  {selectedPlans.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 bg-transparent"
                        onClick={() => handleBulkAction("validate")}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Valider ({selectedPlans.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleBulkAction("reject")}
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        Rejeter ({selectedPlans.length})
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Filtres</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
                        Réinitialiser
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvés</SelectItem>
                        <SelectItem value="rejected">Rejetés</SelectItem>
                      </SelectContent>
                    </Select>

                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="h-9 justify-between bg-background hover:bg-accent"
                        >
                          <span className="truncate">
                            {clientFilter.length > 0 ? `${clientFilter.length} client(s)` : "Clients"}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            {clientFilter.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setClientFilter([])
                                }}
                                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher..." />
                          <CommandList>
                            <CommandEmpty>Aucun client trouvé</CommandEmpty>
                            <CommandGroup>
                              {uniqueClients.map((client) => (
                                <CommandItem
                                  key={client}
                                  onSelect={() => {
                                    setClientFilter((prev) =>
                                      prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client],
                                    )
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Checkbox checked={clientFilter.includes(client)} className="mr-2" />
                                  <span className="flex-1">{client}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Popover open={amOpen} onOpenChange={setAmOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="h-9 justify-between bg-background hover:bg-accent"
                        >
                          <span className="truncate">
                            {amFilter.length > 0 ? `${amFilter.length} AM(s)` : "Account Managers"}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            {amFilter.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAmFilter([])
                                }}
                                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher..." />
                          <CommandList>
                            <CommandEmpty>Aucun AM trouvé</CommandEmpty>
                            <CommandGroup>
                              {uniqueAMs.map((am) => (
                                <CommandItem
                                  key={am}
                                  onSelect={() => {
                                    setAmFilter((prev) =>
                                      prev.includes(am) ? prev.filter((a) => a !== am) : [...prev, am],
                                    )
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Checkbox checked={amFilter.includes(am)} className="mr-2" />
                                  <span className="flex-1">{am}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Popover open={affiliateOpen} onOpenChange={setAffiliateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="h-9 justify-between bg-background hover:bg-accent"
                        >
                          <span className="truncate">
                            {affiliateFilter.length > 0 ? `${affiliateFilter.length} affilié(s)` : "Affiliés"}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            {affiliateFilter.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAffiliateFilter([])
                                }}
                                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher..." />
                          <CommandList>
                            <CommandEmpty>Aucun affilié trouvé</CommandEmpty>
                            <CommandGroup>
                              {uniqueAffiliates.map((affiliate) => (
                                <CommandItem
                                  key={affiliate}
                                  onSelect={() => {
                                    setAffiliateFilter((prev) =>
                                      prev.includes(affiliate)
                                        ? prev.filter((a) => a !== affiliate)
                                        : [...prev, affiliate],
                                    )
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Checkbox checked={affiliateFilter.includes(affiliate)} className="mr-2" />
                                  <span className="flex-1">{affiliate}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-9 justify-between bg-background hover:bg-accent",
                            !dateRange && "text-muted-foreground",
                          )}
                        >
                          <div className="flex items-center truncate">
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "dd MMM", { locale: fr })} -{" "}
                                    {format(dateRange.to, "dd MMM", { locale: fr })}
                                  </>
                                ) : (
                                  format(dateRange.from, "dd MMM", { locale: fr })
                                )
                              ) : (
                                "Période"
                              )}
                            </span>
                          </div>
                          {dateRange && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDateRange(undefined)
                              }}
                              className="hover:bg-muted rounded-sm p-0.5 ml-1 transition-colors"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex flex-col">
                          <div className="flex gap-1 p-2 border-b flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setDateRangePreset("today")}
                            >
                              Aujourd'hui
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setDateRangePreset("week")}
                            >
                              Cette semaine
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setDateRangePreset("month")}
                            >
                              Ce mois
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setDateRangePreset("lastMonth")}
                            >
                              Mois dernier
                            </Button>
                          </div>
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            locale={fr}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPlans.length > 0 && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Checkbox
                    id="select-all"
                    checked={selectedPlans.length === filteredPlans.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Tout sélectionner
                  </label>
                </div>
              )}
              <div className="space-y-3">
                {filteredPlans.map((plan) => {
                  const campaignEnded = isCampaignEnded(plan.campaignStatus)

                  return (
                    <div
                      key={plan.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onCheckedChange={() => togglePlanSelection(plan.id)}
                        disabled={campaignEnded}
                      />
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-4 flex-1">
                          {campaignEnded && (
                            <Lock
                              className="w-5 h-5 text-muted-foreground"
                              title="Campagne terminée - modification impossible"
                            />
                          )}
                          {plan.daysWaiting > 7 && !campaignEnded && (
                            <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" title="Délai dépassé" />
                          )}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{plan.client}</p>
                              {getStatusBadge(plan.status)}
                              {campaignEnded && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Campagne terminée
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>
                                Campagne: <span className="font-medium text-foreground">{plan.campaign}</span>
                              </span>
                              <span>Dates: {plan.campaignDates}</span>
                              <span>Affilié: {plan.affiliate}</span>
                              <span>AM: {plan.am}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Dépense Client</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(plan.depenseClient)}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Gains Affilié:{" "}
                              <span className="font-semibold text-purple-600">{formatCurrency(plan.gainsAffilié)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Notre Marge:{" "}
                              <span className="font-semibold text-emerald-600">{formatCurrency(plan.marge)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Commission: {plan.commissionPct.toFixed(0)}%
                            </p>
                            {plan.status === "pending" && !campaignEnded && (
                              <p className="text-xs text-amber-600 mt-1">{plan.daysWaiting} jours d'attente</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/manager/plans/${plan.id}`}>Voir détails</Link>
                            </Button>
                            <SendMessageButton
                              recipientId={plan.id.toString()}
                              recipientName={plan.am}
                              recipientRole="Account Manager"
                              context={`Plan ${plan.campaign} - ${plan.client}`}
                              contextLink={`/manager/plans/${plan.id}`}
                              variant="outline"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredPlans.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Aucun plan trouvé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Essayez de modifier vos filtres pour voir plus de résultats
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "validate" ? "Valider les plans sélectionnés ?" : "Rejeter les plans sélectionnés ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de {bulkAction === "validate" ? "valider" : "rejeter"} {selectedPlans.length}{" "}
              plan(s). Cette action mettra à jour le statut des plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkAction === "validate" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
