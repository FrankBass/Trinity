"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LifeBuoy, Upload, X } from "lucide-react"
import { ticketsStore, type TicketCategory, type TicketPriority } from "@/lib/data/tickets-store"
import { notificationsStore } from "@/lib/data/notifications-store"
import { useUser } from "@/lib/store/user-store"
import { useToast } from "@/hooks/use-toast"

interface CreateTicketButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function CreateTicketButton({ variant = "default", size = "default", className }: CreateTicketButtonProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("technique")
  const [priority, setPriority] = useState<TicketPriority>("normale")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useUser()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      // Auto-assign based on category
      let assignedTo = ""
      let assignedToName = ""

      switch (category) {
        case "technique":
          assignedTo = "admin-1"
          assignedToName = "Admin Système"
          break
        case "commercial":
          assignedTo = "pole-1"
          assignedToName = "Pierre Leroy"
          break
        case "administratif":
        case "autre":
          assignedTo = "1"
          assignedToName = "Jean Dupont"
          break
      }

      const ticket = ticketsStore.createTicket({
        title,
        description,
        category,
        priority,
        status: "ouvert",
        createdBy: user.id,
        createdByName: user.name,
        createdByRole: user.role,
        assignedTo,
        assignedToName,
      })

      // Create notification for assigned user
      notificationsStore.addNotification({
        type: "message",
        title: "Nouveau ticket de support",
        message: `${user.name} a créé un ticket : ${title}`,
        userId: assignedTo,
        metadata: {
          senderId: user.id,
          senderName: user.name,
          context: `Ticket ${ticket.number}`,
          ticketId: ticket.id,
        },
      })

      toast({
        title: "Ticket créé",
        description: `Votre ticket ${ticket.number} a été créé et assigné à ${assignedToName}.`,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("technique")
      setPriority("normale")
      setAttachments([])
      setOpen(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du ticket.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <LifeBuoy className="h-4 w-4 mr-2" />
          Créer un ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un ticket de support</DialogTitle>
            <DialogDescription>
              Décrivez votre problème ou votre question. L'équipe Trinity vous répondra dans les plus brefs délais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Problème d'export Excel"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre problème en détail..."
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="administratif">Administratif</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priorité *</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachments">Pièces jointes (captures d'écran, documents...)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachments"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("attachments")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter des fichiers
                </Button>
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !description}>
              {isSubmitting ? "Création..." : "Créer le ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
