"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Search } from "lucide-react"
import {
  opsForCurrentEntity,
  plansForAffiliate,
  getPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  searchClientsAndOps,
} from "@/lib/aff-db"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { getMonthRange, inRange, type DateRange } from "@/lib/utils/date-range"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ClientApproved":
      return "default"
    case "ClientRejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function AffiliateDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getMonthRange(new Date()))
  const [q, setQ] = useState("")
  const [openSearch, setOpenSearch] = useState(false)

  const ops = opsForCurrentEntity()
  const activeOps = ops.filter((o) => o.status === "Active")
  const myPlans = plansForAffiliate()

  const stats = useMemo(() => {
    const plansSubmitted = myPlans.filter(
      (p) =>
        inRange(p.createdAt, dateRange) &&
        ["Submitted", "InDiscussion", "ValidatedAffiliate", "PendingClient", "ClientOnHold"].includes(p.status),
    ).length
    const plansValidated = myPlans.filter(
      (p) => p.status === "ClientApproved" && inRange(p.updatedAt, dateRange),
    ).length
    const dealsEur = myPlans
      .filter((p) => p.status === "ClientApproved" && inRange(p.updatedAt, dateRange))
      .reduce((s, p) => s + (p.fixedFeeAffEur || 0), 0)
    return { plansSubmitted, plansValidated, dealsEur }
  }, [myPlans, dateRange])

  const recentPlans = useMemo(
    () =>
      myPlans
        .filter((p) => inRange(p.updatedAt, dateRange))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 10),
    [myPlans, dateRange],
  )

  // Portfolio
  const [portfolio, setPortfolio] = useState<string[]>(getPortfolio())
  function toggleBrand(brandId: string) {
    if (portfolio.includes(brandId)) {
      removeFromPortfolio(brandId)
      setPortfolio((x) => x.filter((b) => b !== brandId))
    } else {
      addToPortfolio(brandId)
      setPortfolio((x) => [...x, brandId])
    }
  }

  // Recherche
  const results = q ? searchClientsAndOps(q) : { brands: [], ops: [] }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 transition-[margin,width] duration-200">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Tableau de bord Affilié</h1>
              <p className="text-muted-foreground mt-1">Gérez vos opérations et soumissions de plans</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setOpenSearch(true)} className="min-h-[44px]">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          {/* KPIs */}
          <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">OP actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOps.length}</div>
                <p className="text-xs text-muted-foreground">Entité courante</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Plans soumis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.plansSubmitted}</div>
                <p className="text-xs text-muted-foreground">Période sélectionnée</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Plans validés (client)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.plansValidated}</div>
                <p className="text-xs text-muted-foreground">Période sélectionnée</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Deals conclus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dealsEur.toLocaleString("fr-FR")} €</div>
                <p className="text-xs text-muted-foreground">FF validés</p>
              </CardContent>
            </Card>
          </div>

          {/* Mes OP en cours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes OP en cours</CardTitle>
                <CardDescription>Opérations actives auxquelles vous pouvez soumettre des plans</CardDescription>
              </div>
              <Button asChild className="hidden sm:flex min-h-[44px]">
                <Link href="/affiliate/brands">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher une enseigne
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeOps.slice(0, 6).map((op) => (
                  <Card key={op.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{op.name}</CardTitle>
                      <CardDescription>
                        {op.entityName} · {op.brandName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          FF max {op.feeMaxEur}€
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          HDR max {op.hdrMaxPct}%
                        </Badge>
                      </div>
                      <Button asChild size="sm" className="w-full min-h-[44px]">
                        <Link href={`/affiliate/op/${op.id}`}>Voir l'OP</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button asChild className="w-full mt-4 sm:hidden min-h-[44px]">
                <Link href="/affiliate/brands">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher une enseigne
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Mon portefeuille */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mon portefeuille</CardTitle>
                <CardDescription>Clients suivis</CardDescription>
              </div>
              <Button asChild variant="outline" className="min-h-[44px] bg-transparent">
                <Link href="/affiliate/brands">Ajouter un client</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block relative -mx-4 sm:mx-0">
                <div className="overflow-x-auto scrollbar-none">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead># OP actives</TableHead>
                        <TableHead>Plans en attente</TableHead>
                        <TableHead>Dernier mouvement</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Votre portefeuille est vide
                          </TableCell>
                        </TableRow>
                      ) : (
                        portfolio.map((brandId) => {
                          const brandOps = ops.filter((o) => o.brandId === brandId)
                          const brandName = brandOps[0]?.brandName || brandId
                          const activeCount = brandOps.filter((o) => o.status === "Active").length
                          const plans = myPlans.filter((p) => p.brandName === brandName)
                          const pending = plans.filter((p) =>
                            ["InDiscussion", "PendingClient", "ClientOnHold"].includes(p.status),
                          ).length
                          const last = plans.reduce((d, p) => Math.max(d, +new Date(p.updatedAt)), 0)
                          return (
                            <TableRow key={brandId}>
                              <TableCell className="font-medium">{brandName}</TableCell>
                              <TableCell>{activeCount}</TableCell>
                              <TableCell>{pending}</TableCell>
                              <TableCell>{last ? new Date(last).toLocaleDateString("fr-FR") : "-"}</TableCell>
                              <TableCell className="flex gap-2">
                                <Button asChild size="sm" variant="ghost" className="min-h-[44px]">
                                  <Link href={`/affiliate/brand/${brandId}`}>Voir</Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleBrand(brandId)}
                                  className="min-h-[44px]"
                                >
                                  Retirer
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background" />
              </div>

              <div className="md:hidden space-y-4">
                {portfolio.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Votre portefeuille est vide</div>
                ) : (
                  portfolio.map((brandId) => {
                    const brandOps = ops.filter((o) => o.brandId === brandId)
                    const brandName = brandOps[0]?.brandName || brandId
                    const activeCount = brandOps.filter((o) => o.status === "Active").length
                    const plans = myPlans.filter((p) => p.brandName === brandName)
                    const pending = plans.filter((p) =>
                      ["InDiscussion", "PendingClient", "ClientOnHold"].includes(p.status),
                    ).length
                    const last = plans.reduce((d, p) => Math.max(d, +new Date(p.updatedAt)), 0)
                    return (
                      <Card key={brandId}>
                        <CardContent className="pt-4 space-y-2">
                          <p className="font-medium">{brandName}</p>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="text-muted-foreground">OP actives:</span> {activeCount}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Plans en attente:</span> {pending}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Dernier mouvement:</span>{" "}
                              {last ? new Date(last).toLocaleDateString("fr-FR") : "-"}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button asChild size="sm" className="flex-1 min-h-[44px]">
                              <Link href={`/affiliate/brand/${brandId}`}>Voir</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleBrand(brandId)}
                              className="flex-1 min-h-[44px]"
                            >
                              Retirer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dernières activités */}
          <Card>
            <CardHeader>
              <CardTitle>Dernières activités</CardTitle>
              <CardDescription>Vos dernières soumissions de plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block relative -mx-4 sm:mx-0">
                <div className="overflow-x-auto scrollbar-none">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>OP</TableHead>
                        <TableHead>Affilié</TableHead>
                        <TableHead>Typologie</TableHead>
                        <TableHead>Emplacement</TableHead>
                        <TableHead>HDR</TableHead>
                        <TableHead>FF (€)</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            Aucune activité dans la période sélectionnée
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentPlans.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-sm">
                              {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>{p.brandName}</TableCell>
                            <TableCell>{p.opName}</TableCell>
                            <TableCell className="text-sm">
                              {p.affiliateEntity ? `${p.affiliateName} · ${p.affiliateEntity}` : p.affiliateName}
                            </TableCell>
                            <TableCell className="text-sm">{p.typology}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {p.placementText}
                            </TableCell>
                            <TableCell>
                              {p.hdrPct !== undefined ? `${p.hdrPct}%` : `${p.hdrPctNvx}% / ${p.hdrPctAnc}%`}
                            </TableCell>
                            <TableCell>{p.fixedFeeAffEur}€</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button asChild variant="ghost" size="sm" className="min-h-[44px]">
                                <Link href={`/affiliate/op/${p.opId}#history`}>Voir</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background" />
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {recentPlans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Aucune activité</div>
                ) : (
                  recentPlans.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{p.opName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Client:</span> {p.brandName}
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Affilié:</span>{" "}
                              {p.affiliateEntity ? `${p.affiliateName} · ${p.affiliateEntity}` : p.affiliateName}
                            </p>
                            <p className="text-xs text-muted-foreground">Typologie: {p.typology}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.placementText}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            HDR: {p.hdrPct !== undefined ? `${p.hdrPct}%` : `${p.hdrPctNvx}% / ${p.hdrPctAnc}%`}
                          </span>
                          <span>FF: {p.fixedFeeAffEur}€</span>
                        </div>
                        <Button asChild size="sm" className="w-full min-h-[44px]">
                          <Link href={`/affiliate/op/${p.opId}#history`}>Voir le détail</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recherche (sheet) */}
          <Sheet open={openSearch} onOpenChange={setOpenSearch}>
            <SheetContent side="top" className="w-full sm:max-w-[520px] mx-auto">
              <SheetHeader>
                <SheetTitle>Recherche</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Rechercher un client ou une OP…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {q && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Clients</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {results.brands.length === 0 && <p className="text-sm text-muted-foreground">Aucun client</p>}
                        {results.brands.map((b) => (
                          <div key={b.brandId} className="flex items-center justify-between">
                            <span>{b.brandName}</span>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              onClick={() => setOpenSearch(false)}
                              className="min-h-[44px]"
                            >
                              <Link href={`/affiliate/brand/${b.brandId}`}>Voir</Link>
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">OP</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {results.ops.length === 0 && <p className="text-sm text-muted-foreground">Aucune OP</p>}
                        {results.ops.map((op) => (
                          <div key={op.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{op.name}</p>
                              <p className="text-xs text-muted-foreground">{op.brandName}</p>
                            </div>
                            <Button asChild size="sm" onClick={() => setOpenSearch(false)} className="min-h-[44px]">
                              <Link href={`/affiliate/op/${op.id}`}>Ouvrir</Link>
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </DashboardLayout>
  )
}
