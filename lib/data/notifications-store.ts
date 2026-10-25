export type NotificationType =
  | "new_plan"
  | "plan_validated"
  | "plan_rejected"
  | "plan_counter_proposal"
  | "objective_set"
  | "objective_achieved"
  | "objective_at_risk"
  | "message"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string
  read: boolean
  timestamp: Date
  archived?: boolean // Added archived field
  metadata?: {
    amId?: number
    planId?: number
    campaignId?: number
    affiliateId?: number
    senderId?: string
    senderName?: string
    senderRole?: string
    context?: string
    canReply?: boolean
  }
}

class NotificationsStore {
  private notifications: Notification[] = []
  private listeners: Set<() => void> = new Set()

  constructor() {
    // Initialize with some mock notifications for demo
    this.notifications = [
      {
        id: "1",
        type: "new_plan",
        title: "Nouveau plan soumis",
        message: "Marie Laurent a soumis un plan pour la campagne Black Friday 2024",
        link: "/manager/plans/1",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        metadata: { amId: 1, planId: 1, campaignId: 1, affiliateId: 1 },
      },
      {
        id: "2",
        type: "plan_counter_proposal",
        title: "Contre-proposition reçue",
        message: "Sophie Martin a fait une contre-proposition sur le plan TechCorp",
        link: "/manager/plans/2",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        metadata: { amId: 1, planId: 2 },
      },
      {
        id: "3",
        type: "objective_at_risk",
        title: "Objectif en danger",
        message: "Thomas Dubois n'a atteint que 45% de son objectif mensuel",
        link: "/manager/ams/2",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        metadata: { amId: 2 },
      },
      {
        id: "4",
        type: "plan_validated",
        title: "Plan validé",
        message: "Le plan de StartupXYZ a été validé avec succès",
        link: "/manager/plans/3",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        metadata: { planId: 3 },
      },
      {
        id: "5",
        type: "message",
        title: "Message de Jean Dupont",
        message: "Bonjour, peux-tu mettre à jour le plan TechCorp ?",
        link: "/manager/plans/1",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        metadata: {
          senderId: "1",
          senderName: "Jean Dupont",
          senderRole: "Manager",
          context: "À propos du plan TechCorp - Black Friday 2024",
          canReply: true,
        },
      },
    ]
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  getAll(): Notification[] {
    return [...this.notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getUnread(): Notification[] {
    return this.notifications.filter((n) => !n.read && !n.archived)
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read && !n.archived).length
  }

  getArchived(): Notification[] {
    return this.notifications.filter((n) => n.archived).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getMessages(): Notification[] {
    return this.notifications
      .filter((n) => n.type === "message" && !n.archived)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.notify()
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      if (!n.archived) n.read = true
    })
    this.notify()
  }

  archiveNotification(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.archived = true
      notification.read = true
      this.notify()
    }
  }

  restoreNotification(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.archived = false
      this.notify()
    }
  }

  addNotification(notification: Omit<Notification, "id" | "timestamp">): void {
    const user = useUserStore.getState().user
    const prefs = user?.notificationPreferences

    if (prefs) {
      // Check if user wants this type of notification
      if (notification.type === "new_plan" && !prefs.newPlans) return
      if (notification.type === "objective_at_risk" && !prefs.performanceAlerts) return
      if (notification.type === "message" && !prefs.messageNotifications) return
    }

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    this.notifications.unshift(newNotification)
    this.notify()
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notify()
  }

  clearAll(): void {
    this.notifications = []
    this.notify()
  }
}

export const notificationsStore = new NotificationsStore()

import { useUserStore } from "@/lib/store/user-store"
