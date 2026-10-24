export type TicketCategory = "technique" | "commercial" | "administratif" | "autre"
export type TicketPriority = "basse" | "normale" | "haute" | "urgente"
export type TicketStatus = "ouvert" | "en_cours" | "resolu" | "ferme"

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: string
  message: string
  isInternal: boolean
  createdAt: Date
  attachments?: string[]
}

export interface TicketStatusChange {
  id: string
  ticketId: string
  userId: string
  userName: string
  fromStatus: TicketStatus
  toStatus: TicketStatus
  createdAt: Date
}

export interface Ticket {
  id: string
  number: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  createdBy: string
  createdByName: string
  createdByRole: string
  assignedTo?: string
  assignedToName?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
  messages: TicketMessage[]
  statusHistory: TicketStatusChange[]
}

class TicketsStore {
  private tickets: Ticket[] = []
  private listeners: Set<() => void> = new Set()
  private ticketCounter = 1

  constructor() {
    // Initialize with mock tickets
    this.tickets = [
      {
        id: "1",
        number: "TICK-2024-001",
        title: "Problème d'export Excel sur la page des commissions",
        description: "Lorsque j'essaie d'exporter les commissions en Excel, j'obtiens une erreur.",
        category: "technique",
        priority: "haute",
        status: "resolu",
        createdBy: "1",
        createdByName: "Jean Dupont",
        createdByRole: "Manager",
        assignedTo: "admin-1",
        assignedToName: "Admin Système",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        messages: [
          {
            id: "m1",
            ticketId: "1",
            userId: "1",
            userName: "Jean Dupont",
            userRole: "Manager",
            message: "Lorsque j'essaie d'exporter les commissions en Excel, j'obtiens une erreur.",
            isInternal: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          },
          {
            id: "m2",
            ticketId: "1",
            userId: "admin-1",
            userName: "Admin Système",
            userRole: "Admin",
            message: "Merci pour le signalement. Je vais regarder ça tout de suite.",
            isInternal: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30),
          },
          {
            id: "m3",
            ticketId: "1",
            userId: "admin-1",
            userName: "Admin Système",
            userRole: "Admin",
            message: "Bug identifié dans la fonction d'export. Correction en cours.",
            isInternal: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            id: "m4",
            ticketId: "1",
            userId: "admin-1",
            userName: "Admin Système",
            userRole: "Admin",
            message: "Le problème a été corrigé. Pouvez-vous tester à nouveau ?",
            isInternal: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          },
        ],
        statusHistory: [
          {
            id: "sh1",
            ticketId: "1",
            userId: "admin-1",
            userName: "Admin Système",
            fromStatus: "ouvert",
            toStatus: "en_cours",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30),
          },
          {
            id: "sh2",
            ticketId: "1",
            userId: "admin-1",
            userName: "Admin Système",
            fromStatus: "en_cours",
            toStatus: "resolu",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          },
        ],
      },
      {
        id: "2",
        number: "TICK-2024-002",
        title: "Question sur le calcul des commissions",
        description: "Comment sont calculées les commissions pour les affiliés de type 'Influenceur' ?",
        category: "commercial",
        priority: "normale",
        status: "en_cours",
        createdBy: "2",
        createdByName: "Sophie Martin",
        createdByRole: "AM",
        assignedTo: "pole-1",
        assignedToName: "Pierre Leroy",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        messages: [
          {
            id: "m5",
            ticketId: "2",
            userId: "2",
            userName: "Sophie Martin",
            userRole: "AM",
            message: "Comment sont calculées les commissions pour les affiliés de type 'Influenceur' ?",
            isInternal: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            id: "m6",
            ticketId: "2",
            userId: "pole-1",
            userName: "Pierre Leroy",
            userRole: "Pole Manager",
            message:
              "Les commissions pour les influenceurs sont calculées selon la grille de rémunération définie pour chaque client. Je vais vous envoyer la documentation.",
            isInternal: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
          },
        ],
        statusHistory: [
          {
            id: "sh3",
            ticketId: "2",
            userId: "pole-1",
            userName: "Pierre Leroy",
            fromStatus: "ouvert",
            toStatus: "en_cours",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
          },
        ],
      },
    ]
    this.ticketCounter = 3
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  getAll(): Ticket[] {
    return [...this.tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getById(id: string): Ticket | undefined {
    return this.tickets.find((t) => t.id === id)
  }

  getByStatus(status: TicketStatus): Ticket[] {
    return this.tickets.filter((t) => t.status === status).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getByCategory(category: TicketCategory): Ticket[] {
    return this.tickets
      .filter((t) => t.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getByUser(userId: string): Ticket[] {
    return this.tickets
      .filter((t) => t.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getAssignedTo(userId: string): Ticket[] {
    return this.tickets
      .filter((t) => t.assignedTo === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getOpenCount(): number {
    return this.tickets.filter((t) => t.status === "ouvert" || t.status === "en_cours").length
  }

  createTicket(
    ticket: Omit<Ticket, "id" | "number" | "createdAt" | "updatedAt" | "messages" | "statusHistory">,
  ): Ticket {
    const newTicket: Ticket = {
      ...ticket,
      id: Date.now().toString(),
      number: `TICK-2024-${String(this.ticketCounter++).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `m-${Date.now()}`,
          ticketId: "",
          userId: ticket.createdBy,
          userName: ticket.createdByName,
          userRole: ticket.createdByRole,
          message: ticket.description,
          isInternal: false,
          createdAt: new Date(),
        },
      ],
      statusHistory: [],
    }
    newTicket.messages[0].ticketId = newTicket.id
    this.tickets.unshift(newTicket)
    this.notify()
    return newTicket
  }

  addMessage(ticketId: string, message: Omit<TicketMessage, "id" | "ticketId" | "createdAt">): void {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    if (ticket) {
      const newMessage: TicketMessage = {
        ...message,
        id: `m-${Date.now()}`,
        ticketId,
        createdAt: new Date(),
      }
      ticket.messages.push(newMessage)
      ticket.updatedAt = new Date()
      this.notify()
    }
  }

  updateStatus(ticketId: string, newStatus: TicketStatus, userId: string, userName: string): void {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    if (ticket && ticket.status !== newStatus) {
      const statusChange: TicketStatusChange = {
        id: `sh-${Date.now()}`,
        ticketId,
        userId,
        userName,
        fromStatus: ticket.status,
        toStatus: newStatus,
        createdAt: new Date(),
      }
      ticket.statusHistory.push(statusChange)
      ticket.status = newStatus
      ticket.updatedAt = new Date()

      if (newStatus === "resolu") {
        ticket.resolvedAt = new Date()
      } else if (newStatus === "ferme") {
        ticket.closedAt = new Date()
      }

      this.notify()
    }
  }

  updatePriority(ticketId: string, newPriority: TicketPriority): void {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    if (ticket) {
      ticket.priority = newPriority
      ticket.updatedAt = new Date()
      this.notify()
    }
  }

  assignTicket(ticketId: string, assignedTo: string, assignedToName: string): void {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    if (ticket) {
      ticket.assignedTo = assignedTo
      ticket.assignedToName = assignedToName
      ticket.updatedAt = new Date()
      this.notify()
    }
  }
}

export const ticketsStore = new TicketsStore()
