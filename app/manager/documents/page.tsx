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
} from "lucide-react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"

// Mock documents data
const mockDocuments = [
  {
    id: 1,
    name: "Contrat_GrowthAgency_2025.pdf",
    type: "contract",
    category: "Contrat Affilié",
    entityType: "affiliate",
    entityName: "Growth Agency",
    uploadedBy: "Sophie Martin",
    uploadDate: "2025-10-15",
    size: "245 KB",
    fileType: "pdf",
  },
  {
    id: 2,
    name: "Facture_InnovateLab_Q4.pdf",
    type: "invoice",
    category: "Facture",
    entityType: "client",
    entityName: "InnovateLab",
    uploadedBy: "Thomas Dubois",
    uploadDate: "2025-10-20",
    size: "128 KB",
    fileType: "pdf",
  },
  {
    id: 3,
    name: "Proposition_CloudSys_BlackFriday.docx",
    type: "proposal",
    category: "Proposition",
    entityType: "client",
    entityName: "CloudSys",
    uploadedBy: "Sophie Martin",
    uploadDate: "2025-10-22",
    size: "89 KB",
    fileType: "docx",
  },
  {
    id: 4,
    name: "Contrat_LeadGenExperts_2025.pdf",
    type: "contract",
    category: "Contrat Affilié",
    entityType: "affiliate",
    entityName: "Lead Gen Experts",
    uploadedBy: "Pierre Bernard",
    uploadDate: "2025-09-30",
    size: "312 KB",
    fileType: "pdf",
  },
  {
    id: 5,
    name: "Brief_Campagne_TechCorp.pdf",
    type: "brief",
    category: "Brief Campagne",
    entityType: "campaign",
    entityName: "Lancement Produit Q1",
    uploadedBy: "Thomas Dubois",
    uploadDate: "2025-10-18",
    size: "456 KB",
    fileType: "pdf",
  },
]

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />
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

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Contrat Affilié":
    case "Contrat Client":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "Facture":
      return "bg-green-100 text-green-700 border-green-200"
    case "Proposition":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "Brief Campagne":
      return "bg-orange-100 text-orange-700 border-orange-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Centre de Documents</h1>
            <p className="text-muted-foreground mt-1">Gérez tous vos documents en un seul endroit</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Uploader un document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Uploader un document</DialogTitle>
                <DialogDescription>Ajoutez un nouveau document au centre de documents</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Fichier</Label>
                  <Input id="file" type="file" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract-affiliate">Contrat Affilié</SelectItem>
                      <SelectItem value="contract-client">Contrat Client</SelectItem>
                      <SelectItem value="invoice">Facture</SelectItem>
                      <SelectItem value="proposal">Proposition</SelectItem>
                      <SelectItem value="brief">Brief Campagne</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entity-type">Type d'entité</Label>
                  <Select>
                    <SelectTrigger id="entity-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="affiliate">Affilié</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="campaign">Campagne</SelectItem>
                      <SelectItem value="am">Account Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entity">Entité associée</Label>
                  <Select>
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
              </div>
              <DialogFooter>
                <Button type="submit">Uploader</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocuments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contrats</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocuments.filter((d) => d.type === "contract").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Factures</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocuments.filter((d) => d.type === "invoice").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propositions</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocuments.filter((d) => d.type === "proposal").length}</div>
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
                  <Input placeholder="Rechercher un document..." className="pl-9" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="contract">Contrats</SelectItem>
                  <SelectItem value="invoice">Factures</SelectItem>
                  <SelectItem value="proposal">Propositions</SelectItem>
                  <SelectItem value="brief">Briefs</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type d'entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="affiliate">Affiliés</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="campaign">Campagnes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>{mockDocuments.length} document(s) trouvé(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{doc.name}</p>
                        <Badge variant="outline" className={getCategoryColor(doc.category)}>
                          {doc.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{doc.entityName}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploadé le {new Date(doc.uploadDate).toLocaleDateString("fr-FR")}</span>
                        <span>•</span>
                        <span>Par {doc.uploadedBy}</span>
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
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
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
      </div>
    </DashboardLayout>
  )
}
