"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getClientWithDetails } from "@/lib/supabase/queries/clients"
import { formatCurrency } from "@/lib/utils"

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      if (!isValidUUID(clientId)) {
        console.error("[v0] Invalid UUID detected:", clientId)
        setLoading(false)
        setClientData(null)
        return
      }

      setLoading(true)

      const result = await getClientWithDetails(clientId)

      if (result) {
        const { client, campaigns: clientCampaigns, plans: clientPlans } = result

        setClientData({
          id: client.id,
          name: client.name,
          contactName: client.name,
          email: client.email,
          phone: client.phone,
          industry: client.industry || "Mode",
          commission: 20,
          am: client.account_manager?.name || "",
          amId: client.account_manager_id,
          createdAt: client.join_date,
          status: client.status,
        })

        setCampaigns(
          clientCampaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            budget: formatCurrency(campaign.budget),
            status: campaign.status,
            plansCount: campaign.plansCount,
            approvedPlans: campaign.approvedPlans,
          })),
        )

        setPlans(clientPlans || [])
        console.log(`[v0] Loaded Client from Supabase: ${client.name} with ${clientPlans?.length || 0} plans`)
      }

      setLoading(false)
    }

    loadData()
  }, [clientId])

  const getCampaignStatusBadge = (status: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSave = () => {
    toast({
      title: "Modifications enregistrées",
      description: "Les informations du client ont été mises à jour.",
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-muted-foreground">Chargement des détails du client...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!clientData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">Client non trouvé ou ID invalide</p>
            <Button onClick={() => router.push("/manager/clients")}>Retour à la liste</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{clientData?.name}</h1>
              <p className="text-muted-foreground">Géré par {clientData?.am}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
            <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href={`/manager/campaigns/new?client=${clientId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle campagne
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="plans">Plans ({plans.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations du client</CardTitle>
                <CardDescription>Détails et coordonnées du client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de la société</Label>
                        <Input
                          id="name"
                          value={clientData?.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Secteur</Label>
                        <Input
                          id="industry"
                          value={clientData?.industry}
                          onChange={(e) => setClientData({ ...clientData, industry: e.target.value })}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact principal</Label>
                        <Input
                          id="contactName"
                          value={clientData?.contactName}
                          onChange={(e) => setClientData({ ...clientData, contactName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={clientData?.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={clientData?.phone}
                          onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commission">Commission (%)</Label>
                        <Input
                          id="commission"
                          type="number"
                          value={clientData?.commission}
                          onChange={(e) => setClientData({ ...clientData, commission: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Société</p>
                            <p className="font-semibold">{clientData?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Contact principal</p>
                            <p className="font-semibold">{clientData?.contactName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold">{clientData?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Téléphone</p>
                            <p className="font-semibold">{clientData?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Secteur</p>
                            <p className="font-semibold">{clientData?.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Commission</p>
                            <p className="font-semibold">{clientData?.commission}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Account Manager</p>
                          <p className="font-semibold">{clientData?.am}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Client depuis</p>
                          <p className="font-semibold">{clientData?.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campagnes du client</CardTitle>
                    <CardDescription>Toutes les opérations commerciales pour ce client</CardDescription>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href={`/manager/campaigns/new?client=${clientId}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle campagne
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <Link key={campaign.id} href={`/manager/campaigns/${campaign.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{campaign.name}</p>
                            {getCampaignStatusBadge(campaign.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                              {campaign.startDate} → {campaign.endDate}
                            </span>
                            <span>•</span>
                            <span>Budget: {campaign.budget}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Plans totaux</p>
                            <p className="font-semibold">{campaign.plansCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Plans validés</p>
                            <p className="font-semibold text-emerald-600">{campaign.approvedPlans}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plans du client</CardTitle>
                    <CardDescription>Tous les plans commerciaux pour ce client</CardDescription>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href={`/manager/plans/new?client=${clientId}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau plan
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun plan pour ce client.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <Link key={plan.id} href={`/manager/plans/${plan.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{plan.plan_name}</p>
                              {getStatusBadge(plan.status)}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>
                                {plan.start_date} → {plan.end_date}
                              </span>
                              <span>•</span>
                              <span>Affilié: {plan.affiliate?.name || "N/A"}</span>
                              {plan.campaign_name && (
                                <>
                                  <span>•</span>
                                  <span>{plan.campaign_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Gains affilié</p>
                              <p className="font-semibold">{formatCurrency(plan.gains_affilie || 0)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Notre marge</p>
                              <p className="font-semibold text-emerald-600">{formatCurrency(plan.notre_marge || 0)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Dépense client</p>
                              <p className="font-semibold">{formatCurrency(plan.depense_client || 0)}</p>
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
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default ClientDetailPage
