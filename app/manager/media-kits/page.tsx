"use client"

import type React from "react"

import { useState } from "react"

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
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  File,
  FileImage,
  FileSpreadsheet,
  FolderOpen,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// Mock media kits data - organized by affiliate
const mockMediaKits = [
  {
    id: 1,
    name: "Kit_Media_GrowthAgency_2025.pdf",
    affiliateId: 1,
    affiliateName: "Growth Agency",
    affiliateSA: "SA123456",
    planId: 1,
    planName: "Black Friday 2025",
    campaignName: "Black Friday TechCorp",
    uploadDate: "2025-10-15",
    size: "2.4 MB",
    fileType: "pdf",
  },
  {
    id: 2,
    name: "Media_Kit_LeadGen_Q4.pdf",
    affiliateId: 2,
    affiliateName: "Lead Gen Experts",
    affiliateSA: "SA123457",
    planId: 3,
    planName: "Lancement Produit Q1",
    campaignName: "Lancement Produit Q1",
    uploadDate: "2025-10-20",
    size: "1.8 MB",
    fileType: "pdf",
  },
  {
    id: 3,
    name: "Kit_Media_DigitalBoost_Images.zip",
    affiliateId: 3,
    affiliateName: "Digital Boost",
    affiliateSA: "SA123458",
    planId: 5,
    planName: "Webinar Series",
    campaignName: "Webinar Series",
    uploadDate: "2025-10-18",
    size: "5.2 MB",
    fileType: "zip",
  },
  {
    id: 4,
    name: "GrowthAgency_Webinar_Kit.pdf",
    affiliateId: 1,
    affiliateName: "Growth Agency",
    affiliateSA: "SA123456",
    planId: 2,
    planName: "Webinar Series",
    campaignName: "Webinar Series",
    uploadDate: "2025-10-22",
    size: "3.1 MB",
    fileType: "pdf",
  },
  {
    id: 5,
    name: "LeadGen_BlackFriday_Assets.zip",
    affiliateId: 2,
    affiliateName: "Lead Gen Experts",
    affiliateSA: "SA123457",
    planId: 4,
    planName: "Black Friday 2025",
    campaignName: "Black Friday TechCorp",
    uploadDate: "2025-10-19",
    size: "4.7 MB",
    fileType: "zip",
  },
]

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />
    case "zip":
      return <FolderOpen className="h-5 w-5 text-orange-500" />
    case "docx":
      return <File className="h-5 w-5 text-blue-500" />
    case "xlsx":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    case "jpg":
    case "png":
      return <FileImage className="h-5 w-5 text-purple-500" />
    default:
      return <File className="h-5 w-5 text-muted-foreground" />
  }
}

export default function MediaKitsPage() {
  const [mediaKits, setMediaKits] = useState(mockMediaKits)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAffiliate, setSelectedAffiliate] = useState("all")
  const [selectedFileType, setSelectedFileType] = useState("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()

  const filteredKits = mediaKits.filter((kit) => {
    const matchesSearch =
      kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAffiliate = selectedAffiliate === "all" || kit.affiliateId.toString() === selectedAffiliate
    const matchesFileType = selectedFileType === "all" || kit.fileType === selectedFileType
    return matchesSearch && matchesAffiliate && matchesFileType
  })

  const groupedFilteredKits = filteredKits.reduce(
    (acc, kit) => {
      const key = kit.affiliateId
      if (!acc[key]) {
        acc[key] = {
          affiliateId: kit.affiliateId,
          affiliateName: kit.affiliateName,
          affiliateSA: kit.affiliateSA,
          kits: [],
        }
      }
      acc[key].kits.push(kit)
      return acc
    },
    {} as Record<
      number,
      { affiliateId: number; affiliateName: string; affiliateSA: string; kits: typeof mockMediaKits }
    >,
  )

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File
    const affiliateId = formData.get("affiliate") as string
    const planId = formData.get("plan") as string

    if (!file || !affiliateId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et un affilié",
        variant: "destructive",
      })
      return
    }

    const newKit = {
      id: mediaKits.length + 1,
      name: file.name,
      affiliateId: Number.parseInt(affiliateId),
      affiliateName: affiliateId === "1" ? "Growth Agency" : affiliateId === "2" ? "Lead Gen Experts" : "Digital Boost",
      affiliateSA: affiliateId === "1" ? "SA123456" : affiliateId === "2" ? "SA123457" : "SA123458",
      planId: planId ? Number.parseInt(planId) : 0,
      planName: "Nouveau plan",
      campaignName: "Nouvelle campagne",
      uploadDate: new Date().toISOString().split("T")[0],
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: file.name.split(".").pop() || "pdf",
    }

    setMediaKits([...mediaKits, newKit])
    setShowUploadDialog(false)
    toast({
      title: "Kit média uploadé",
      description: `Le fichier "${file.name}" a été uploadé avec succès`,
    })
  }

  const handleDelete = (kitId: number) => {
    setMediaKits(mediaKits.filter((kit) => kit.id !== kitId))
    toast({
      title: "Kit média supprimé",
      description: "Le kit média a été supprimé avec succès",
    })
  }

  const handleView = (kit: (typeof mockMediaKits)[0]) => {
    toast({
      title: "Ouverture du fichier",
      description: `Ouverture de ${kit.name}...`,
    })
    // Simulate opening file
    window.open(`/placeholder-file/${kit.name}`, "_blank")
  }

  const handleDownload = (kit: (typeof mockMediaKits)[0]) => {
    toast({
      title: "Téléchargement en cours",
      description: `Téléchargement de ${kit.name}...`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kit Média Affilié</h1>
            <p className="text-muted-foreground mt-1">
              Kits média soumis par les affiliés lors de leurs propositions de plans
            </p>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Uploader un kit média
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleUpload}>
                <DialogHeader>
                  <DialogTitle>Uploader un kit média</DialogTitle>
                  <DialogDescription>Ajoutez un kit média pour un affilié</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier</Label>
                    <Input id="file" name="file" type="file" accept=".pdf,.zip,.jpg,.png" required />
                    <p className="text-xs text-muted-foreground">Formats acceptés: PDF, ZIP, JPG, PNG (max 10 MB)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliate">Affilié</Label>
                    <Select name="affiliate" required>
                      <SelectTrigger id="affiliate">
                        <SelectValue placeholder="Sélectionner un affilié" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Growth Agency (SA123456)</SelectItem>
                        <SelectItem value="2">Lead Gen Experts (SA123457)</SelectItem>
                        <SelectItem value="3">Digital Boost (SA123458)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan associé (optionnel)</Label>
                    <Select name="plan">
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Sélectionner un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Black Friday 2025 - TechCorp</SelectItem>
                        <SelectItem value="2">Webinar Series - CloudSys</SelectItem>
                        <SelectItem value="3">Lancement Produit Q1 - InnovateLab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Uploader</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kits Média</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaKits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliés</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(groupedFilteredKits).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDF</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaKits.filter((k) => k.fileType === "pdf").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archives</CardTitle>
              <FolderOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaKits.filter((k) => k.fileType === "zip").length}</div>
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
                    placeholder="Rechercher un kit média..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedAffiliate} onValueChange={setSelectedAffiliate}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Affilié" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les affiliés</SelectItem>
                  <SelectItem value="1">Growth Agency</SelectItem>
                  <SelectItem value="2">Lead Gen Experts</SelectItem>
                  <SelectItem value="3">Digital Boost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de fichier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="zip">Archives (ZIP)</SelectItem>
                  <SelectItem value="jpg">Images</SelectItem>
                  <SelectItem value="png">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media Kits List - Grouped by Affiliate */}
        {Object.values(groupedFilteredKits).map((group) => (
          <Card key={group.affiliateId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {group.affiliateName}
                    <Badge variant="outline" className="font-mono">
                      {group.affiliateSA}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{group.kits.length} kit(s) média</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.kits.map((kit) => (
                  <div
                    key={kit.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">{getFileIcon(kit.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{kit.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{kit.campaignName}</span>
                          <span>•</span>
                          <span>{kit.planName}</span>
                          <span>•</span>
                          <span>{kit.size}</span>
                          <span>•</span>
                          <span>Uploadé le {new Date(kit.uploadDate).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(kit)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(kit)}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(kit.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedFilteredKits).length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aucun kit média trouvé</p>
                <p className="text-sm">Essayez de modifier vos filtres ou uploadez un nouveau kit média</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
