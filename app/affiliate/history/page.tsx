// app/(dashboard)/affiliate/history/page.tsx
"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { plansForAffiliate, OPS, type Plan, AFF_USER, upsertPlan } from "@/lib/aff-db"
import { useMemo, useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function badge(status: string) {
  switch (status) {
    case "ClientApproved":
      return "default"
    case "ClientRejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [plan, setPlan] = useState<Plan | null>(null)
  const [hdr, setHdr] = useState("")
  const [ff, setFf] = useState("")

  const all = plansForAffiliate()
  const filtered = useMemo(() => (statusFilter === "all" ? all : all.filter((p) => p.status === statusFilter)), [all, statusFilter])

  const openCounter = (p: Plan) => {
    setPlan(p)
    setHdr((p.hdrPct ?? p.hdrPctNvx ?? 0).toString())
    setFf((p.fixedFeeAffEur ?? 0).toString())
  }

  const submitCounter = () => {
    if (!plan) return
    const now = new Date().toISOString()
    const updated: Plan = {
      ...plan,
      hdrPct: plan.hdrPct !== undefined ? Number(hdr) : plan.hdrPct,
      fixedFeeAffEur: Number(ff) || 0,
      versions: [
        ...plan.versions,
        { at: now, actor: "Affiliate", changes: { comment: "Contre-proposition", ...(plan.hdrPct !== undefined ? { hdrPct: [plan.hdrPct, Number(hdr)] } : {}), fixedFeeAffEur: [plan.fixedFeeAffEur, Number(ff) || 0] } },
      ],
      updatedAt: now,
    }
    upsertPlan(updated)
    setPlan(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des plans</h1>
          <p className="text-muted-foreground">Tous vos plans soumis</p>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Mes plans</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Submitted">Soumis</SelectItem>
                <SelectItem value="InDiscussion">En discussion</SelectItem>
                <SelectItem value="PendingClient">En attente client</SelectItem>
                <SelectItem value="ClientApproved">Approuvé</SelectItem>
                <SelectItem value="ClientRejected">Refusé</SelectItem>
                <SelectItem value="ClientOnHold">En attente</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>OP</TableHead>
                  <TableHead>Emplacements</TableHead>
                  <TableHead>HDR</TableHead>
                  <TableHead>FF (€)</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{p.brandName}</TableCell>
                    <TableCell className="font-medium">{p.opName}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{p.placementText.substring(0, 40)}…</TableCell>
                    <TableCell>{p.hdrPct !== undefined ? `${p.hdrPct}%` : `${p.hdrPctNvx}% / ${p.hdrPctAnc}%`}</TableCell>
                    <TableCell>{p.fixedFeeAffEur}€</TableCell>
                    <TableCell>
                      <Badge variant={badge(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" asChild variant="ghost">
                        <a href={`/affiliate/op/${p.opId}#history`}>Voir</a>
                      </Button>
                      {p.status !== "ClientApproved" && (
                        <Button size="sm" variant="outline" onClick={() => openCounter(p)}>
                          Contre-proposition
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Drawer open={!!plan} onOpenChange={() => setPlan(null)}>
          <DrawerContent className="max-h-[80vh] overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Contre-proposition</DrawerTitle>
              <p className="text-sm text-muted-foreground">
                {plan?.opName} · {plan?.brandName}
              </p>
            </DrawerHeader>
            <div className="px-4 pb-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>HDR (%)</Label>
                <Input inputMode="decimal" value={hdr} onChange={(e) => setHdr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Frais fixes (€)</Label>
                <Input inputMode="decimal" value={ff} onChange={(e) => setFf(e.target.value)} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={submitCounter}>Envoyer</Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardLayout>
  )
}
