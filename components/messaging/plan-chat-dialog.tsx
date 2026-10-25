"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

interface PlanChatDialogProps {
  planId: string
  recipientId: string
  recipientName: string
  recipientEmail?: string
  recipientType: "client" | "affiliate"
  context?: string
  children?: React.ReactNode
}

export function PlanChatDialog({
  planId,
  recipientId,
  recipientName,
  recipientEmail,
  recipientType,
  context,
  children,
}: PlanChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (open) {
      console.log(`[v0] Contact modal opened: type=${recipientType} plan=${planId}`)
      loadMessages()
    }
  }, [open, planId])

  useEffect(() => {
    if (!open) return

    const tableName = recipientType === "client" ? "client_messages" : "affiliate_messages"

    console.log(`[v0] Subscribing to Realtime channel: ${tableName}`)

    const channel = supabase
      .channel(`${tableName}_${planId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: tableName,
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          console.log(`[v0] Realtime message received from ${tableName}: ${payload.new.id}`)

          setMessages((prevMessages) => {
            const exists = prevMessages.some((msg) => msg.id === payload.new.id)
            if (exists) {
              console.log(`[v0] Message ${payload.new.id} already in list, skipping`)
              return prevMessages
            }

            const newMessages = [...prevMessages, payload.new]
            setTimeout(scrollToBottom, 100)
            return newMessages
          })
        },
      )
      .subscribe((status) => {
        console.log(`[v0] Realtime subscription status for ${tableName}: ${status}`)
      })

    return () => {
      console.log(`[v0] Unsubscribing from Realtime channel: ${tableName}`)
      supabase.removeChannel(channel)
    }
  }, [open, planId, recipientType])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const tableName = recipientType === "client" ? "client_messages" : "affiliate_messages"

      const { data, error } = await supabase
        .from(tableName)
        .select("id, plan_id, sender_email, message, created_at")
        .eq("plan_id", planId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error(`[v0] Error loading messages:`, error)
        throw error
      }

      console.log(`[v0] Loaded ${data?.length || 0} messages for plan ${planId} (${recipientType})`)
      setMessages(data || [])
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        throw new Error("User email not found")
      }

      const tableName = recipientType === "client" ? "client_messages" : "affiliate_messages"

      const { data, error } = await supabase
        .from(tableName)
        .insert({
          plan_id: planId,
          sender_email: user.email,
          message: message.trim(),
        })
        .select()

      if (error) {
        console.error(`[v0] Error inserting message:`, error)
        throw error
      }

      console.log(`[v0] Message inserted into ${tableName}: id=${data[0]?.id}`)

      toast({
        title: "Message envoyé",
        description: `Votre message a été envoyé à ${recipientName}.`,
      })

      setMessage("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conversation avec {recipientName}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{recipientName}</span>
                {recipientEmail && <span className="text-muted-foreground">({recipientEmail})</span>}
              </div>
              {context && <span className="block text-sm mt-2 text-muted-foreground">{context}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div data-messages-container className="space-y-4 max-h-[400px] overflow-y-auto py-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message pour le moment</p>
            </div>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{msg.sender_email}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </CardContent>
              </Card>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-4 py-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="new-message">Nouveau message *</Label>
            <Textarea
              id="new-message"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Fermer
          </Button>
          <Button onClick={handleSendMessage} disabled={isSubmitting || !message.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
