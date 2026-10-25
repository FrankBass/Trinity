"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Plus, Search, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { getClients } from "@/lib/supabase/queries/clients"

export default function PolesPage() {
  const [poles, setPoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPoles() {
      try {
        const [ams, clients] = await Promise.all([getAllAccountManagers(), getClients()])

        console.log("[v0] Poles Page - Loading data from Supabase")
        console.log("[v0] Poles Page - AMs:", ams?.length, "Clients:", clients?.length)

        // For now showing one default pole with actual data
        setPoles([
          {
            id: "1",
            name: "Pôle Principal",
            managers: 0, // Will be dynamic when manager roles are implemented
            ams: ams?.length || 0,
            clients: clients?.length || 0,
            revenue: "0€", // Will be calculated from approved plans
            status: "active",
          },
        ])
      } catch (error) {
        console.error("[v0] Error loading poles data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPoles()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Chargement...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Pôles</h1>
            <p className="text-muted-foreground">Gérez les pôles de votre entité</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Créer un pôle
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un pôle..." className="pl-10" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {poles.map((pole) => (
            <Card key={pole.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{pole.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {pole.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Managers</p>
                    <p className="text-2xl font-bold">{pole.managers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Managers</p>
                    <p className="text-2xl font-bold">{pole.ams}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clients actifs</p>
                    <p className="text-2xl font-bold">{pole.clients}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CA mensuel</p>
                    <p className="text-2xl font-bold">{pole.revenue}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
