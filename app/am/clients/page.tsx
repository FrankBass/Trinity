"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Phone, Building2, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default function AMClientsPage() {
  const clients = [
    {
      id: 1,
      name: "TechCorp",
      contact: "Marie Dubois",
      email: "marie@techcorp.fr",
      phone: "+33 1 23 45 67 89",
      activeCampaigns: 3,
      totalSpend: "45 000€",
      status: "active",
      performance: "+12%",
    },
    {
      id: 2,
      name: "FashionBrand",
      contact: "Pierre Martin",
      email: "pierre@fashionbrand.fr",
      phone: "+33 1 98 76 54 32",
      activeCampaigns: 5,
      totalSpend: "78 500€",
      status: "active",
      performance: "+28%",
    },
    {
      id: 3,
      name: "FoodDelivery",
      contact: "Sophie Laurent",
      email: "sophie@fooddelivery.fr",
      phone: "+33 1 11 22 33 44",
      activeCampaigns: 2,
      totalSpend: "32 000€",
      status: "active",
      performance: "+5%",
    },
    {
      id: 4,
      name: "FinanceApp",
      contact: "Thomas Bernard",
      email: "thomas@financeapp.fr",
      phone: "+33 1 55 66 77 88",
      activeCampaigns: 4,
      totalSpend: "92 000€",
      status: "active",
      performance: "+18%",
    },
  ]

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
                                {client.status === "active" ? "Actif" : "Inactif"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{client.contact}</p>
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
                            <p className="text-xs text-muted-foreground">Campagnes actives</p>
                            <p className="text-lg font-semibold">{client.activeCampaigns}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Dépenses totales</p>
                            <p className="text-lg font-semibold">{client.totalSpend}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Performance</p>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <p className="text-lg font-semibold text-green-500">{client.performance}</p>
                            </div>
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
