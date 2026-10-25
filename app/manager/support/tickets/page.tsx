"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye } from "lucide-react"
import { ticketsStore, type TicketStatus, type TicketCategory, type TicketPriority } from "@/lib/data/tickets-store"
import { CreateTicketButton } from "@/components/support/create-ticket-button"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

const statusLabels: Record<TicketStatus, string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  resolu: "Résolu",
  ferme: "Fermé",
}

const statusColors: Record<TicketStatus, string> = {
  ouvert: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_cours: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolu: "bg-green-500/10 text-green-500 border-green-500/20",
  ferme: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const priorityLabels: Record<TicketPriority, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
}

const priorityColors: Record<TicketPriority, string> = {
  basse: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  normale: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  haute: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgente: "bg-red-500/10 text-red-500 border-red-500/20",
}

const categoryLabels: Record<TicketCategory, string> = {
  technique: "Technique",
  commercial: "Commercial",
  administratif: "Administratif",
  autre: "Autre",
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState(ticketsStore.getAll())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all")

  const router = useRouter()

  useEffect(() => {
    const unsubscribe = ticketsStore.subscribe(() => {
      setTickets(ticketsStore.getAll())
    })
    return unsubscribe
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.createdByName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    })
  }, [tickets, searchQuery, statusFilter, categoryFilter, priorityFilter])

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      ouvert: tickets.filter((t) => t.status === "ouvert").length,
      en_cours: tickets.filter((t) => t.status === "en_cours").length,
      resolu: tickets.filter((t) => t.status === "resolu").length,
    }
  }, [tickets])

  const handleExport = () => {
    const exportData = filteredTickets.map((ticket) => ({
      Numéro: ticket.number,
      Titre: ticket.title,
      Catégorie: categoryLabels[ticket.category],
      Priorité: priorityLabels[ticket.priority],
      Statut: statusLabels[ticket.status],
      "Créé par": ticket.createdByName,
      "Assigné à": ticket.assignedToName || "-",
      "Date de création": new Date(ticket.createdAt).toLocaleDateString("fr-FR"),
      "Dernière mise à jour": new Date(ticket.updatedAt).toLocaleDateString("fr-FR"),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Tickets")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tickets-${new Date().toISOString().split("T")[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">Gérez vos tickets de support</p>
          </div>
          <CreateTicketButton />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.ouvert}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.en_cours}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolu}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Liste de tous les tickets de support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, titre ou créateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | "all")}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="resolu">Résolu</SelectItem>
                    <SelectItem value="ferme">Fermé</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as TicketCategory | "all")}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="administratif">Administratif</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={(value) => setPriorityFilter(value as TicketPriority | "all")}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé par</TableHead>
                      <TableHead>Assigné à</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          Aucun ticket trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">{ticket.number}</TableCell>
                          <TableCell className="font-medium max-w-[300px] truncate">{ticket.title}</TableCell>
                          <TableCell>{categoryLabels[ticket.category]}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={priorityColors[ticket.priority]}>
                              {priorityLabels[ticket.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[ticket.status]}>
                              {statusLabels[ticket.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.createdByName}</TableCell>
                          <TableCell>{ticket.assignedToName || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/manager/support/tickets/${ticket.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
