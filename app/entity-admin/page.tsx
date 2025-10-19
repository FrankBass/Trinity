"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Settings, Shield, FileText, Activity } from "lucide-react"

export default function EntityAdminDashboard() {
  const stats = [
    { label: "Pôles actifs", value: "4", icon: Building2, trend: "Stable", color: "text-blue-500" },
    { label: "Utilisateurs totaux", value: "156", icon: Users, trend: "+12 ce mois", color: "text-purple-500" },
    { label: "Logs d'audit", value: "2,847", icon: FileText, trend: "Ce mois", color: "text-green-500" },
    { label: "Système", value: "100%", icon: Activity, trend: "Opérationnel", color: "text-green-500" },
  ]

  const recentActivities = [
    { id: 1, user: "admin@trinity.fr", action: "Création d'un nouveau pôle", time: "Il y a 2h", type: "create" },
    { id: 2, user: "manager@trinity.fr", action: "Modification des permissions", time: "Il y a 5h", type: "update" },
    { id: 3, user: "admin@trinity.fr", action: "Export des données", time: "Il y a 1j", type: "export" },
    { id: 4, user: "system", action: "Sauvegarde automatique", time: "Il y a 1j", type: "system" },
  ]

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "create":
        return <Badge className="bg-green-500/10 text-green-500">Création</Badge>
      case "update":
        return <Badge className="bg-blue-500/10 text-blue-500">Modification</Badge>
      case "export":
        return <Badge className="bg-purple-500/10 text-purple-500">Export</Badge>
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">Système</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration Entité</h1>
          <p className="text-muted-foreground">Gérez la structure et les paramètres de votre entité</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Logs d'audit récents</CardTitle>
              <CardDescription>Activités système et utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{activity.action}</p>
                        {getActivityBadge(activity.type)}
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Voir tous les logs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
              <CardDescription>Gestion de l'entité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Gérer les pôles
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gestion des utilisateurs
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Permissions et rôles
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres de l'entité
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Logs d'audit complets
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Structure de l'entité</CardTitle>
            <CardDescription>Organisation hiérarchique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Pôle Commercial</h3>
                  <Badge>3 Managers</Badge>
                </div>
                <div className="pl-8 space-y-2 text-sm text-muted-foreground">
                  <p>• 24 Account Managers</p>
                  <p>• 135 Clients actifs</p>
                  <p>• CA: 1.2M€</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Pôle Technique</h3>
                  <Badge>2 Managers</Badge>
                </div>
                <div className="pl-8 space-y-2 text-sm text-muted-foreground">
                  <p>• 16 Account Managers</p>
                  <p>• 89 Clients actifs</p>
                  <p>• CA: 850K€</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
