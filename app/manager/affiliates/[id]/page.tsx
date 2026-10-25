"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, Users, TrendingUp, FileText, Calendar, Building2, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getAffiliateWithDetails } from "@/lib/supabase/queries/affiliates"
import { formatCurrency } from "@/lib/utils"

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

function AffiliateDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [affiliateData, setAffiliateData] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    function loadData() {
      if (!isValidUUID(id)) {
        console.error("[v0] Invalid UUID detected:", id)
        setLoading(false)
        setAffiliateData(null)
        return
      }

      setLoading(true)

      getAffiliateWithDetails(id).then((result) => {
        if (result) {
          const { affiliate, plans: affiliatePlans } = result
          const approvedPlans = affiliatePlans.filter((p: any) => p.status === "approved")

          const totalDepense = approvedPlans.reduce((sum: number, p: any) => sum + (p.depense_client || 0), 0)
          const totalGain = approvedPlans.reduce(
            (sum: number, p: any) => sum + (p.gains_affilie || p.fixed_fee || 0),
            0,
          )

          const clientIds = new Set(approvedPlans.map((p: any) => p.client_id))

          setAffiliateData({
            id: affiliate.id,
            name: affiliate.name,
            email: affiliate.email,
            phone: affiliate.phone,
            entity: affiliate.company || "N/A",
            accountNumber: "N/A",
            am: affiliate.account_manager?.name || "",
            amId: affiliate.account_manager_id,
            joinDate: affiliate.join_date,
            clients: clientIds.size,
            plans: affiliatePlans.length,
            depenseClient: formatCurrency(totalDepense),
            gainAffilié: formatCurrency(totalGain),
            status: affiliate.status,
          })

          setPlans(
            affiliatePlans.map((plan: any) => ({
              id: plan.id,
              client: plan.client?.name || "",
              campaign: plan.campaign_name,
              dates: `${plan.start_date} - ${plan.end_date}`,
              gainAffilié: formatCurrency(plan.gains_affilie || plan.fixed_fee || 0),
              depenseClient: formatCurrency(plan.depense_client || 0),
              status: plan.status === "approved" ? "validated" : "pending",
              client_id: plan.client_id,
            })),
          )

          console.log(`[v0] Loaded Affiliate from Supabase: ${affiliate.name} with ${affiliatePlans.length} plans`)
        }

        setLoading(false)
      })
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-muted-foreground">Chargement des détails de l'affilié...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!affiliateData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">Affilié non trouvé ou ID invalide</p>
            <Button onClick={() => router.push("/manager/affiliates")}>Retour à la liste</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{affiliateData.name}</h1>
            <p className="text-muted-foreground">
              {affiliateData.entity} • {affiliateData.accountNumber}
            </p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            {affiliateData.status === "active" ? "Actif" : "En attente"}
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliateData.clients}</div>
              <p className="text-xs text-muted-foreground">Clients avec plans validés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans proposés</CardTitle>
              <FileText className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliateData.plans}</div>
              <p className="text-xs text-muted-foreground">Total des plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépense Client</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliateData.depenseClient}</div>
              <p className="text-xs text-muted-foreground">Prix original + commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gain Affilié</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{affiliateData.gainAffilié}</div>
              <p className="text-xs text-muted-foreground">Prix original avant commission</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Numéro de compte (SA)</p>
                  <p className="text-sm text-muted-foreground font-mono">{affiliateData.accountNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{affiliateData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">{affiliateData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Manager</p>
                  <p className="text-sm text-muted-foreground">{affiliateData.am}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date d'arrivée</p>
                  <p className="text-sm text-muted-foreground">{affiliateData.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Clients gérés par cet affilié</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(
                  plans.reduce((acc, plan: any) => {
                    if (plan.client && !acc.has(plan.client)) {
                      // Find the first plan with this client to get the client_id
                      const planWithClient = plans.find((p: any) => p.client === plan.client)
                      acc.set(plan.client, planWithClient?.client_id)
                    }
                    return acc
                  }, new Map()),
                ).map(([clientName, clientId]: [string, any]) => {
                  const clientPlans = plans.filter((plan: any) => plan.client === clientName)
                  const totalDepense = clientPlans.reduce((sum: number, plan: any) => {
                    const value =
                      typeof plan.depenseClient === "string"
                        ? Number.parseFloat(plan.depenseClient.replace(/[^0-9.-]+/g, "")) || 0
                        : plan.depenseClient || 0
                    return sum + value
                  }, 0)
                  const totalGain = clientPlans.reduce((sum: number, plan: any) => {
                    const value =
                      typeof plan.gainAffilié === "string"
                        ? Number.parseFloat(plan.gainAffilié.replace(/[^0-9.-]+/g, "")) || 0
                        : plan.gainAffilié || 0
                    return sum + value
                  }, 0)

                  return (
                    <Link key={clientName} href={`/manager/clients/${clientId}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium">{clientName}</p>
                          <p className="text-sm text-muted-foreground">{clientPlans.length} plans</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatCurrency(totalDepense)}</p>
                          <p className="text-sm text-emerald-600">{formatCurrency(totalGain)} gain affilié</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Plans ({affiliateData.plans})</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plans proposés</CardTitle>
                <CardDescription>Tous les plans soumis par cet affilié</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plans.map((plan: any) => (
                    <Link key={plan.id} href={`/manager/plans/${plan.id}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-1">
                          <p className="font-medium">{plan.campaign}</p>
                          <p className="text-sm text-muted-foreground">{plan.client}</p>
                          <p className="text-xs text-muted-foreground mt-1">{plan.dates}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Gain Affilié</p>
                            <p className="font-semibold text-emerald-600">{plan.gainAffilié}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Dépense Client</p>
                            <p className="font-semibold text-blue-600">{plan.depenseClient}</p>
                          </div>
                          <Badge variant={plan.status === "validated" ? "default" : "secondary"} className="text-xs">
                            {plan.status === "validated" ? "Validé" : "En attente"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
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

export default AffiliateDetailPage
