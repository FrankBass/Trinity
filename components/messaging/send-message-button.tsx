"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notificationsStore } from "@/lib/data/notifications-store"
import { useUserStore } from "@/lib/store/user-store"

interface SendMessageButtonProps {
  recipientId: string
  recipientName: string
  recipientEmail?: string // Added email field
  recipientRole?: string
  context?: string
  contextLink?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function SendMessageButton({
  recipientId,
  recipientName,
  recipientEmail, // Added email prop
  recipientRole,
  context,
  contextLink,
  variant = "outline",
  size = "default",
  className,
  children,
}: SendMessageButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const currentUser = useUserStore((state) => state.user)

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message vide",
        description: "Veuillez saisir un message avant d'envoyer.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Create notification for recipient
    notificationsStore.addNotification({
      type: "message",
      title: `Message de ${currentUser?.name || "Manager"}`,
      message: message.trim(),
      link: contextLink || "/manager/notifications",
      read: false,
      metadata: {
        senderId: currentUser?.id.toString() || "0",
        senderName: currentUser?.name || "Manager",
        senderRole: currentUser?.role || "manager",
        context: context,
        canReply: true,
      },
    })

    toast({
      title: "Message envoyé",
      description: `Votre message a été envoyé à ${recipientName}.`,
    })

    setMessage("")
    setOpen(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className={className}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Envoyer un message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{recipientName}</span>
                {recipientEmail && <span className="text-muted-foreground">({recipientEmail})</span>}
              </div>
              {recipientRole && <span className="block text-sm">{recipientRole}</span>}
              {context && <span className="block text-sm mt-2 text-muted-foreground">{context}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Le destinataire recevra une notification et pourra consulter votre message.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSendMessage} disabled={isSubmitting || !message.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Envoi..." : "Envoyer le message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
