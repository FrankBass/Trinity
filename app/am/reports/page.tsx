"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar } from "lucide-react"

export default function AMReportsPage() {
  // Will be dynamically generated from Supabase data when implemented
  // For now showing placeholder UI for report generation feature

  const reports = [
    {
      id: "1",
      title: "Rapport Mensuel - À générer",
      description: "Synthèse complète de l'activité du mois",
      date: new Date().toISOString(),
      type: "monthly",
    },
  ]

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">Consultez et téléchargez vos rapports</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Générer un rapport
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Généré le {new Date(report.date).toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
