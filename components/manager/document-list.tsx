"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  Trash2,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  LucideFileJson as LucideFileIcon,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Document {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  category: string
  uploaded_at: string
}

interface DocumentListProps {
  planId: string
  refreshTrigger: number
  disabled?: boolean
}

export function DocumentList({ planId, refreshTrigger, disabled = false }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}/documents`)
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [planId, refreshTrigger])

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)

    try {
      const response = await fetch(`/api/plans/${planId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: deleteId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      })

      fetchDocuments()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />
    if (fileType.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />
    if (fileType.includes("spreadsheet")) return <FileSpreadsheet className="w-8 h-8 text-green-500" />
    return <LucideFileIcon className="w-8 h-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      emplacements: "Emplacements",
      ressources: "Ressources",
      other: "Autre",
    }
    return labels[category] || category
  }

  const filterByCategory = (category: string) => {
    return documents.filter((doc) => doc.category === category)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({documents.length})</TabsTrigger>
          <TabsTrigger value="emplacements">Emplacements ({filterByCategory("emplacements").length})</TabsTrigger>
          <TabsTrigger value="ressources">Ressources ({filterByCategory("ressources").length})</TabsTrigger>
          <TabsTrigger value="other">Autre ({filterByCategory("other").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {documents.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Aucun document uploadé</p>
          ) : (
            documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={() => setDeleteId(doc.id)}
                disabled={disabled}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
                getCategoryLabel={getCategoryLabel}
              />
            ))
          )}
        </TabsContent>

        {["emplacements", "ressources", "other"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-3 mt-4">
            {filterByCategory(category).length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Aucun document dans cette catégorie</p>
            ) : (
              filterByCategory(category).map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={() => setDeleteId(doc.id)}
                  disabled={disabled}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  getCategoryLabel={getCategoryLabel}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DocumentCard({
  doc,
  onDelete,
  disabled,
  getFileIcon,
  formatFileSize,
  getCategoryLabel,
}: {
  doc: Document
  onDelete: () => void
  disabled: boolean
  getFileIcon: (fileType: string) => React.ReactNode
  formatFileSize: (bytes: number) => string
  getCategoryLabel: (category: string) => string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">{getFileIcon(doc.file_type)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{doc.file_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getCategoryLabel(doc.category)}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
              className="text-destructive bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
