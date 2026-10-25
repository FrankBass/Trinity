"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone } from "lucide-react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"

export default function ManagersPage() {
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const managersData = await getAllAccountManagers()
        setManagers(managersData)
        console.log("[v0] Entity Admin Managers - Managers loaded from Supabase:", managersData)
      } catch (error) {
        console.error("[v0] Error loading managers:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Chargement des managers...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Managers</h1>
            <p className="text-muted-foreground">Gérez les managers de pôle</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un manager
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un manager..." className="pl-10" />
          </div>
        </div>

        <div className="grid gap-4">
          {managers.map((manager) => (
            <Card key={manager.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={manager.name} />
                      <AvatarFallback>
                        {manager.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{manager.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        Account Manager
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{manager.ams}</p>
                      <p className="text-xs text-muted-foreground">AMs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{manager.clients}</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        {manager.email}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        {manager.phone}
                      </Button>
                    </div>
                    <Button>Voir le profil</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
