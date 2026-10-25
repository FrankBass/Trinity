"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getCampaignWithDetails } from "@/lib/supabase/queries/campaigns"
import { getAffiliates } from "@/lib/supabase/queries/affiliates"
import { createPlan } from "@/lib/supabase/queries/plans"
import { CheckCircle, Clock, ArrowLeft } from "lucide-react"

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { id } = params
  const [campaignData, setCampaignData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableAffiliates, setAvailableAffiliates] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([])
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    startDate: "",
    endDate: "",
    budget: "",
    commission: "",
    objectives: "",
    mechanics: "",
    notes: "",
  })

  useEffect(() => {
    async function loadCampaign() {
      try {
        console.log("[v0] Loading campaign with ID:", id)
        const data = await getCampaignWithDetails(id)

        if (!data) {
          setError("Campagne introuvable ou nom invalide")
          setLoading(false)
          return
        }

        setCampaignData(data)
        console.log(`[v0] Loaded Campaign from Supabase: ${data.name} with ${data.plans?.length || 0} plans`)

        try {
          const affiliatesList = await getAffiliates()
          setAvailableAffiliates(Array.isArray(affiliatesList) ? affiliatesList : [])
        } catch (err) {
          console.error("[v0] Error loading affiliates:", err)
          setAvailableAffiliates([])
        }
      } catch (err) {
        console.error("[v0] Error loading campaign:", err)
        setError("Erreur lors du chargement de la campagne")
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCampaignId = Math.floor(Math.random() * 1000) + 1
    console.log("[v0] Création campagne, redirection vers:", `/manager/campaigns/${newCampaignId}`)

    toast({
      title: "Campagne créée",
      description: `${formData.name} a été créée avec succès.`,
    })

    router.push(`/manager/campaigns/${newCampaignId}`)
  }

  const handleSave = () => {
    toast({
      title: "Modifications enregistrées",
      description: "La campagne a été mise à jour avec succès.",
    })
    setIsEditing(false)
  }

  const handleAssignAffiliates = () => {
    toast({
      title: "Affiliés assignés",
      description: `${selectedAffiliates.length} affilié(s) ont été assignés à la campagne.`,
    })
    setIsAssignDialogOpen(false)
    setSelectedAffiliates([])
  }

  const handleCreatePlan = async () => {
    if (!campaignData) return

    setIsCreatingPlan(true)
    try {
      const result = await createPlan({
        campaign_name: campaignData.name,
        client_id: campaignData.client_id || "",
        affiliate_id: "",
        account_manager_id: "",
        start_date: campaignData.startDate || "",
        end_date: campaignData.endDate || "",
        fixed_fee: 0,
        hdr_pct: 0,
        status: "pending",
      })

      if (result.success && result.data) {
        toast({
          title: "Plan créé",
          description: "Le nouveau plan a été créé avec succès.",
        })
        // Reload the page to show the new plan
        window.location.reload()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de créer le plan.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Error creating plan:", err)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du plan.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingPlan(false)
    }
  }

  const toggleAffiliateSelection = (affiliateId: string) => {
    setSelectedAffiliates((prev) =>
      prev.includes(affiliateId) ? prev.filter((id) => id !== affiliateId) : [...prev, affiliateId],
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "planned":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Planifiée
          </Badge>
        )
      case "completed":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Terminée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        )
      case "pending_client":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h2 className="text-2xl font-bold">Chargement...</h2>
          <p className="text-muted-foreground">Récupération des données de la campagne</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !campaignData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h2 className="text-2xl font-bold">Campagne introuvable</h2>
          <p className="text-muted-foreground">
            {error || "La campagne demandée n'existe pas ou le nom est invalide."}
          </p>
          <Button onClick={() => router.push("/manager/campaigns")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux campagnes
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const plans = campaignData.plans.map((plan: any) => {
    return {
      id: plan.id,
      campaignName: campaignData.name,
      campaignDates: `${campaignData.startDate} - ${campaignData.endDate}`,
      client: plan.client?.name || "",
      affiliate: plan.affiliate?.name || "",
      am: plan.account_manager?.name || "",
      status: plan.status === "approved" ? "approved" : "pending_client",
      fixedFee: `${plan.fixed_fee || 0}€`,
      hdr: plan.hdr_pct ? `+${plan.hdr_pct}%` : null,
      commission: `${campaignData.calculateOurCommission(plan)}€`,
      totalClient: `${campaignData.calculateClientExpense(plan)}€`,
      createdAt: plan.submitted_date || plan.created_at,
    }
  })

  const affiliates = Array.from(new Set(plans.map((p: any) => p.affiliate))).map((affiliateName, index) => {
    const affiliatePlans = plans.filter((p: any) => p.affiliate === affiliateName && p.status === "approved")
    return {
      id: index + 1,
      name: affiliateName,
      plans: affiliatePlans.length,
      status: "active",
    }
  })

  const approvedPlans = plans.filter((p: any) => p.status === "approved")
  const totalDepense = approvedPlans.reduce(
    (sum: number, p: any) => sum + Number.parseInt(p.totalClient.replace(/[€]/g, "")),
    0,
  )
  const totalMarge = approvedPlans.reduce(
    (sum: number, p: any) => sum + Number.parseInt(p.commission.replace(/[€]/g, "")),
    0,
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaignData?.name}</h1>
              <p className="text-muted-foreground">Client: {campaignData?.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaignData && getStatusBadge(campaignData.status)}
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans totaux</CardTitle>
              <ArrowLeft className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground">{approvedPlans.length} validés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliés actifs</CardTitle>
              <ArrowLeft className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliates.length}</div>
              <p className="text-xs text-muted-foreground">Plans validés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépense Client</CardTitle>
              <ArrowLeft className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDepense}€</div>
              <p className="text-xs text-muted-foreground">Plans validés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marge Brute (MB)</CardTitle>
              <ArrowLeft className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMarge}€</div>
              <p className="text-xs text-muted-foreground">Commission {campaignData?.commission}%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="plans">Plans ({plans.length})</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliés ({affiliates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la campagne</CardTitle>
                <CardDescription>Informations et paramètres de l'opération commerciale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la campagne</Label>
                      <Input
                        id="name"
                        value={campaignData?.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={campaignData?.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Date de fin</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={campaignData?.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget (€)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={campaignData?.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commission">Notre commission (%)</Label>
                        <Input
                          id="commission"
                          type="number"
                          value={campaignData?.commission}
                          onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objectives">Objectifs</Label>
                      <Textarea
                        id="objectives"
                        value={campaignData?.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mechanics">Mécaniques</Label>
                      <Textarea
                        id="mechanics"
                        value={campaignData?.mechanics}
                        onChange={(e) => setFormData({ ...formData, mechanics: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={campaignData?.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Nom de la campagne</p>
                            <p className="font-semibold">{campaignData?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Période</p>
                            <p className="font-semibold">
                              {campaignData?.startDate} → {campaignData?.endDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Budget</p>
                            <p className="font-semibold">{campaignData?.budget}€</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Notre commission</p>
                            <p className="font-semibold">{campaignData?.commission}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Objectifs</p>
                      <p className="text-base">{campaignData?.objectives}</p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Mécaniques prévues</p>
                      <p className="text-base">{campaignData?.mechanics}</p>
                    </div>

                    {campaignData?.notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                          <p className="text-base italic">{campaignData?.notes}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plans de la campagne</CardTitle>
                <CardDescription>Tous les plans soumis pour cette opération</CardDescription>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Aucun plan pour cette campagne</h3>
                      <p className="text-sm text-muted-foreground">
                        Créez un nouveau plan pour commencer à travailler sur cette campagne.
                      </p>
                    </div>
                    <Button onClick={handleCreatePlan} disabled={isCreatingPlan} className="mt-4">
                      {isCreatingPlan ? "Création..." : "Créer un plan"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <Link key={plan.id} href={`/manager/plans/${plan.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{plan.affiliate}</p>
                              {getPlanStatusBadge(plan.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>Campagne: {plan.campaignName}</span>
                              <span>Client: {plan.client}</span>
                              <span>Dates: {plan.campaignDates}</span>
                              <span>AM: {plan.am}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Créé le {plan.createdAt}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Frais Fixe</p>
                              <p className="font-semibold">{plan.fixedFee}</p>
                            </div>
                            {plan.hdr && (
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">HDR</p>
                                <p className="font-semibold text-blue-600">{plan.hdr}</p>
                              </div>
                            )}
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Dépense Client</p>
                              <p className="font-semibold text-purple-600">{plan.totalClient}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Marge</p>
                              <p className="font-semibold text-emerald-600">{plan.commission}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Affiliés actifs</CardTitle>
                    <CardDescription>Partenaires avec plans validés pour cette campagne</CardDescription>
                  </div>
                  <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Assigner des affiliés
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Assigner des affiliés à la campagne</DialogTitle>
                        <DialogDescription>
                          Sélectionnez les affiliés que vous souhaitez assigner à cette campagne
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {availableAffiliates.map((affiliate) => (
                          <div
                            key={affiliate.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`affiliate-${affiliate.id}`}
                                checked={selectedAffiliates.includes(affiliate.id.toString())}
                                onCheckedChange={() => toggleAffiliateSelection(affiliate.id.toString())}
                              />
                              <div>
                                <label
                                  htmlFor={`affiliate-${affiliate.id}`}
                                  className="font-medium cursor-pointer flex items-center gap-2"
                                >
                                  {affiliate.name}
                                </label>
                                <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAssignAffiliates}
                          disabled={selectedAffiliates.length === 0}
                          className="flex-1"
                        >
                          Assigner {selectedAffiliates.length > 0 && `(${selectedAffiliates.length})`}
                        </Button>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                          Annuler
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {affiliates.map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <ArrowLeft className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{affiliate.name}</p>
                          <p className="text-sm text-muted-foreground">{affiliate.plans} plan(s) validé(s)</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {affiliate.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
