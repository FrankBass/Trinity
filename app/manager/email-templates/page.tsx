"use client"

import type React from "react"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Mail, Plus, Eye, Edit, Copy, MoreVertical, Search, Send } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"

// Mock email templates data
const mockTemplates = [
  {
    id: 1,
    name: "Bienvenue Affilié",
    category: "onboarding",
    subject: "Bienvenue chez Trinity - Votre compte affilié est prêt",
    preview: "Bonjour {{affiliate_name}}, nous sommes ravis de vous accueillir dans notre réseau...",
    variables: ["affiliate_name", "account_manager", "login_link", "temporary_password"],
    lastModified: "2025-10-20",
  },
  {
    id: 2,
    name: "Bienvenue Account Manager",
    category: "onboarding",
    subject: "Bienvenue chez Trinity - Votre compte AM est créé",
    preview: "Bonjour {{am_name}}, votre compte Account Manager a été créé avec succès...",
    variables: ["am_name", "manager_name", "login_link", "temporary_password"],
    lastModified: "2025-10-20",
  },
  {
    id: 3,
    name: "Récapitulatif Plans Validés",
    category: "plan",
    subject: "Récapitulatif de vos plans validés - {{campaign_name}}",
    preview:
      "Bonjour {{affiliate_name}}, voici le récapitulatif de tous vos plans validés pour la campagne {{campaign_name}}...",
    variables: ["affiliate_name", "campaign_name", "client_name", "plans_list", "total_amount"],
    lastModified: "2025-10-22",
  },
  {
    id: 4,
    name: "Validation Plan",
    category: "plan",
    subject: "Votre plan {{campaign_name}} a été validé ✓",
    preview: "Bonjour {{affiliate_name}}, nous avons le plaisir de vous informer que votre plan a été validé...",
    variables: ["affiliate_name", "campaign_name", "client_name", "amount", "commission", "start_date"],
    lastModified: "2025-10-18",
  },
  {
    id: 5,
    name: "Rejet Plan",
    category: "plan",
    subject: "Votre plan {{campaign_name}} nécessite des ajustements",
    preview: "Bonjour {{affiliate_name}}, après examen de votre proposition pour {{campaign_name}}...",
    variables: ["affiliate_name", "campaign_name", "rejection_reason", "contact_am"],
    lastModified: "2025-10-15",
  },
  {
    id: 6,
    name: "Contre-proposition Manager",
    category: "plan",
    subject: "Nouvelle contre-proposition pour {{campaign_name}}",
    preview:
      "Bonjour {{affiliate_name}}, nous avons une contre-proposition concernant votre plan pour {{campaign_name}}...",
    variables: ["affiliate_name", "campaign_name", "new_amount", "new_commission", "new_terms"],
    lastModified: "2025-10-12",
  },
  {
    id: 7,
    name: "Contre-proposition Affilié",
    category: "plan",
    subject: "{{affiliate_name}} a fait une contre-proposition",
    preview: "L'affilié {{affiliate_name}} a soumis une contre-proposition pour la campagne {{campaign_name}}...",
    variables: ["affiliate_name", "campaign_name", "proposed_amount", "proposed_commission", "view_link"],
    lastModified: "2025-10-12",
  },
  {
    id: 8,
    name: "Confirmation Ré-attribution",
    category: "payment",
    subject: "Confirmation de ré-attribution - {{amount}}",
    preview: "Bonjour {{affiliate_name}}, votre plan a été ré-attribué sur la plateforme principale...",
    variables: ["affiliate_name", "amount", "sa_number", "reattribution_date", "campaign_name"],
    lastModified: "2025-10-10",
  },
  {
    id: 9,
    name: "Rappel Signature Contrat",
    category: "contract",
    subject: "Rappel: Signature du contrat d'insertion en attente",
    preview:
      "Bonjour {{affiliate_name}}, votre plan pour {{campaign_name}} a été validé. Merci de signer le contrat d'insertion...",
    variables: ["affiliate_name", "campaign_name", "contract_link", "deadline"],
    lastModified: "2025-10-08",
  },
  {
    id: 10,
    name: "Contrat Signé",
    category: "contract",
    subject: "Contrat d'insertion signé - {{campaign_name}}",
    preview: "Bonjour {{affiliate_name}}, nous avons bien reçu votre contrat d'insertion signé...",
    variables: ["affiliate_name", "campaign_name", "contract_number", "start_date"],
    lastModified: "2025-10-05",
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case "onboarding":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "plan":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "payment":
      return "bg-green-100 text-green-700 border-green-200"
    case "notification":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "contract":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "onboarding":
      return "Onboarding"
    case "plan":
      return "Plan"
    case "payment":
      return "Paiement"
    case "notification":
      return "Notification"
    case "contract":
      return "Contrat"
    default:
      return category
  }
}

export default function EmailTemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState(mockTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof mockTemplates)[0] | null>(null)

  const handlePreview = (template: (typeof mockTemplates)[0]) => {
    setSelectedTemplate(template)
    setShowPreviewDialog(true)
  }

  const handleEdit = (template: (typeof mockTemplates)[0]) => {
    setSelectedTemplate(template)
    setShowEditDialog(true)
  }

  const handleSend = (template: (typeof mockTemplates)[0]) => {
    setSelectedTemplate(template)
    setShowSendDialog(true)
  }

  const handleDuplicate = (template: (typeof mockTemplates)[0]) => {
    toast({
      title: "Template dupliqué",
      description: `Le template "${template.name}" a été dupliqué avec succès.`,
    })
  }

  const getPreviewContent = (template: (typeof mockTemplates)[0]) => {
    let subject = template.subject
    let body = template.preview

    const sampleData: Record<string, string> = {
      affiliate_name: "Jean Dupont",
      am_name: "Sophie Martin",
      client_name: "InnovateLab",
      campaign_name: "Black Friday 2025",
      account_manager: "Sophie Martin",
      login_link: "https://trinity.app/login",
      temporary_password: "TempPass123!",
      amount: "15,000€",
      commission: "2,250€",
      sa_number: "SA123456",
      start_date: "01/11/2025",
      contract_link: "https://trinity.app/contracts/CTR-2025-001",
      deadline: "30/10/2025",
      plans_list: "• Plan 1: 5,000€\n• Plan 2: 10,000€",
      total_amount: "15,000€",
      new_amount: "12,000€",
      new_commission: "1,800€",
      rejection_reason: "Budget insuffisant pour cette période",
      reattribution_date: "25/10/2025",
    }

    template.variables.forEach((variable) => {
      const value = sampleData[variable] || `{{${variable}}}`
      subject = subject.replace(new RegExp(`{{${variable}}}`, "g"), value)
      body = body.replace(new RegExp(`{{${variable}}}`, "g"), value)
    })

    return { subject, body }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("template-name") as string
    const category = formData.get("category") as string
    const subject = formData.get("subject") as string
    const body = formData.get("body") as string

    if (!name || !category || !subject || !body) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    // Extract variables from subject and body
    const variableRegex = /{{(\w+)}}/g
    const variables = Array.from(
      new Set([
        ...(subject.match(variableRegex) || []).map((v) => v.replace(/{{|}}/g, "")),
        ...(body.match(variableRegex) || []).map((v) => v.replace(/{{|}}/g, "")),
      ]),
    )

    const newTemplate = {
      id: templates.length + 1,
      name,
      category: category as any,
      subject,
      preview: body.substring(0, 100) + "...",
      variables,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setTemplates([newTemplate, ...templates])
    setShowNewTemplateDialog(false)
    toast({
      title: "Template créé",
      description: `Le template "${name}" a été créé avec succès`,
    })
  }

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTemplate) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get("edit-name") as string
    const subject = formData.get("edit-subject") as string
    const body = formData.get("edit-body") as string

    setTemplates(
      templates.map((t) =>
        t.id === selectedTemplate.id ? { ...t, name, subject, preview: body.substring(0, 100) + "..." } : t,
      ),
    )

    toast({
      title: "Template modifié",
      description: "Les modifications ont été enregistrées",
    })
    setShowEditDialog(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates d'Emails</h1>
            <p className="text-muted-foreground mt-1">Gérez vos modèles d'emails pour automatiser vos communications</p>
          </div>
          <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <form onSubmit={handleCreateTemplate}>
                <DialogHeader>
                  <DialogTitle>Créer un template d'email</DialogTitle>
                  <DialogDescription>Créez un nouveau modèle d'email avec des variables dynamiques</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nom du template</Label>
                    <Input id="template-name" placeholder="Ex: Bienvenue Affilié" name="template-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select name="category">
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="plan">Plan</SelectItem>
                        <SelectItem value="payment">Paiement</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="contract">Contrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input id="subject" placeholder="Ex: Bienvenue chez Trinity" name="subject" />
                    <p className="text-xs text-muted-foreground">
                      Utilisez des variables: {`{{affiliate_name}}, {{campaign_name}}, etc.`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Corps du message</Label>
                    <Textarea
                      id="body"
                      rows={10}
                      placeholder="Bonjour {{affiliate_name}},&#10;&#10;Nous sommes ravis de vous accueillir..."
                      name="body"
                    />
                    <p className="text-xs text-muted-foreground">
                      Variables disponibles:{" "}
                      {`{{affiliate_name}}, {{client_name}}, {{campaign_name}}, {{amount}}, {{account_manager}}, etc.`}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer le template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
              <Mail className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.filter((t) => t.category === "onboarding").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans</CardTitle>
              <Mail className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.filter((t) => t.category === "plan").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paiements</CardTitle>
              <Mail className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.filter((t) => t.category === "payment").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contrats</CardTitle>
              <Mail className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.filter((t) => t.category === "contract").length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un template..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="plan">Plan</SelectItem>
                  <SelectItem value="payment">Paiement</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="contract">Contrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>{filteredTemplates.length} template(s) disponible(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="outline" className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{template.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{template.preview}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.variables.slice(0, 4).map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                        {template.variables.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 4}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Modifié le {new Date(template.lastModified).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSend(template)}>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Aperçu du template</DialogTitle>
              <DialogDescription>{selectedTemplate?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Sujet</Label>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">{selectedTemplate && getPreviewContent(selectedTemplate).subject}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Corps du message</Label>
                <div className="p-4 border rounded-lg bg-muted/30 min-h-[200px] whitespace-pre-wrap">
                  {selectedTemplate && getPreviewContent(selectedTemplate).body}
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Les variables ont été remplacées par des données d'exemple pour l'aperçu
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Fermer
              </Button>
              <Button onClick={() => selectedTemplate && handleSend(selectedTemplate)}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleSaveEdit}>
              <DialogHeader>
                <DialogTitle>Modifier le template</DialogTitle>
                <DialogDescription>{selectedTemplate?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom du template</Label>
                  <Input id="edit-name" defaultValue={selectedTemplate?.name} name="edit-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Sujet</Label>
                  <Input id="edit-subject" defaultValue={selectedTemplate?.subject} name="edit-subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-body">Corps du message</Label>
                  <Textarea id="edit-body" rows={10} defaultValue={selectedTemplate?.preview} name="edit-body" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Envoyer un email</DialogTitle>
              <DialogDescription>Utilisez le template "{selectedTemplate?.name}"</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="send-to-type">Type de destinataire</Label>
                <Select>
                  <SelectTrigger id="send-to-type">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affiliate">Affilié</SelectItem>
                    <SelectItem value="am">Account Manager</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="send-recipient">Destinataire</Label>
                <Select>
                  <SelectTrigger id="send-recipient">
                    <SelectValue placeholder="Sélectionner un destinataire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Growth Agency (contact@growthagency.com)</SelectItem>
                    <SelectItem value="2">Lead Gen Experts (hello@leadgen.com)</SelectItem>
                    <SelectItem value="3">Digital Boost (info@digitalboost.com)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-2">Aperçu</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate && getPreviewContent(selectedTemplate).subject}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Email envoyé",
                    description: "L'email a été envoyé avec succès.",
                  })
                  setShowSendDialog(false)
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
