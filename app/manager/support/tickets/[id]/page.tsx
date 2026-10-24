"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ticketsStore, type TicketStatus, type TicketPriority, type TicketCategory } from "@/lib/data/tickets-store"
import { notificationsStore } from "@/lib/data/notifications-store"
import { useUser } from "@/lib/store/user-store"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

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

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState(ticketsStore.getById(ticketId))
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = ticketsStore.subscribe(() => {
      setTicket(ticketsStore.getById(ticketId))
    })
    return unsubscribe
  }, [ticketId])

  if (!ticket || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Ticket non trouvé</p>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)

    try {
      ticketsStore.addMessage(ticket.id, {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        message: newMessage,
        isInternal,
      })

      // Notify ticket creator if message is not internal
      if (!isInternal && user.id !== ticket.createdBy) {
        notificationsStore.addNotification({
          type: "message",
          title: "Nouveau message sur votre ticket",
          message: `${user.name} a répondu à votre ticket ${ticket.number}`,
          userId: ticket.createdBy,
          metadata: {
            senderId: user.id,
            senderName: user.name,
            context: `Ticket ${ticket.number}`,
            ticketId: ticket.id,
          },
        })
      }

      toast({
        title: "Message envoyé",
        description: isInternal ? "Votre message interne a été ajouté." : "Votre message a été envoyé.",
      })

      setNewMessage("")
      setIsInternal(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = (newStatus: TicketStatus) => {
    ticketsStore.updateStatus(ticket.id, newStatus, user.id, user.name)

    // Notify ticket creator
    notificationsStore.addNotification({
      type: "info",
      title: "Statut du ticket mis à jour",
      message: `Le statut de votre ticket ${ticket.number} est maintenant : ${statusLabels[newStatus]}`,
      userId: ticket.createdBy,
      metadata: {
        ticketId: ticket.id,
      },
    })

    toast({
      title: "Statut mis à jour",
      description: `Le ticket est maintenant : ${statusLabels[newStatus]}`,
    })
  }

  const handlePriorityChange = (newPriority: TicketPriority) => {
    ticketsStore.updatePriority(ticket.id, newPriority)
    toast({
      title: "Priorité mise à jour",
      description: `La priorité est maintenant : ${priorityLabels[newPriority]}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{ticket.number}</h1>
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
            <Badge variant="outline" className={priorityColors[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </Badge>
          </div>
          <p className="text-muted-foreground">{ticket.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Historique des échanges sur ce ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.map((message, index) => (
                <div key={message.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">{message.userRole}</span>
                        {message.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Interne
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(message.createdAt).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label htmlFor="new-message">Ajouter un message</Label>
                <Textarea
                  id="new-message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(!!checked)}
                    />
                    <label
                      htmlFor="internal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message interne (visible uniquement par le support)
                    </label>
                  </div>
                  <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {ticket.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des changements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.statusHistory.map((change) => (
                    <div key={change.id} className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(change.createdAt).toLocaleString("fr-FR")}
                      </span>
                      <span>
                        {change.userName} a changé le statut de{" "}
                        <Badge variant="outline" className="mx-1">
                          {statusLabels[change.fromStatus]}
                        </Badge>
                        à
                        <Badge variant="outline" className="mx-1">
                          {statusLabels[change.toStatus]}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Catégorie</Label>
                <p className="font-medium">{categoryLabels[ticket.category]}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Créé par</Label>
                <p className="font-medium">{ticket.createdByName}</p>
                <p className="text-xs text-muted-foreground">{ticket.createdByRole}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Assigné à</Label>
                <p className="font-medium">{ticket.assignedToName || "Non assigné"}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Date de création</Label>
                <p className="font-medium">{new Date(ticket.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Dernière mise à jour</Label>
                <p className="font-medium">{new Date(ticket.updatedAt).toLocaleString("fr-FR")}</p>
              </div>
              {ticket.resolvedAt && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Résolu le</Label>
                    <p className="font-medium">{new Date(ticket.resolvedAt).toLocaleString("fr-FR")}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Changer le statut</Label>
                <Select value={ticket.status} onValueChange={(value) => handleStatusChange(value as TicketStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouvert">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ouvert
                      </div>
                    </SelectItem>
                    <SelectItem value="en_cours">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        En cours
                      </div>
                    </SelectItem>
                    <SelectItem value="resolu">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Résolu
                      </div>
                    </SelectItem>
                    <SelectItem value="ferme">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Fermé
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Changer la priorité</Label>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => handlePriorityChange(value as TicketPriority)}
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
