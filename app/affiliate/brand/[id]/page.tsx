// app/(dashboard)/affiliate/brand/[id]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar } from "lucide-react"
import Link from "next/link"
import { opsForCurrentEntity } from "@/lib/aff-db"

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const allOps = opsForCurrentEntity()
  const brandOps = allOps.filter((op) => op.brandId === id)
  const brand = brandOps.length > 0 ? { id, name: brandOps[0].brandName } : null

  if (!brand) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enseigne non trouvée</p>
        </div>
      </DashboardLayout>
    )
  }

  const activeOps = brandOps.filter((op) => op.status === "Active")
  const upcomingOps = brandOps.filter((op) => op.status === "Upcoming")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
            <p className="text-muted-foreground mt-1">
              {activeOps.length} OP{activeOps.length > 1 ? "s" : ""} active{activeOps.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {activeOps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Opérations actives</h2>
            <div className="grid gap-4">
              {activeOps.map((op) => (
                <Card key={op.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{op.name}</CardTitle>
                        <CardDescription>{op.entityName}</CardDescription>
                      </div>
                      <Badge>{op.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {op.mechanicsMd && <p className="text-sm text-muted-foreground">{op.mechanicsMd}</p>}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(op.startDate).toLocaleDateString("fr-FR")} →{" "}
                        {new Date(op.endDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">FF max {op.feeMaxEur}€</Badge>
                      <Badge variant="secondary">HDR max {op.hdrMaxPct}%</Badge>
                      {op.nvxBasePct && <Badge variant="outline">Base Nvx {op.nvxBasePct}%</Badge>}
                      {op.ancBasePct && <Badge variant="outline">Base Anc {op.ancBasePct}%</Badge>}
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/affiliate/op/${op.id}#form`}>Proposer un plan</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingOps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Opérations à venir</h2>
            <div className="grid gap-4">
              {upcomingOps.map((op) => (
                <Card key={op.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{op.name}</CardTitle>
                        <CardDescription>{op.entityName}</CardDescription>
                      </div>
                      <Badge variant="secondary">{op.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Débute le {new Date(op.startDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
