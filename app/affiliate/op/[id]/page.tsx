// app/(dashboard)/affiliate/op/[id]/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, History, Pencil, Plus, Trash2, CopyPlus } from "lucide-react"
import {
  OPS,
  AFF_USER,
  plansForAffiliateByOp,
  upsertPlan,
  upsertManyPlans,
  deletePlan,
  type Plan,
  type PlanVersion,
  canEditPlan,
  canAddPlan,
  Typology,
} from "@/lib/aff-db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ---------- utils ----------
function statusBadge(status: string) {
  switch (status) {
    case "ClientApproved":
      return "default"
    case "ClientRejected":
      return "destructive"
    default:
      return "secondary"
  }
}
const warn = "text-amber-500"

// ---------- page ----------
type OptionState = {
  id: string
  hdrMode: "single" | "nvx_anc"
  placementText: string
  hdrPct?: string
  hdrPctNvx?: string
  hdrPctAnc?: string
  fixedFeeAffEur?: string
  comment?: string
  fileName?: string
}

export default function OperationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const op = useMemo(() => OPS.find((o) => o.id === id && o.entityId === AFF_USER.currentEntity.id), [id])

  // Plans: on garde une state locale pour refléter immédiatement les créations/suppressions
  const [plans, setPlans] = useState<Plan[]>([])
  useEffect(() => {
    setPlans(plansForAffiliateByOp(id))
    const onStorage = (e: StorageEvent) => {
      if (e.key === "trinity_aff_plans") setPlans(plansForAffiliateByOp(id))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [id])

  // Drawer / Form
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [affEntity, setAffEntity] = useState<string>(AFF_USER.currentAffiliateEntity || AFF_USER.structures.entities?.[0])
  const [options, setOptions] = useState<OptionState[]>([
    {
      id: crypto.randomUUID(),
      hdrMode: "single",
      placementText: "",
      hdrPct: "",
      fixedFeeAffEur: "",
      comment: "",
      fileName: "",
    },
  ])
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)
  const [showTimeline, setShowTimeline] = useState<string | null>(null)

  if (!op) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Opération non trouvée</p>
        </div>
      </DashboardLayout>
    )
  }

  const allowAdd = canAddPlan(op)
  const isGroup = AFF_USER.structures.mode === "groupe"
  const affEntities = isGroup ? AFF_USER.structures.entities : [AFF_USER.currentAffiliateEntity].filter(Boolean)

  const openNew = () => {
    setEditingPlan(null)
    setOptions([
      {
        id: crypto.randomUUID(),
        hdrMode: "single",
        placementText: "",
        hdrPct: "",
        fixedFeeAffEur: "",
        comment: "",
        fileName: "",
      },
    ])
    setIsFormOpen(true)
  }

  const openEdit = (p: Plan) => {
    setEditingPlan(p)
    setAffEntity(p.affiliateEntity || affEntity || affEntities?.[0] || "")
    setOptions([
      {
        id: crypto.randomUUID(),
        hdrMode: p.hdrPct !== undefined ? "single" : "nvx_anc",
        placementText: p.placementText,
        hdrPct: p.hdrPct?.toString() || "",
        hdrPctNvx: p.hdrPctNvx?.toString() || "",
        hdrPctAnc: p.hdrPctAnc?.toString() || "",
        fixedFeeAffEur: p.fixedFeeAffEur.toString(),
        comment: "",
        fileName: p.fileUrls?.[0] || "",
      },
    ])
    setIsFormOpen(true)
  }

  const duplicateOption = (i: number) => {
    setOptions((opts) => {
      const o = opts[i]
      return [
        ...opts,
        {
          ...o,
          id: crypto.randomUUID(),
          comment: "",
        },
      ]
    })
  }

  const updateOption = (i: number, patch: Partial<OptionState>) =>
    setOptions((opts) => opts.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))

  const removeOption = (i: number) => setOptions((opts) => opts.filter((_, idx) => idx !== i))

  const submit = () => {
    const now = new Date().toISOString()

    // édition d’un seul plan
    if (editingPlan) {
      const o = options[0]
      const base = editingPlan
      const changes: PlanVersion["changes"] = {
        ...(o.hdrMode === "single" && o.hdrPct !== undefined && o.hdrPct !== ""
          ? { hdrPct: [base.hdrPct ?? Number(o.hdrPct), Number(o.hdrPct)] }
          : {}),
        ...(o.hdrMode === "nvx_anc" && o.hdrPctNvx
          ? { hdrPctNvx: [base.hdrPctNvx ?? Number(o.hdrPctNvx), Number(o.hdrPctNvx)] }
          : {}),
        ...(o.hdrMode === "nvx_anc" && o.hdrPctAnc
          ? { hdrPctAnc: [base.hdrPctAnc ?? Number(o.hdrPctAnc), Number(o.hdrPctAnc)] }
          : {}),
        fixedFeeAffEur: [base.fixedFeeAffEur ?? 0, Number(o.fixedFeeAffEur) || 0],
        ...(o.comment ? { comment: o.comment } : {}),
      }

      const updated: Plan = {
        ...base,
        affiliateEntity: affEntity || base.affiliateEntity,
        placementText: o.placementText,
        hdrPct: o.hdrMode === "single" ? Number(o.hdrPct) : undefined,
        hdrPctNvx: o.hdrMode === "nvx_anc" ? Number(o.hdrPctNvx) : undefined,
        hdrPctAnc: o.hdrMode === "nvx_anc" ? Number(o.hdrPctAnc) : undefined,
        fixedFeeAffEur: Number(o.fixedFeeAffEur) || 0,
        fileUrls: o.fileName ? [o.fileName] : [],
        versions: [...base.versions, { at: now, actor: "Affiliate", changes }],
        updatedAt: now,
      }

      upsertPlan(updated)
      setPlans((cur) => cur.map((p) => (p.id === updated.id ? updated : p)))
    } else {
      // création multi-options => on génère N plans
      const news: Plan[] = options.map((o) => ({
        id: `pl_${Date.now()}_${o.id}`,
        opId: op.id,
        opName: op.name,
        brandName: op.brandName,
        entityId: op.entityId,
        affiliateId: AFF_USER.id,
        affiliateName: AFF_USER.name,
        affiliateEntity: affEntity,
        typology: AFF_USER.typology,
        placementText: o.placementText,
        hdrPct: o.hdrMode === "single" ? Number(o.hdrPct) : undefined,
        hdrPctNvx: o.hdrMode === "nvx_anc" ? Number(o.hdrPctNvx) : undefined,
        hdrPctAnc: o.hdrMode === "nvx_anc" ? Number(o.hdrPctAnc) : undefined,
        fixedFeeAffEur: Number(o.fixedFeeAffEur) || 0,
        fileUrls: o.fileName ? [o.fileName] : [],
        status: "Submitted",
        versions: [
          {
            at: now,
            actor: "Affiliate",
            changes: {
              ...(o.hdrMode === "single" && o.hdrPct ? { hdrPct: [Number(o.hdrPct), Number(o.hdrPct)] } : {}),
              ...(o.hdrMode === "nvx_anc" && o.hdrPctNvx
                ? { hdrPctNvx: [Number(o.hdrPctNvx), Number(o.hdrPctNvx)] }
                : {}),
              ...(o.hdrMode === "nvx_anc" && o.hdrPctAnc
                ? { hdrPctAnc: [Number(o.hdrPctAnc), Number(o.hdrPctAnc)] }
                : {}),
              fixedFeeAffEur: [Number(o.fixedFeeAffEur) || 0, Number(o.fixedFeeAffEur) || 0],
              comment: o.comment || "Proposition",
            },
          },
        ],
        createdAt: now,
        updatedAt: now,
      }))

      upsertManyPlans(news)
      setPlans((cur) => [...news, ...cur])
    }

    setIsFormOpen(false)
    router.refresh()
    setTimeout(() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" }), 120)
  }

  const onDelete = () => {
    if (!deletingPlan) return
    deletePlan(deletingPlan.id)
    setPlans((cur) => cur.filter((p) => p.id !== deletingPlan.id))
    setDeletingPlan(null)
    router.refresh()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* OP header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{op.name}</CardTitle>
                <CardDescription>
                  {op.entityName} · {op.brandName}
                </CardDescription>
              </div>
              <Badge variant={op.status === "Active" ? "default" : "secondary"}>{op.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {op.mechanicsMd && <p className="text-sm text-muted-foreground">{op.mechanicsMd}</p>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(op.startDate).toLocaleDateString("fr-FR")} → {new Date(op.endDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">FF max {op.feeMaxEur}€</Badge>
              <Badge variant="secondary">HDR max {op.hdrMaxPct}%</Badge>
              {op.nvxBasePct && <Badge variant="outline">Base Nvx {op.nvxBasePct}%</Badge>}
              {op.ancBasePct && <Badge variant="outline">Base Anc {op.ancBasePct}%</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <Card id="history">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Mes plans sur cette OP</CardTitle>
              <CardDescription>Historique de vos soumissions</CardDescription>
            </div>
            {allowAdd && (
              <Button onClick={openNew} size="lg" className="min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un plan
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Affilié</TableHead>
                    <TableHead>Typologie</TableHead>
                    <TableHead>Emplacements</TableHead>
                    <TableHead>HDR</TableHead>
                    <TableHead>FF (€)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Aucun plan soumis pour cette opération
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((p) => {
                      const editable = canEditPlan(p, op)
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell className="text-sm">
                            {p.affiliateEntity ? `${p.affiliateName} · ${p.affiliateEntity}` : p.affiliateName}
                          </TableCell>
                          <TableCell className="text-sm">{p.typology}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-1">{p.placementText}</div>
                          </TableCell>
                          <TableCell>
                            {p.hdrPct !== undefined ? (
                              `${p.hdrPct}%`
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">
                                  {p.hdrPctNvx}% / {p.hdrPctAnc}%
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Nvx/Anc
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{p.fixedFeeAffEur}€</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTimeline(showTimeline === p.id ? null : p.id)}
                                aria-label="Historique"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(p)}
                                aria-label="Modifier"
                                disabled={!editable}
                                title={editable ? "" : "Plan figé (client validé ou OP clôturée)"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingPlan(p)}
                                aria-label="Supprimer"
                                disabled={!editable}
                                title={editable ? "" : "Plan figé (client validé ou OP clôturée)"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {/* Timeline inline */}
              {plans.map(
                (p) =>
                  showTimeline === p.id &&
                  p.versions?.length > 0 && (
                    <div key={p.id} className="bg-muted/50 rounded-md p-4 mt-2">
                      <p className="text-sm font-medium mb-2">Historique des modifications</p>
                      {p.versions.map((v, i) => (
                        <div key={i} className="text-sm space-y-1 border-l-2 border-primary pl-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {v.actor}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{new Date(v.at).toLocaleString("fr-FR")}</span>
                          </div>
                          {v.changes.hdrPct && (
                            <div>
                              <span className="line-through text-muted-foreground">{v.changes.hdrPct[0]}%</span> →{" "}
                              <span className="font-medium">{v.changes.hdrPct[1]}%</span>
                              <Badge variant="outline" className="ml-2 text-[10px]">HDR</Badge>
                            </div>
                          )}
                          {v.changes.hdrPctNvx && (
                            <div>
                              <span className="line-through text-muted-foreground">{v.changes.hdrPctNvx[0]}%</span> →{" "}
                              <span className="font-medium">{v.changes.hdrPctNvx[1]}%</span>
                              <Badge variant="outline" className="ml-2 text-[10px]">HDR Nvx</Badge>
                            </div>
                          )}
                          {v.changes.hdrPctAnc && (
                            <div>
                              <span className="line-through text-muted-foreground">{v.changes.hdrPctAnc[0]}%</span> →{" "}
                              <span className="font-medium">{v.changes.hdrPctAnc[1]}%</span>
                              <Badge variant="outline" className="ml-2 text-[10px]">HDR Anc</Badge>
                            </div>
                          )}
                          {v.changes.fixedFeeAffEur && (
                            <div>
                              <span className="line-through text-muted-foreground">{v.changes.fixedFeeAffEur[0]}€</span> →{" "}
                              <span className="font-medium">{v.changes.fixedFeeAffEur[1]}€</span>
                              <Badge variant="outline" className="ml-2 text-[10px]">FF</Badge>
                            </div>
                          )}
                          {v.changes.comment && <div className="italic text-muted-foreground">"{v.changes.comment}"</div>}
                        </div>
                      ))}
                      {/* CTA contre-proposition si le dernier acteur ≠ Affiliate */}
                      {(() => {
                        const last = p.versions[p.versions.length - 1]
                        const editable = canEditPlan(p, op)
                        if (!editable || last?.actor === "Affiliate") return null
                        return (
                          <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="min-h-[40px]">
                            Faire une contre-proposition
                          </Button>
                        )
                      })()}
                    </div>
                  ),
              )}
            </div>

            {/* Mobile: cards simplifiés */}
            <div className="md:hidden space-y-4">
              {plans.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Aucun plan</div>
              ) : (
                plans.map((p) => {
                  const editable = canEditPlan(p, op)
                  return (
                    <Card key={p.id}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                            <p className="text-sm">{p.affiliateEntity ? `${p.affiliateName} · ${p.affiliateEntity}` : p.affiliateName}</p>
                            <p className="text-xs text-muted-foreground">Typologie : {p.typology}</p>
                            <p className="text-sm line-clamp-2">{p.placementText}</p>
                          </div>
                          <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>HDR : {p.hdrPct !== undefined ? `${p.hdrPct}%` : `${p.hdrPctNvx}% / ${p.hdrPctAnc}%`}</span>
                          <span>FF : {p.fixedFeeAffEur}€</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 min-h-[44px]" disabled={!editable} onClick={() => openEdit(p)}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 min-h-[44px]" disabled={!editable} onClick={() => setDeletingPlan(p)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </Button>
                        </div>
                        {p.versions?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full min-h-[44px]"
                            onClick={() => setShowTimeline(showTimeline === p.id ? null : p.id)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            {showTimeline === p.id ? "Masquer l'historique" : "Voir l'historique"}
                          </Button>
                        )}
                        {showTimeline === p.id &&
                          p.versions.map((v, i) => (
                            <div key={i} className="text-sm space-y-1 border-l-2 border-primary pl-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {v.actor}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(v.at).toLocaleString("fr-FR")}
                                </span>
                              </div>
                              {v.changes.hdrPct && (
                                <div>
                                  <span className="line-through text-muted-foreground">{v.changes.hdrPct[0]}%</span> →{" "}
                                  <span className="font-medium">{v.changes.hdrPct[1]}%</span>
                                </div>
                              )}
                              {v.changes.hdrPctNvx && (
                                <div>
                                  <span className="line-through text-muted-foreground">{v.changes.hdrPctNvx[0]}%</span> →{" "}
                                  <span className="font-medium">{v.changes.hdrPctNvx[1]}%</span>
                                </div>
                              )}
                              {v.changes.hdrPctAnc && (
                                <div>
                                  <span className="line-through text-muted-foreground">{v.changes.hdrPctAnc[0]}%</span> →{" "}
                                  <span className="font-medium">{v.changes.hdrPctAnc[1]}%</span>
                                </div>
                              )}
                              {v.changes.fixedFeeAffEur && (
                                <div>
                                  <span className="line-through text-muted-foreground">{v.changes.fixedFeeAffEur[0]}€</span> →{" "}
                                  <span className="font-medium">{v.changes.fixedFeeAffEur[1]}€</span>
                                </div>
                              )}
                              {v.changes.comment && <div className="italic text-muted-foreground">"{v.changes.comment}"</div>}
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bouton flottant mobile */}
        {allowAdd && (
          <Button onClick={openNew} size="lg" className="sm:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50" aria-label="Ajouter un plan">
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Drawer Form (multi-options, non-bloquant) */}
        <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DrawerContent className="max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>{editingPlan ? "Modifier le plan" : "Proposer un plan"}</DrawerTitle>
              <p className="text-sm text-muted-foreground">
                FF max {op.feeMaxEur}€ · HDR max {op.hdrMaxPct}% {op.nvxBasePct ? `· Base Nvx ${op.nvxBasePct}%` : ""}{" "}
                {op.ancBasePct ? `· Base Anc ${op.ancBasePct}%` : ""}
              </p>
              {isGroup && (
                <div className="pt-2">
                  <Label className="text-xs">Entité affiliée</Label>
                  <Select value={affEntity} onValueChange={setAffEntity}>
                    <SelectTrigger className="w-[240px] mt-1">
                      <SelectValue placeholder="Choisir l'entité affiliée" />
                    </SelectTrigger>
                    <SelectContent>
                      {affEntities?.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-6">
              {options.map((o, i) => {
                const feeWarning = o.fixedFeeAffEur && Number(o.fixedFeeAffEur) > op.feeMaxEur
                const hdrWarning =
                  o.hdrMode === "single"
                    ? o.hdrPct && Number(o.hdrPct) > op.hdrMaxPct
                    : (o.hdrPctNvx && Number(o.hdrPctNvx) > op.hdrMaxPct) ||
                      (o.hdrPctAnc && Number(o.hdrPctAnc) > op.hdrMaxPct)

                return (
                  <Card key={o.id} className="border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Option {i + 1}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => duplicateOption(i)}>
                            <CopyPlus className="h-4 w-4 mr-1" />
                            Dupliquer
                          </Button>
                          {options.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                      {(feeWarning || hdrWarning) && (
                        <p className={cn("mt-2 text-xs", warn)}>
                          Avertissement : vous dépassez les plafonds indiqués pour cette OP. Vous pouvez quand même
                          soumettre le plan.
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {/* HDR */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium">HDR (poste de rémunération)</p>
                        <div className="flex gap-4 text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`hdrmode_${o.id}`}
                              checked={o.hdrMode === "single"}
                              onChange={() => updateOption(i, { hdrMode: "single" })}
                            />
                            Une seule HDR
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`hdrmode_${o.id}`}
                              checked={o.hdrMode === "nvx_anc"}
                              onChange={() => updateOption(i, { hdrMode: "nvx_anc" })}
                            />
                            Nouveaux / Anciens
                          </label>
                        </div>
                        {o.hdrMode === "single" ? (
                          <div className="space-y-2">
                            <Label>HDR finale (%)</Label>
                            <Input
                              inputMode="decimal"
                              placeholder={`≤ ${op.hdrMaxPct}`}
                              value={o.hdrPct || ""}
                              onChange={(e) => updateOption(i, { hdrPct: e.target.value })}
                              className={cn(hdrWarning ? "ring-1 ring-amber-500" : "")}
                            />
                          </div>
                        ) : (
                          <div className="grid gap-3 grid-cols-2">
                            <div>
                              <Label>HDR Nouveaux (%)</Label>
                              <Input
                                inputMode="decimal"
                                placeholder={`≤ ${op.hdrMaxPct}`}
                                value={o.hdrPctNvx || ""}
                                onChange={(e) => updateOption(i, { hdrPctNvx: e.target.value })}
                                className={cn(hdrWarning ? "ring-1 ring-amber-500" : "")}
                              />
                            </div>
                            <div>
                              <Label>HDR Anciens (%)</Label>
                              <Input
                                inputMode="decimal"
                                placeholder={`≤ ${op.hdrMaxPct}`}
                                value={o.hdrPctAnc || ""}
                                onChange={(e) => updateOption(i, { hdrPctAnc: e.target.value })}
                                className={cn(hdrWarning ? "ring-1 ring-amber-500" : "")}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Emplacements */}
                      <div className="space-y-2 sm:row-span-2">
                        <Label>Emplacements (1 ligne = 1 emplacement)</Label>
                        <Textarea
                          placeholder={"Homepage Hero – S1\nCatégorie Mode – Bloc top – S2\nNewsletter #3 – 28/10"}
                          value={o.placementText}
                          onChange={(e) => updateOption(i, { placementText: e.target.value })}
                          className="min-h-[140px]"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            id={`file_${o.id}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => updateOption(i, { fileName: e.target.files?.[0]?.name || "" })}
                            accept="image/*,application/pdf"
                          />
                          <Button variant="outline" onClick={() => document.getElementById(`file_${o.id}`)?.click()}>
                            Choisir un fichier
                          </Button>
                          <span className="text-sm text-muted-foreground">{o.fileName || "Aucun fichier choisi"}</span>
                        </div>
                      </div>

                      {/* Frais fixes + Commentaire */}
                      <div className="space-y-2">
                        <Label>Frais fixes (€)</Label>
                        <Input
                          inputMode="decimal"
                          placeholder={`≤ ${op.feeMaxEur}`}
                          value={o.fixedFeeAffEur || ""}
                          onChange={(e) => updateOption(i, { fixedFeeAffEur: e.target.value })}
                          className={cn(
                            o.fixedFeeAffEur && Number(o.fixedFeeAffEur) > op.feeMaxEur ? "ring-1 ring-amber-500" : "",
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Commentaire</Label>
                        <Input
                          placeholder="Contexte, inventaire, précisions…"
                          value={o.comment || ""}
                          onChange={(e) => updateOption(i, { comment: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <div className="flex justify-start">
                <Button variant="outline" onClick={() => duplicateOption(options.length - 1)}>
                  <CopyPlus className="h-4 w-4 mr-2" />
                  Ajouter une option
                </Button>
              </div>
            </div>

            <DrawerFooter className="gap-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={submit}
                  className="min-h-[44px]"
                  title="Enregistre/soumet même si les plafonds sont dépassés (non-bloquant)"
                >
                  {editingPlan ? "Enregistrer" : "Enregistrer (brouillon)"}
                </Button>
                <div className="flex gap-2">
                  <Button onClick={submit} className="min-h-[44px]">
                    {editingPlan ? "Soumettre la mise à jour" : "Soumettre à l’AM"}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="min-h-[44px]">
                    Fermer
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete dialog */}
        <Dialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le plan</DialogTitle>
              <DialogDescription>Cette action est irréversible.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingPlan(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
