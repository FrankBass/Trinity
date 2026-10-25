"use client"

import { useState, useMemo } from "react"
import { useAuditLogStore, type AuditAction, type EntityType } from "@/lib/data/audit-log-store"
import { ActivityTimeline } from "@/components/audit/activity-timeline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Search, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ActivityPage() {
  const { logs } = useAuditLogStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterAction, setFilterAction] = useState<AuditAction | "all">("all")
  const [filterEntityType, setFilterEntityType] = useState<EntityType | "all">("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(logs.map((log) => log.userName))
    return Array.from(users).sort()
  }, [logs])

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      if (
        searchQuery &&
        !log.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.entityName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Action filter
      if (filterAction !== "all" && log.action !== filterAction) {
        return false
      }

      // Entity type filter
      if (filterEntityType !== "all" && log.entityType !== filterEntityType) {
        return false
      }

      // User filter
      if (filterUser !== "all" && log.userName !== filterUser) {
        return false
      }

      // Date range filter
      if (dateRange.start && new Date(log.timestamp) < new Date(dateRange.start)) {
        return false
      }
      if (dateRange.end && new Date(log.timestamp) > new Date(dateRange.end)) {
        return false
      }

      return true
    })
  }, [logs, searchQuery, filterAction, filterEntityType, filterUser, dateRange])

  const handleExport = () => {
    const exportData = filteredLogs.map((log) => ({
      Date: new Date(log.timestamp).toLocaleString("fr-FR"),
      Utilisateur: log.userName,
      Rôle: log.userRole,
      Action: log.action,
      "Type d'entité": log.entityType,
      Entité: log.entityName,
      Description: log.description,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Logs d'activité")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `logs-activite-${new Date().toISOString().split("T")[0]}.xlsx`
    link.click()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Logs d'activité</h1>
          <p className="text-muted-foreground">Historique complet de toutes les actions effectuées sur la plateforme</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
            <CardDescription>Filtrez les logs par action, type d'entité, utilisateur ou période</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={filterAction} onValueChange={(value) => setFilterAction(value as AuditAction | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value="create">Création</SelectItem>
                    <SelectItem value="update">Modification</SelectItem>
                    <SelectItem value="delete">Suppression</SelectItem>
                    <SelectItem value="validate">Validation</SelectItem>
                    <SelectItem value="reject">Rejet</SelectItem>
                    <SelectItem value="counter_proposal">Contre-proposition</SelectItem>
                    <SelectItem value="assign">Assignation</SelectItem>
                    <SelectItem value="set_objectives">Définition d'objectifs</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type d'entité</Label>
                <Select
                  value={filterEntityType}
                  onValueChange={(value) => setFilterEntityType(value as EntityType | "all")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="affiliate">Affiliés</SelectItem>
                    <SelectItem value="campaign">Campagnes</SelectItem>
                    <SelectItem value="plan">Plans</SelectItem>
                    <SelectItem value="am">Account Managers</SelectItem>
                    <SelectItem value="objective">Objectifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Utilisateur</Label>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">{filteredLogs.length} log(s) trouvé(s)</p>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter les logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <ActivityTimeline logs={filteredLogs} showUser={true} />
      </div>
    </DashboardLayout>
  )
}
