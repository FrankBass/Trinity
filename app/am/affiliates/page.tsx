"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus, Mail, Phone, TrendingUp, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAffiliates } from "@/lib/supabase/queries/affiliates"

export default function AMAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function loadAffiliates() {
      try {
        const data = await getAffiliates()
        console.log("[v0] AM Affiliates loaded from Supabase:", data)
        setAffiliates(data)
      } catch (error) {
        console.error("[v0] Error loading affiliates:", error)
      } finally {
        setLoading(false)
      }
    }
    loadAffiliates()
  }, [])

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || affiliate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Affiliés</h1>
          <p className="text-muted-foreground">Gérez et suivez vos affiliés</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un affilié
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un affilié..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAffiliates.map((affiliate) => (
          <Card key={affiliate.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={affiliate.avatar || "/placeholder.svg"} alt={affiliate.name} />
                    <AvatarFallback>
                      {affiliate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{affiliate.name}</CardTitle>
                    <CardDescription className="text-sm">{affiliate.location || "France"}</CardDescription>
                  </div>
                </div>
                <Badge variant={affiliate.status === "active" ? "default" : "secondary"}>
                  {affiliate.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{affiliate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{affiliate.phone || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Performance</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    {affiliate.performance}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Deals</div>
                  <div className="text-sm font-semibold">{affiliate.deals}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">CA</div>
                  <div className="text-sm font-semibold">{affiliate.revenue}</div>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Voir le profil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
