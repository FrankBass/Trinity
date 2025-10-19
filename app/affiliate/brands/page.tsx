// app/(dashboard)/affiliate/brands/page.tsx
"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { opsForCurrentEntity, addToPortfolio, getPortfolio, removeFromPortfolio } from "@/lib/aff-db"

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [portfolio, setPortfolio] = useState<string[]>(getPortfolio())
  const allOps = opsForCurrentEntity()

  const brandMap = new Map<string, { brandId: string; brandName: string; active: number }>()
  allOps.forEach((op) => {
    const key = op.brandId
    if (!brandMap.has(key)) brandMap.set(key, { brandId: op.brandId, brandName: op.brandName, active: 0 })
    if (op.status === "Active") brandMap.get(key)!.active++
  })

  const brands = Array.from(brandMap.values()).filter((b) =>
    b.brandName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function toggle(brandId: string) {
    if (portfolio.includes(brandId)) {
      removeFromPortfolio(brandId)
      setPortfolio((x) => x.filter((b) => b !== brandId))
    } else {
      addToPortfolio(brandId)
      setPortfolio((x) => [...x, brandId])
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechercher une enseigne</h1>
          <p className="text-muted-foreground">Trouvez des opérations actives et soumettez vos plans</p>
        </div>

        <Input placeholder="Rechercher une enseigne…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Card key={b.brandId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{b.brandName}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {b.active} OP{b.active > 1 ? "s" : ""} active{b.active > 1 ? "s" : ""}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/affiliate/brand/${b.brandId}`}>Voir les OPs</Link>
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => toggle(b.brandId)}>
                  {portfolio.includes(b.brandId) ? "Retirer" : "Ajouter"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
