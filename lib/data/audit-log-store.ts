import { create } from "zustand"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "validate"
  | "reject"
  | "counter_proposal"
  | "assign"
  | "unassign"
  | "set_objectives"
  | "update_objectives"
  | "export"
  | "import"
  | "login"
  | "logout"

export type EntityType = "client" | "affiliate" | "campaign" | "plan" | "am" | "user" | "objective" | "system"

export interface AuditLog {
  id: string
  timestamp: string
  userId: number
  userName: string
  userRole: string
  action: AuditAction
  entityType: EntityType
  entityId: string | number
  entityName: string
  description: string
  changes?: {
    field: string
    before: any
    after: any
  }[]
  metadata?: Record<string, any>
}

interface AuditLogStore {
  logs: AuditLog[]
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void
  getLogsByEntity: (entityType: EntityType, entityId: string | number) => AuditLog[]
  getLogsByUser: (userId: number) => AuditLog[]
  getLogsByAction: (action: AuditAction) => AuditLog[]
  getLogsByDateRange: (startDate: string, endDate: string) => AuditLog[]
  getAllLogs: () => AuditLog[]
  clearLogs: () => void
}

export const useAuditLogStore = create<AuditLogStore>((set, get) => ({
  logs: [],

  addLog: (log) => {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 1000), // Keep last 1000 logs
    }))

    console.log("[v0] Audit log added:", newLog)
  },

  getLogsByEntity: (entityType, entityId) => {
    return get().logs.filter((log) => log.entityType === entityType && log.entityId === entityId)
  },

  getLogsByUser: (userId) => {
    return get().logs.filter((log) => log.userId === userId)
  },

  getLogsByAction: (action) => {
    return get().logs.filter((log) => log.action === action)
  },

  getLogsByDateRange: (startDate, endDate) => {
    return get().logs.filter((log) => {
      const logDate = new Date(log.timestamp)
      return logDate >= new Date(startDate) && logDate <= new Date(endDate)
    })
  },

  getAllLogs: () => {
    return get().logs
  },

  clearLogs: () => {
    set({ logs: [] })
  },
}))

// Helper function to create audit logs
export const createAuditLog = (
  action: AuditAction,
  entityType: EntityType,
  entityId: string | number,
  entityName: string,
  description: string,
  changes?: { field: string; before: any; after: any }[],
  metadata?: Record<string, any>,
) => {
  const userStore = require("@/lib/store/user-store").useUserStore.getState()
  const currentUser = userStore.user

  if (!currentUser) {
    console.warn("[v0] Cannot create audit log: No user logged in")
    return
  }

  useAuditLogStore.getState().addLog({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action,
    entityType,
    entityId,
    entityName,
    description,
    changes,
    metadata,
  })
}
