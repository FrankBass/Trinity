"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationsStore, type Notification } from "@/lib/data/notifications-store"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SendMessageButton } from "@/components/messaging/send-message-button"

const notificationIcons = {
  new_plan: "📋",
  plan_validated: "✅",
  plan_rejected: "❌",
  plan_counter_proposal: "🔄",
  objective_set: "🎯",
  objective_achieved: "🏆",
  objective_at_risk: "⚠️",
  message: "💬", // Added message icon
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "messages">("all")
  const router = useRouter()

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationsStore.getAll())
      setUnreadCount(notificationsStore.getUnreadCount())
    }

    updateNotifications()
    const unsubscribe = notificationsStore.subscribe(updateNotifications)

    return () => unsubscribe()
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    notificationsStore.markAsRead(notification.id)
    setOpen(false)
    router.push(notification.link)
  }

  const handleMarkAllAsRead = () => {
    notificationsStore.markAllAsRead()
  }

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    notificationsStore.deleteNotification(id)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "messages") return n.type === "message"
    return true
  })

  const messageCount = notifications.filter((n) => n.type === "message" && !n.read).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-2 border-b bg-muted/30">
          <Button
            variant={filterType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="h-7 text-xs flex-1"
          >
            Toutes
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={filterType === "messages" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("messages")}
            className="h-7 text-xs flex-1"
          >
            Messages
            {messageCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                {messageCount}
              </Badge>
            )}
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {filterType === "messages" ? "Aucun message" : "Aucune notification"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5",
                  )}
                >
                  <div className="text-2xl flex-shrink-0">{notificationIcons[notification.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                        {notification.title}
                      </p>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{notification.message}</p>

                    {notification.type === "message" && notification.metadata?.context && (
                      <p className="text-xs text-muted-foreground italic mb-1">
                        À propos de: {notification.metadata.context}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>

                      {notification.type === "message" &&
                        notification.metadata?.canReply &&
                        notification.metadata?.senderId && (
                          <SendMessageButton
                            recipientId={notification.metadata.senderId}
                            recipientName={notification.metadata.senderName || "Utilisateur"}
                            recipientRole={notification.metadata.senderRole}
                            context={notification.metadata.context}
                            contextLink={notification.link}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Répondre
                            </Button>
                          </SendMessageButton>
                        )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {filteredNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                notificationsStore.clearAll()
                setOpen(false)
              }}
            >
              Effacer toutes les notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
