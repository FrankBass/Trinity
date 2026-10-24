"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Building2, Target, DollarSign } from "lucide-react"

export default function PerformancePage() {
  const metrics = [
    {
      label: "CA Total",
      value: "3.42M€",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Clients Actifs",
      value: "371",
      change: "+8.2%",
      trend: "up",
      icon: Users,
    },
    {
      label: "Taux de Conversion",
      value: "64%",
      change: "-2.1%",
      trend: "down",
      icon: Target,
    },
    {
      label: "Pôles Actifs",
      value: "4",
      change: "Stable",
      trend: "neutral",
      icon: Building2,
    },
  ]

  const polePerformance = [
    { name: "Pôle Commercial", ca: "1.2M€", clients: 135, conversion: "68%", trend: "up" },
    { name: "Pôle Technique", ca: "950K€", clients: 102, conversion: "62%", trend: "up" },
    { name: "Pôle Marketing", ca: "850K€", clients: 89, conversion: "65%", trend: "down" },
    { name: "Pôle International", ca: "420K€", clients: 45, conversion: "58%", trend: "up" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Globale</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de l'entité</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {metric.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {metric.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                  <span
                    className={
                      metric.trend === "up"
                        ? "text-green-500"
                        : metric.trend === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }
                  >
                    {metric.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance par Pôle</CardTitle>
            <CardDescription>Comparaison des performances des différents pôles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {polePerformance.map((pole) => (
                <div key={pole.name} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{pole.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{pole.clients} clients</Badge>
                        <Badge variant="outline">Conv. {pole.conversion}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pole.ca}</p>
                      <p className="text-xs text-muted-foreground">CA mensuel</p>
                    </div>
                    {pole.trend === "up" ? (
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
