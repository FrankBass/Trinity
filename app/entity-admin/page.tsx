"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Settings, Shield, FileText, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { getClients } from "@/lib/supabase/queries/clients"

export default function EntityAdminDashboard() {
  const [stats, setStats] = useState({
    activePoles: 0,
    totalUsers: 0,
    auditLogs: 0,
    systemStatus: "100%",
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [ams, clients] = await Promise.all([getAllAccountManagers(), getClients()])

        console.log("[v0] Entity Admin Dashboard - AMs from Supabase:", ams?.length)
        console.log("[v0] Entity Admin Dashboard - Clients from Supabase:", clients?.length)

        setStats({
          activePoles: 1, // Will be dynamic when poles table is fully implemented
          totalUsers: (ams?.length || 0) + (clients?.length || 0),
          auditLogs: 0, // Will be from audit_logs table when implemented
          systemStatus: "100%",
        })

        // For now using empty activities until audit_logs table is queried
        setRecentActivities([])
      } catch (error) {
        console.error("[v0] Error loading entity admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const statsDisplay = [
    {
      label: "Pôles actifs",
      value: stats.activePoles.toString(),
      icon: Building2,
      trend: "Stable",
      color: "text-blue-500",
    },
    {
      label: "Utilisateurs totaux",
      value: stats.totalUsers.toString(),
      icon: Users,
      trend: `${stats.totalUsers} utilisateurs`,
      color: "text-purple-500",
    },
    {
      label: "Logs d'audit",
      value: stats.auditLogs.toString(),
      icon: FileText,
      trend: "Ce mois",
      color: "text-green-500",
    },
    {
      label: "Système",
      value: stats.systemStatus,
      icon: Activity,
      trend: "Opérationnel",
      color: "text-green-500",
    },
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration Entité</h1>
          <p className="text-muted-foreground">Gérez la structure et les paramètres de votre entité</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsDisplay.map((stat) => (
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
              {recentActivities.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">Aucune activité récente</p>
              ) : (
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
              )}
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
