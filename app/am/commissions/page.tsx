"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Copy } from "lucide-react"

export default function AMCommissionsPage() {
  const commissionGrids = [
    {
      id: 1,
      name: "Grille Standard",
      type: "Pourcentage",
      rate: "10%",
      clients: 5,
      status: "active",
      description: "Commission fixe de 10% sur toutes les ventes",
    },
    {
      id: 2,
      name: "Grille Premium",
      type: "Paliers",
      rate: "12-18%",
      clients: 3,
      status: "active",
      description: "Commission progressive selon le volume de ventes",
    },
    {
      id: 3,
      name: "Grille Saisonnière",
      type: "Fixe",
      rate: "25€",
      clients: 2,
      status: "active",
      description: "Commission fixe par conversion pendant les soldes",
    },
    {
      id: 4,
      name: "Grille Test",
      type: "Pourcentage",
      rate: "8%",
      clients: 0,
      status: "draft",
      description: "Grille en cours de configuration",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grilles de commissions</h1>
            <p className="text-muted-foreground">Configurez les structures de rémunération pour vos clients</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle grille
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {commissionGrids.map((grid) => (
            <Card key={grid.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{grid.name}</CardTitle>
                      <Badge variant={grid.status === "active" ? "default" : "outline"}>
                        {grid.status === "active" ? "Active" : "Brouillon"}
                      </Badge>
                    </div>
                    <CardDescription>{grid.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-semibold">{grid.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taux</p>
                    <p className="font-semibold text-primary">{grid.rate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clients</p>
                    <p className="font-semibold">{grid.clients}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Copy className="w-3 h-3 mr-1" />
                    Dupliquer
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-500/10 bg-transparent">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration des paliers</CardTitle>
            <CardDescription>Exemple de grille progressive (Grille Premium)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Palier 1</p>
                  <p className="text-sm text-muted-foreground">0 - 10 000€ de ventes</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500">12%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Palier 2</p>
                  <p className="text-sm text-muted-foreground">10 000€ - 50 000€ de ventes</p>
                </div>
                <Badge className="bg-purple-500/10 text-purple-500">15%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Palier 3</p>
                  <p className="text-sm text-muted-foreground">50 000€+ de ventes</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500">18%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
