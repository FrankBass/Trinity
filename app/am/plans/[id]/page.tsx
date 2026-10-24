"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle2, XCircle, Clock, User, Building2, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { getPlanById } from "@/lib/supabase/queries/plans"

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const plan = use(getPlanById(id))
  console.log("[v0] Plan Detail - Plan loaded from Supabase:", plan)

  if (!plan) {
    return (
      <DashboardLayout>
        <div>Plan non trouvé</div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        )
      default:
        return (
          <Badge className="bg-orange-500/10 text-orange-500">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/am/plans">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Détails du Plan</h1>
            <p className="text-muted-foreground">Plan #{id}</p>
          </div>
          {getStatusBadge(plan.status)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{plan.client?.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Affilié</p>
                  <p className="font-semibold">{plan.affiliate?.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de soumission</p>
                  <p className="font-semibold">{plan.created_at}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-semibold">{plan.fixed_fee}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom de la campagne</p>
                <p className="font-semibold">{plan.campaign_name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Période</p>
                <p className="font-semibold">
                  {plan.start_date} - {plan.end_date}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Commission HDR</p>
                <p className="font-semibold text-green-600">{plan.hdr_pct}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{plan.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectifs et KPIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Objectifs</p>
              <p className="font-semibold">{plan.details.targets}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">KPIs</p>
              <p className="font-semibold">{plan.details.kpis}</p>
            </div>
          </CardContent>
        </Card>

        {plan.status === "pending" && (
          <div className="flex gap-4">
            <Button className="flex-1 bg-transparent" variant="outline">
              Demander des modifications
            </Button>
            <Button className="flex-1">Approuver le plan</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
