"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Mail, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ClientAffiliates() {
  const affiliates = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@example.com",
      status: "active",
      campaigns: 3,
      clicks: 1234,
      conversions: 156,
      revenue: "8,450€",
      joinDate: "15 Jan 2025",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie@example.com",
      status: "active",
      campaigns: 2,
      clicks: 892,
      conversions: 134,
      revenue: "7,230€",
      joinDate: "22 Jan 2025",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Pierre Bernard",
      email: "pierre@example.com",
      status: "active",
      campaigns: 4,
      clicks: 2156,
      conversions: 98,
      revenue: "5,890€",
      joinDate: "10 Fév 2025",
      avatar: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Sophie Dubois",
      email: "sophie@example.com",
      status: "pending",
      campaigns: 0,
      clicks: 0,
      conversions: 0,
      revenue: "0€",
      joinDate: "18 Fév 2025",
      avatar: "/placeholder.svg",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Affiliés</h1>
            <p className="text-muted-foreground">Gérez votre réseau d'affiliés</p>
          </div>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Inviter des affiliés
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un affilié..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total affiliés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+5 ce mois</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Affiliés actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">43</div>
              <p className="text-xs text-muted-foreground">91% du total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">À valider</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CA moyen/affilié</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">971€</div>
              <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des affiliés</CardTitle>
            <CardDescription>Tous vos affiliés et leurs performances</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affilié</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Campagnes</TableHead>
                  <TableHead>Clics</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>CA généré</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={affiliate.avatar || "/placeholder.svg"} alt={affiliate.name} />
                          <AvatarFallback>
                            {affiliate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{affiliate.name}</p>
                          <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={affiliate.status === "active" ? "default" : "secondary"}>
                        {affiliate.status === "active" ? "Actif" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{affiliate.campaigns}</TableCell>
                    <TableCell>{affiliate.clicks.toLocaleString()}</TableCell>
                    <TableCell>{affiliate.conversions}</TableCell>
                    <TableCell className="font-medium text-green-600">{affiliate.revenue}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                          <DropdownMenuItem>Voir les statistiques</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {affiliate.status === "pending" && (
                            <>
                              <DropdownMenuItem>Approuver</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Refuser</DropdownMenuItem>
                            </>
                          )}
                          {affiliate.status === "active" && (
                            <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
