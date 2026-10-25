"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target, Award } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase/queries/stats"

export default function AMPerformancePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats()
        console.log("[v0] AM Performance - Stats loaded from Supabase:", data)
        setStats(data)
      } catch (error) {
        console.error("[v0] Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  const metrics = [
    {
      title: "CA Total",
      value: `€${stats?.totalRevenue?.toLocaleString() || 0}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Deals Conclus",
      value: stats?.totalPlans || 0,
      change: "+8.2%",
      trend: "up",
      icon: Target,
    },
    {
      title: "Taux de Conversion",
      value: "68%",
      change: "-2.1%",
      trend: "down",
      icon: TrendingUp,
    },
    {
      title: "Score Performance",
      value: "92/100",
      change: "+5 pts",
      trend: "up",
      icon: Award,
    },
  ]

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground">Suivez vos indicateurs de performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs flex items-center gap-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {metric.change} vs mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution Mensuelle</CardTitle>
          <CardDescription>Votre performance sur les 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Graphique de performance à venir
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
