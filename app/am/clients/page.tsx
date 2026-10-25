"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, Building2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { getClients } from "@/lib/supabase/queries/clients"

export default function AMClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const clientsData = await getClients()
        setClients(clientsData)
        console.log("[v0] AM Clients - Clients loaded from Supabase:", clientsData)
      } catch (error) {
        console.error("[v0] Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes clients</h1>
            <p className="text-muted-foreground">Gérez votre portefeuille de clients</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des clients</CardTitle>
                <CardDescription>{clients.length} clients actifs</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un client..." className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <Card key={client.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Actif
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{client.contact_name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pl-15">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{client.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pl-15">
                          <div>
                            <p className="text-xs text-muted-foreground">Secteur</p>
                            <p className="text-lg font-semibold">{client.industry}</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" asChild>
                        <Link href={`/am/clients/${client.id}`}>
                          Voir détails <ArrowUpRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
