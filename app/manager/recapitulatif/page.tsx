"use client"

import { useState, useEffect } from "react"
import { getPlans } from "@/lib/supabase/queries/plans"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Search, CalendarIcon, CheckCircle2, Clock, Filter, X, Edit2, Copy } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function RecapitulatifPage() {
  const [allPlans, setAllPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [affiliateFilter, setAffiliateFilter] = useState("all")
  const [amFilter, setAmFilter] = useState("all")
  const [reattributedFilter, setReattributedFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editDate, setEditDate] = useState("")

  useEffect(() => {
    getPlans()
      .then((data) => {
        const validatedPlans = (data || [])
          .filter((plan) => plan.status === "approved")
          .map((plan) => ({
            id: plan.id,
            planName: plan.campaign_name || "Plan sans nom",
            client: plan.client?.name || "Client inconnu",
            affiliate: plan.affiliate?.name || "Affilié inconnu",
            affiliateSA: plan.affiliate?.account_number || "N/A",
            accountManager: plan.account_manager?.name || "AM inconnu",
            validatedDate: plan.updated_at || plan.created_at,
            depenseClient: plan.depense_client || 0,
            gainAffilié: plan.gains_affilie || plan.fixed_fee || 0,
            commission: plan.notre_marge || 0,
            commissionRate: plan.hdr_pct || 0,
            status: "validated" as const,
            reattributed: false,
            reattributedDate: null as string | null,
          }))

        console.log("[v0] Récapitulatif data from Supabase:", {
          total: data?.length,
          validated: validatedPlans.length,
        })

        setAllPlans(data || [])
        setPlans(validatedPlans)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading plans:", error)
        setIsLoading(false)
      })
  }, [])

  const clients = Array.from(new Set(plans.map((p) => p.client)))
  const affiliates = Array.from(new Set(plans.map((p) => p.affiliate)))
  const accountManagers = Array.from(new Set(plans.map((p) => p.accountManager)))

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.affiliate.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClient = clientFilter === "all" || plan.client === clientFilter
    const matchesAffiliate = affiliateFilter === "all" || plan.affiliate === affiliateFilter
    const matchesAM = amFilter === "all" || plan.accountManager === amFilter
    const matchesReattributed =
      reattributedFilter === "all" ||
      (reattributedFilter === "reattributed" && plan.reattributed) ||
      (reattributedFilter === "not_reattributed" && !plan.reattributed)

    const matchesDateRange =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(plan.validatedDate) >= dateRange.from && new Date(plan.validatedDate) <= dateRange.to)

    return matchesSearch && matchesClient && matchesAffiliate && matchesAM && matchesReattributed && matchesDateRange
  })

  // Calculate totals
  const totalAmount = filteredPlans.reduce((sum, plan) => sum + plan.depenseClient, 0) // Updated to use depenseClient
  const totalCommission = filteredPlans.reduce((sum, plan) => sum + plan.commission, 0)
  const reattributedCount = filteredPlans.filter((p) => p.reattributed).length
  const notReattributedCount = filteredPlans.filter((p) => !p.reattributed).length

  const handleMarkAsReattributed = (planIds: string[]) => {
    const today = format(new Date(), "yyyy-MM-dd")
    setPlans((prev) =>
      prev.map((plan) => (planIds.includes(plan.id) ? { ...plan, reattributed: true, reattributedDate: today } : plan)),
    )
    setSelectedPlans([])
    toast.success(`${planIds.length} plan(s) marqué(s) comme ré-attribué(s)`)
  }

  const handleUpdateReattributionDate = () => {
    if (!editingPlan || !editDate) return

    setPlans((prev) => prev.map((plan) => (plan.id === editingPlan ? { ...plan, reattributedDate: editDate } : plan)))

    toast.success("Date de ré-attribution mise à jour")
    setEditingPlan(null)
    setEditDate("")
  }

  const handleExportExcel = () => {
    const exportData = filteredPlans.map((plan) => ({
      "Nom du plan": plan.planName,
      Client: plan.client,
      Affilié: plan.affiliate,
      "SA Affilié": plan.affiliateSA,
      "Account Manager": plan.accountManager,
      "Date de validation": format(new Date(plan.validatedDate), "dd/MM/yyyy", { locale: fr }),
      "Dépense Client": `${plan.depenseClient}€`,
      "Gain Affilié": `${plan.gainAffilié}€`,
      "Notre Commission": `${plan.commission}€ (${plan.commissionRate}%)`,
      "Ré-attribué": plan.reattributed ? "Oui" : "Non",
      "Date ré-attribution": plan.reattributedDate
        ? format(new Date(plan.reattributedDate), "dd/MM/yyyy", { locale: fr })
        : "N/A",
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Récapitulatif")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `recapitulatif-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    link.click()

    toast.success("Export Excel généré avec succès")
  }

  const handleSelectAll = () => {
    if (selectedPlans.length === filteredPlans.length) {
      setSelectedPlans([])
    } else {
      setSelectedPlans(filteredPlans.map((p) => p.id))
    }
  }

  const activeFiltersCount =
    (clientFilter !== "all" ? 1 : 0) +
    (affiliateFilter !== "all" ? 1 : 0) +
    (amFilter !== "all" ? 1 : 0) +
    (reattributedFilter !== "all" ? 1 : 0) +
    (dateRange.from && dateRange.to ? 1 : 0)

  const clearFilters = () => {
    setClientFilter("all")
    setAffiliateFilter("all")
    setAmFilter("all")
    setReattributedFilter("all")
    setDateRange({ from: undefined, to: undefined })
  }

  const copySA = (sa: string) => {
    navigator.clipboard.writeText(sa)
    toast.success(`SA ${sa} copié dans le presse-papier`)
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Récapitulatif des Plans Validés</h1>
            <p className="text-muted-foreground mt-1">Suivi des plans validés et gestion des ré-attributions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredPlans.length}</div>
                <p className="text-xs text-muted-foreground">Plans validés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépense Totale Client</CardTitle>
                <span className="text-lg">€</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAmount.toLocaleString()}€</div>
                <p className="text-xs text-muted-foreground">Valeur totale dépensée par le client</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                <span className="text-lg">€</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCommission.toLocaleString()}€</div>
                <p className="text-xs text-muted-foreground">Total commissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ré-attributions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reattributedCount}/{filteredPlans.length}
                </div>
                <p className="text-xs text-muted-foreground">{notReattributedCount} en attente</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <CardTitle>Filtres</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">
                      {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Export */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un plan, client, affilié..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Filter Dropdowns */}
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

                <Select value={reattributedFilter} onValueChange={setReattributedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="reattributed">Ré-attribué</SelectItem>
                    <SelectItem value="not_reattributed">En attente</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`
                        : "Période"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      locale={fr}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedPlans.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">
                  {selectedPlans.length} plan{selectedPlans.length > 1 ? "s" : ""} sélectionné
                  {selectedPlans.length > 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsReattributed(selectedPlans)}
                    disabled={selectedPlans.every((id) => plans.find((p) => p.id === id)?.reattributed)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marquer comme ré-attribué
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedPlans([])}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plans Validés</CardTitle>
                  <CardDescription>{filteredPlans.length} plan(s) affiché(s)</CardDescription>
                </div>
                <Checkbox
                  checked={selectedPlans.length === filteredPlans.length && filteredPlans.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left side - Plan info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPlans([...selectedPlans, plan.id])
                          } else {
                            setSelectedPlans(selectedPlans.filter((id) => id !== plan.id))
                          }
                        }}
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{plan.planName}</h3>
                          {plan.reattributed ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Ré-attribué
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            <span className="font-medium">{plan.client}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {plan.affiliate}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-2 ml-2 text-xs gap-1"
                                onClick={() => copySA(plan.affiliateSA)}
                              >
                                <span className="font-mono">{plan.affiliateSA}</span>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </span>
                          </div>
                          <div>
                            <span>AM: {plan.accountManager}</span>
                            <span className="mx-2">•</span>
                            <span>Validé le {format(new Date(plan.validatedDate), "dd/MM/yyyy", { locale: fr })}</span>
                          </div>
                          {plan.reattributed && plan.reattributedDate && (
                            <div className="text-xs text-green-600">
                              Ré-attribué le {format(new Date(plan.reattributedDate), "dd/MM/yyyy", { locale: fr })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Financial breakdown */}
                    <div className="grid grid-cols-3 gap-4 lg:gap-6">
                      <div className="text-center p-3 rounded-lg bg-muted/30 border">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Dépense Client</div>
                        <div className="text-lg font-bold">{plan.depenseClient.toLocaleString()}€</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30 border">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Gain Affilié</div>
                        <div className="text-lg font-bold text-green-700">{plan.gainAffilié.toLocaleString()}€</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30 border border-primary/20">
                        <div className="text-xs text-primary/70 font-medium mb-1">Notre Commission</div>
                        <div className="text-lg font-bold text-primary">{plan.commission.toLocaleString()}€</div>
                        <div className="text-xs text-muted-foreground mt-0.5">({plan.commissionRate}%)</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      {!plan.reattributed && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsReattributed([plan.id])}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Ré-attribuer
                        </Button>
                      )}
                      {plan.reattributed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPlan(plan.id)
                            setEditDate(plan.reattributedDate || "")
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Modifier date
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredPlans.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Aucun plan validé trouvé</div>
              )}
            </CardContent>
          </Card>

          {/* Dialog for editing reattribution date */}
          <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier la date de ré-attribution</DialogTitle>
                <DialogDescription>Modifiez la date à laquelle le plan a été ré-attribué</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reattribution-date">Date de ré-attribution</Label>
                  <Input
                    id="reattribution-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateReattributionDate}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  )
}
