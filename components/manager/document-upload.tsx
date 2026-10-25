"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  planId: string
  onUploadComplete: () => void
  disabled?: boolean
}

export function DocumentUpload({ planId, onUploadComplete, disabled = false }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState<string>("other")
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non autorisé",
        description: "Formats acceptés: PDF, PNG, JPG, DOCX, XLSX",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)

      const response = await fetch(`/api/plans/${planId}/documents/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast({
        title: "Document uploadé",
        description: `${file.name} a été ajouté avec succès`,
      })

      onUploadComplete()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Catégorie du document</Label>
          <Select value={category} onValueChange={setCategory} disabled={disabled || uploading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emplacements">Emplacements</SelectItem>
              <SelectItem value="ressources">Ressources</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled || uploading}
          accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {uploading ? "Upload en cours..." : "Glissez un fichier ou cliquez pour sélectionner"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, DOCX, XLSX (max 10 MB)</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
