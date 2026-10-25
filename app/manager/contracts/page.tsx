"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Download, Eye, MoreVertical, Search, Filter, Send, PenTool } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout" // Added DashboardLayout import
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

// Mock contracts data
const mockContracts = [
  {
    id: 1,
    number: "CTR-2025-001",
    type: "affiliate",
    entityName: "Growth Agency",
    entityEmail: "contact@growthagency.com",
    status: "signed",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    value: "15000€",
    createdBy: "Sophie Martin",
    createdDate: "2024-12-15",
  },
  {
    id: 2,
    number: "CTR-2025-002",
    type: "client",
    entityName: "InnovateLab",
    entityEmail: "contact@innovatelab.com",
    status: "sent",
    startDate: "2025-02-01",
    endDate: "2026-01-31",
    value: "45000€",
    createdBy: "Thomas Dubois",
    createdDate: "2025-01-20",
  },
  {
    id: 3,
    number: "CTR-2025-003",
    type: "affiliate",
    entityName: "Lead Gen Experts",
    entityEmail: "hello@leadgenexperts.com",
    status: "draft",
    startDate: "2025-11-01",
    endDate: "2026-10-31",
    value: "12000€",
    createdBy: "Pierre Bernard",
    createdDate: "2025-10-15",
  },
  {
    id: 4,
    number: "CTR-2025-004",
    type: "client",
    entityName: "CloudSys",
    entityEmail: "admin@cloudsys.io",
    status: "signed",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    value: "38000€",
    createdBy: "Sophie Martin",
    createdDate: "2025-02-10",
  },
  {
    id: 5,
    number: "CTR-2024-089",
    type: "affiliate",
    entityName: "Digital Boost",
    entityEmail: "info@digitalboost.fr",
    status: "expired",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    value: "18000€",
    createdBy: "Thomas Dubois",
    createdDate: "2023-12-01",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "signed":
      return "bg-green-100 text-green-700 border-green-200"
    case "sent":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-200"
    case "expired":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "signed":
      return "Signé"
    case "sent":
      return "Envoyé"
    case "draft":
      return "Brouillon"
    case "expired":
      return "Expiré"
    default:
      return status
  }
}

const getTypeLabel = (type: string) => {
  return type === "affiliate" ? "Affilié" : "Client"
}

export default function ContractsPage() {
  const { toast } = useToast()
  const [contracts, setContracts] = useState(mockContracts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showNewContractDialog, setShowNewContractDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [selectedContract, setSelectedContract] = useState<(typeof mockContracts)[0] | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureName, setSignatureName] = useState("Sophie Martin")
  const [showEditDialog, setShowEditDialog] = useState(false) // Declared the missing variable

  const handleView = (contract: (typeof mockContracts)[0]) => {
    setSelectedContract(contract)
    setShowViewDialog(true)
  }

  const handleSend = (contract: (typeof mockContracts)[0]) => {
    setSelectedContract(contract)
    setShowSendDialog(true)
  }

  const handleSign = (contract: (typeof mockContracts)[0]) => {
    setSelectedContract(contract)
    setShowSignDialog(true)
  }

  const handleDownload = (contract: (typeof mockContracts)[0]) => {
    toast({
      title: "Téléchargement en cours",
      description: `Le contrat ${contract.number} est en cours de téléchargement...`,
    })
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.entityName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || contract.type === selectedType
    const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const type = formData.get("contract-type") as string
    const entityId = formData.get("entity") as string
    const value = formData.get("value") as string
    const file = formData.get("contract-file") as File

    if (!file || !type || !entityId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const newContract = {
      id: contracts.length + 1,
      number: `CTR-2025-${String(contracts.length + 1).padStart(3, "0")}`,
      type: type as "affiliate" | "client",
      entityName: entityId === "1" ? "Growth Agency" : entityId === "2" ? "Lead Gen Experts" : "InnovateLab",
      entityEmail:
        entityId === "1"
          ? "contact@growthagency.com"
          : entityId === "2"
            ? "hello@leadgenexperts.com"
            : "contact@innovatelab.com",
      status: "draft" as const,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      value: value ? `${value}€` : "0€",
      createdBy: "Sophie Martin",
      createdDate: new Date().toISOString().split("T")[0],
    }

    setContracts([newContract, ...contracts])
    setShowNewContractDialog(false)
    toast({
      title: "Contrat créé",
      description: `Le contrat ${newContract.number} a été créé avec succès`,
    })
  }

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedContract) return

    const formData = new FormData(e.currentTarget)
    const entityName = formData.get("edit-entity") as string
    const value = formData.get("edit-value") as string
    const status = formData.get("edit-status") as string

    setContracts(
      contracts.map((c) =>
        c.id === selectedContract.id ? { ...c, entityName, value: `${value}€`, status: status as any } : c,
      ),
    )

    toast({
      title: "Contrat modifié",
      description: "Les modifications ont été enregistrées",
    })
    setShowEditDialog(false)
  }

  const handleSignContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedContract) return

    const formData = new FormData(e.currentTarget)
    const signerName = formData.get("signature-name") as string
    const signerTitle = formData.get("signature-title") as string

    if (!signerName || !signerTitle) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    // Update contract status to signed
    setContracts(contracts.map((c) => (c.id === selectedContract.id ? { ...c, status: "signed" as const } : c)))

    // Auto-send email to affiliate
    const emailMessage = `Parfait, j'ai signé le contrat ${selectedContract.entityName}. Veuillez trouver ci-joint le contrat ${selectedContract.number} signé.\n\nCordialement,\n${signerName}`

    toast({
      title: "Contrat signé et envoyé",
      description: `Le contrat ${selectedContract.number} a été signé et envoyé à ${selectedContract.entityEmail}`,
    })

    // Show email sent confirmation
    setTimeout(() => {
      toast({
        title: "Email envoyé",
        description: `Email envoyé à ${selectedContract.entityEmail} avec le contrat signé`,
      })
    }, 1000)

    setShowSignDialog(false)
    clearSignature()
  }

  const handleSendContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedContract) return

    setContracts(contracts.map((c) => (c.id === selectedContract.id ? { ...c, status: "sent" as const } : c)))

    toast({
      title: "Contrat envoyé",
      description: `Le contrat ${selectedContract.number} a été envoyé avec succès`,
    })
    setShowSendDialog(false)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contrats</h1>
            <p className="text-muted-foreground mt-1">Gérez les contrats affiliés et clients</p>
          </div>
          <Dialog open={showNewContractDialog} onOpenChange={setShowNewContractDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau contrat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleCreateContract}>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau contrat</DialogTitle>
                  <DialogDescription>Uploadez un contrat PDF et renseignez les informations</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-file">Contrat PDF *</Label>
                    <Input
                      id="contract-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                      name="contract-file"
                    />
                    <p className="text-xs text-muted-foreground">Format accepté: PDF uniquement</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract-type">Type de contrat *</Label>
                    <Select name="contract-type">
                      <SelectTrigger id="contract-type">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="affiliate">Contrat Affilié</SelectItem>
                        <SelectItem value="client">Contrat Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entity">Entité *</Label>
                    <Select name="entity">
                      <SelectTrigger id="entity">
                        <SelectValue placeholder="Sélectionner une entité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Growth Agency</SelectItem>
                        <SelectItem value="2">Lead Gen Experts</SelectItem>
                        <SelectItem value="3">InnovateLab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Valeur du contrat</Label>
                    <Input id="value" type="number" placeholder="15000" name="value" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowNewContractDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer le contrat</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contrats</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signés</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.filter((c) => c.status === "signed").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.filter((c) => c.status === "sent").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirés</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.filter((c) => c.status === "expired").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un contrat..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="affiliate">Affiliés</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="signed">Signés</SelectItem>
                  <SelectItem value="sent">Envoyés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="expired">Expirés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle>Contrats</CardTitle>
            <CardDescription>{filteredContracts.length} contrat(s) trouvé(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{contract.number}</p>
                        <Badge variant="outline" className={getStatusColor(contract.status)}>
                          {getStatusLabel(contract.status)}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{contract.entityName}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{contract.value}</span>
                        <span>•</span>
                        <span>{contract.entityEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.status === "sent" && (
                      <Button variant="outline" size="sm" onClick={() => handleSign(contract)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Signer
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(contract)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSend(contract)}>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(contract)}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Contrat {selectedContract?.number}</DialogTitle>
              <DialogDescription>
                {selectedContract?.entityName} - {selectedContract?.value}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border rounded-lg p-8 bg-muted/30 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Aperçu du contrat PDF</p>
                  <p className="text-sm mt-2">Le contrat {selectedContract?.number} s'afficherait ici</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Fermer
              </Button>
              <Button onClick={() => selectedContract && handleDownload(selectedContract)}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSendContract}>
              <DialogHeader>
                <DialogTitle>Envoyer le contrat</DialogTitle>
                <DialogDescription>Envoyez le contrat {selectedContract?.number} par email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="send-to">Destinataire</Label>
                  <Input id="send-to" type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="send-message">Message (optionnel)</Label>
                  <Textarea
                    id="send-message"
                    rows={4}
                    placeholder="Ajoutez un message personnalisé..."
                    defaultValue={`Bonjour,\n\nVeuillez trouver ci-joint le contrat ${selectedContract?.number} pour signature.\n\nCordialement`}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowSendDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleSignContract}>
              <DialogHeader>
                <DialogTitle>Signer le contrat</DialogTitle>
                <DialogDescription>
                  Signez le contrat {selectedContract?.number} - {selectedContract?.entityName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="text-sm text-muted-foreground mb-2">
                    <p>
                      <strong>Contrat:</strong> {selectedContract?.number}
                    </p>
                    <p>
                      <strong>Entité:</strong> {selectedContract?.entityName}
                    </p>
                    <p>
                      <strong>Valeur:</strong> {selectedContract?.value}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedContract?.entityEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Signature électronique</Label>
                  <div className="border-2 border-dashed rounded-lg p-2 bg-white">
                    <canvas
                      ref={signatureCanvasRef}
                      width={600}
                      height={200}
                      className="w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                    Effacer la signature
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature-name">Nom du signataire *</Label>
                  <Input
                    id="signature-name"
                    name="signature-name"
                    placeholder="Votre nom complet"
                    defaultValue="Sophie Martin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature-title">Fonction *</Label>
                  <Input
                    id="signature-title"
                    name="signature-title"
                    placeholder="Ex: Directeur Général"
                    defaultValue="Manager"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
                  <input type="checkbox" id="signature-confirm" className="h-4 w-4" required />
                  <Label htmlFor="signature-confirm" className="text-sm cursor-pointer">
                    Je confirme avoir lu et accepté les termes de ce contrat
                  </Label>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Après signature, un email sera automatiquement envoyé à{" "}
                    {selectedContract?.entityEmail} avec le contrat signé.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowSignDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  <PenTool className="h-4 w-4 mr-2" />
                  Signer et envoyer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
