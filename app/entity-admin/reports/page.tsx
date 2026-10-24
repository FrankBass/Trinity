"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      name: "Rapport Mensuel - Janvier 2025",
      type: "Mensuel",
      date: "2025-01-31",
      size: "2.4 MB",
      status: "ready",
    },
    {
      id: 2,
      name: "Rapport Trimestriel - Q4 2024",
      type: "Trimestriel",
      date: "2024-12-31",
      size: "5.8 MB",
      status: "ready",
    },
    {
      id: 3,
      name: "Rapport Annuel - 2024",
      type: "Annuel",
      date: "2024-12-31",
      size: "12.3 MB",
      status: "ready",
    },
    {
      id: 4,
      name: "Rapport Mensuel - Février 2025",
      type: "Mensuel",
      date: "2025-02-28",
      size: "-",
      status: "pending",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
            <p className="text-muted-foreground">Consultez et téléchargez les rapports</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Générer un rapport
          </Button>
        </div>

        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span className="text-sm text-muted-foreground">{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === "ready" ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-500">Disponible</Badge>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500">En cours</Badge>
                    )}
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
