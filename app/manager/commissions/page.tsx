"use client"

import { useEffect, useState } from "react"
import { getPlans } from "@/lib/supabase/queries/plans"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, Search, CalendarIcon, TrendingUp, TrendingDown, DollarSign, Users, User, Copy } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"
import { SendMessageButton } from "@/components/messaging/send-message-button"

export default function CommissionsPage() {
  const [viewMode, setViewMode] = useState<"affiliate" | "am">("affiliate")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [affiliateFilter, setAffiliateFilter] = useState("all")
  const [amFilter, setAmFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const { toast } = useToast()

  const [allPlans, setAllPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const plansData = await getPlans()
        setAllPlans(plansData)
        console.log("[v0] Commissions data from Supabase:", {
          plans: plansData?.length,
        })
      } catch (error) {
        console.error("[v0] Error loading commissions data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Build commissions from approved plans
  const commissions = (allPlans || [])
    .filter((plan) => plan.status === "approved")
    .map((plan) => ({
      id: plan.id,
      entityName: plan.affiliate?.name || "Affilié inconnu",
      entityType: "affiliate" as const,
      sa: plan.affiliate?.account_number || null,
      campaign: plan.campaign_name || "Campagne inconnue",
      client: plan.client?.name || "Client inconnu",
      am: plan.account_manager?.name || "AM inconnu",
      depenseClient: plan.depense_client || 0,
      gainAffilié: plan.gains_affilie || plan.fixed_fee || 0,
      commission: plan.notre_marge || 0,
      commissionRate: plan.hdr_pct || 0,
      status: "validated" as const,
      validatedDate: plan.updated_at || plan.created_at,
      period: new Date(plan.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    }))

  console.log("[v0] Commissions calculated:", {
    commissions: commissions.length,
  })

  const clients = Array.from(new Set(commissions.map((c) => c.client)))
  const affiliates = Array.from(
    new Set(commissions.filter((c) => c.entityType === "affiliate").map((c) => c.entityName)),
  )
  const accountManagers = Array.from(new Set(commissions.map((c) => c.am)))

  const filteredCommissions = commissions.filter((commission) => {
    if (viewMode === "affiliate" && commission.entityType !== "affiliate") return false
    if (viewMode === "am" && commission.entityType !== "am") return false
    if (statusFilter !== "all" && commission.status !== statusFilter) return false
    if (clientFilter !== "all" && commission.client !== clientFilter) return false
    if (affiliateFilter !== "all" && commission.entityName !== affiliateFilter) return false
    if (amFilter !== "all" && commission.am !== amFilter) return false
    if (searchQuery && !commission.entityName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commission, 0)
  const validatedCommissions = filteredCommissions
    .filter((c) => c.status === "validated")
    .reduce((sum, c) => sum + c.commission, 0)
  const pendingCommissions = filteredCommissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commission, 0)

  const handleExport = () => {
    const exportData = filteredCommissions.map((c) => ({
      Entité: c.entityName,
      Type: c.entityType === "affiliate" ? "Affilié" : "Account Manager",
      SA: c.sa || "N/A",
      Campagne: c.campaign,
      Client: c.client,
      "Dépense Client": `${c.depenseClient}€`,
      "Gain Affilié": `${c.gainAffilié}€`,
      "Notre Commission": `${c.commission}€ (${c.commissionRate}%)`,
      Statut: c.status === "validated" ? "Validé" : "En attente",
      "Date validation": c.validatedDate || "N/A",
      Période: c.period,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Commissions")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `commissions-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    link.click()

    toast({
      title: "Export réussi",
      description: "Le fichier Excel a été téléchargé avec succès.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Validé</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const copySA = (sa: string) => {
    navigator.clipboard.writeText(sa)
    toast({
      title: "SA copié",
      description: `Le numéro ${sa} a été copié dans le presse-papier.`,
    })
  }

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Suivi des Commissions</h1>
          <p className="text-muted-foreground mt-1">Gérez et suivez les commissions des affiliés et account managers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCommissions.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground mt-1">Toutes périodes confondues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions Validées</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{validatedCommissions.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredCommissions.filter((c) => c.status === "validated").length} validations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCommissions.toLocaleString()}€</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredCommissions.filter((c) => c.status === "pending").length} en attente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "affiliate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("affiliate")}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Affiliés
                </Button>
                <Button
                  variant={viewMode === "am" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("am")}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Account Managers
                </Button>
              </div>

              {/* Search and Export */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {viewMode === "affiliate" && (
                  <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Affilié" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les affiliés</SelectItem>
                      {affiliates.map((affiliate) => (
                        <SelectItem key={affiliate} value={affiliate}>
                          {affiliate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={amFilter} onValueChange={setAmFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les AMs</SelectItem>
                    {accountManagers.map((am) => (
                      <SelectItem key={am} value={am}>
                        {am}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <CalendarIcon className="h-4 w-4" />
                      Période
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commissions</CardTitle>
            <CardDescription>{filteredCommissions.length} commission(s) affichée(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCommissions.map((commission) => (
                <div key={commission.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left side - Entity info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-lg">{commission.entityName}</p>
                        {commission.sa && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs gap-1 bg-transparent"
                            onClick={() => copySA(commission.sa!)}
                          >
                            <span className="font-mono">{commission.sa}</span>
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        {getStatusBadge(commission.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">{commission.campaign}</span>
                          <span className="mx-2">•</span>
                          <span>{commission.client}</span>
                        </div>
                        {commission.entityType === "affiliate" && (
                          <div>
                            <span>AM: {commission.am}</span>
                            <span className="mx-2">•</span>
                            <span>{commission.period}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Financial info */}
                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-3 gap-4 lg:gap-6">
                        <div className="text-center p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground font-medium mb-1">Dépense Client</div>
                          <div className="text-lg font-bold">{commission.depenseClient.toLocaleString()}€</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30 border">
                          <div className="text-xs text-muted-foreground font-medium mb-1">Gain Affilié</div>
                          <div className="text-lg font-bold text-green-700">
                            {commission.gainAffilié.toLocaleString()}€
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30 border border-primary/20">
                          <div className="text-xs text-primary/70 font-medium mb-1">Notre Commission</div>
                          <div className="text-lg font-bold text-primary">
                            {commission.commission.toLocaleString()}€
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">({commission.commissionRate}%)</div>
                        </div>
                      </div>
                      {commission.entityType === "affiliate" && (
                        <SendMessageButton
                          recipientId={commission.entityName}
                          recipientName={commission.entityName}
                          recipientRole="Affilié"
                          context={`Commission ${commission.campaign} - ${commission.client}`}
                          contextLink="/manager/commissions"
                          variant="outline"
                          size="sm"
                        />
                      )}
                    </div>
                  </div>

                  {commission.validatedDate && (
                    <div className="mt-3 pt-3 border-t text-xs text-green-600">
                      Validé le {commission.validatedDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
