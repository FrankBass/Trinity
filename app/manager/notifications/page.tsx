"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { notificationsStore, type Notification } from "@/lib/data/notifications-store"
import { useEffect, useState } from "react"
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Archive,
  ArchiveRestore,
  Trash2,
  Clock,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { SendMessageButton } from "@/components/messaging/send-message-button"

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [messageNotifications, setMessageNotifications] = useState<Notification[]>([])
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const updateNotifications = () => {
      setAllNotifications(notificationsStore.getAll().filter((n) => !n.archived))
      setUnreadNotifications(notificationsStore.getUnread())
      setMessageNotifications(notificationsStore.getMessages())
      setArchivedNotifications(notificationsStore.getArchived())
    }

    updateNotifications()
    const unsubscribe = notificationsStore.subscribe(updateNotifications)
    return unsubscribe
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_plan":
        return <Bell className="w-5 h-5 text-blue-500" />
      case "plan_validated":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "plan_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "plan_counter_proposal":
        return <Send className="w-5 h-5 text-amber-500" />
      case "objective_at_risk":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case "message":
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return timestamp.toLocaleDateString("fr-FR")
  }

  const handleMarkAsRead = (id: string) => {
    notificationsStore.markAsRead(id)
  }

  const handleArchive = (id: string) => {
    notificationsStore.archiveNotification(id)
    toast({
      title: "Notification archivée",
      description: "La notification a été déplacée dans les archives.",
    })
  }

  const handleRestore = (id: string) => {
    notificationsStore.restoreNotification(id)
    toast({
      title: "Notification restaurée",
      description: "La notification a été restaurée.",
    })
  }

  const handleDelete = (id: string) => {
    notificationsStore.deleteNotification(id)
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée définitivement.",
      variant: "destructive",
    })
  }

  const handleMarkAllAsRead = () => {
    notificationsStore.markAllAsRead()
    toast({
      title: "Toutes les notifications marquées comme lues",
    })
  }

  const renderNotification = (notification: Notification, showArchiveButton = true) => (
    <Card
      key={notification.id}
      className={`transition-colors ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
    >
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{notification.title}</h3>
                  {!notification.read && <Badge variant="default">Nouveau</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {notification.metadata?.context && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{notification.metadata.context}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={notification.link}>Voir les détails</Link>
                </Button>
                {notification.metadata?.canReply && notification.metadata?.senderName && (
                  <SendMessageButton
                    recipientId={notification.metadata.senderId || ""}
                    recipientName={notification.metadata.senderName}
                    recipientRole={notification.metadata.senderRole}
                    context={`Réponse à: ${notification.metadata.context || notification.title}`}
                    contextLink={notification.link}
                    variant="outline"
                    size="sm"
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Répondre
                    </Button>
                  </SendMessageButton>
                )}
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer comme lu
                  </Button>
                )}
                {showArchiveButton ? (
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(notification.id)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleRestore(notification.id)}>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Restaurer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Gérez toutes vos notifications et messages</p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non lues</CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allNotifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageNotifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archivées</CardTitle>
              <Archive className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archivedNotifications.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="unread" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unread">
              Non lues
              {unreadNotifications.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {messageNotifications.filter((n) => !n.read).length > 0 && (
                <Badge variant="default" className="ml-2">
                  {messageNotifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">Archivées</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification non lue</h3>
                    <p className="text-muted-foreground">Vous êtes à jour !</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map((notification) => renderNotification(notification))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                    <p className="text-muted-foreground">Vous n'avez pas encore de notifications</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              allNotifications.map((notification) => renderNotification(notification))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {messageNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
                    <p className="text-muted-foreground">Vous n'avez pas encore reçu de messages</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              messageNotifications.map((notification) => renderNotification(notification))
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            {archivedNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification archivée</h3>
                    <p className="text-muted-foreground">Les notifications archivées apparaîtront ici</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              archivedNotifications.map((notification) => renderNotification(notification, false))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
