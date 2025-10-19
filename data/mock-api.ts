import { entities, poles } from "./entities"
import { users } from "./users"
import { clients, brands } from "./clients"
import { operations } from "./operations"
import { affiliates } from "./affiliates"
import { remunerationGroups } from "./remuneration"
import { plans } from "./plans"
import { assignments } from "./assignments"
import { notifications } from "./notifications"
import type {
  Entity,
  Pole,
  User,
  Client,
  Brand,
  Operation,
  Affiliate,
  RemunerationGroup,
  Plan,
  Assignment,
  Notification,
  PlanStatus,
  AffiliateTypology,
} from "./types"

// Simulate API delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API class
export class MockAPI {
  // Entities
  static async getEntities(): Promise<Entity[]> {
    await delay()
    return entities
  }

  static async getEntity(id: string): Promise<Entity | undefined> {
    await delay()
    return entities.find((e) => e.id === id)
  }

  // Poles
  static async getPoles(entityId?: string): Promise<Pole[]> {
    await delay()
    return entityId ? poles.filter((p) => p.entityId === entityId) : poles
  }

  // Users
  static async getUsers(filters?: { role?: string; entityId?: string }): Promise<User[]> {
    await delay()
    let result = users
    if (filters?.role) result = result.filter((u) => u.role === filters.role)
    if (filters?.entityId) result = result.filter((u) => u.entityId === filters.entityId)
    return result
  }

  static async getUser(id: string): Promise<User | undefined> {
    await delay()
    return users.find((u) => u.id === id)
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    await delay()
    return users.find((u) => u.email === email)
  }

  // Clients
  static async getClients(filters?: { amId?: string; entityId?: string }): Promise<Client[]> {
    await delay()
    let result = clients
    if (filters?.amId) result = result.filter((c) => c.amId === filters.amId)
    if (filters?.entityId) result = result.filter((c) => c.entityId === filters.entityId)
    return result
  }

  static async getClient(id: string): Promise<Client | undefined> {
    await delay()
    return clients.find((c) => c.id === id)
  }

  // Brands
  static async getBrands(clientId?: string): Promise<Brand[]> {
    await delay()
    return clientId ? brands.filter((b) => b.clientId === clientId) : brands
  }

  static async getBrand(id: string): Promise<Brand | undefined> {
    await delay()
    return brands.find((b) => b.id === id)
  }

  // Operations
  static async getOperations(filters?: { brandId?: string; status?: string; clientId?: string }): Promise<Operation[]> {
    await delay()
    let result = operations
    if (filters?.brandId) result = result.filter((o) => o.brandId === filters.brandId)
    if (filters?.status) result = result.filter((o) => o.status === filters.status)
    if (filters?.clientId) {
      const clientBrands = brands.filter((b) => b.clientId === filters.clientId).map((b) => b.id)
      result = result.filter((o) => clientBrands.includes(o.brandId))
    }
    return result
  }

  static async getOperation(id: string): Promise<Operation | undefined> {
    await delay()
    return operations.find((o) => o.id === id)
  }

  // Affiliates
  static async getAffiliates(filters?: { entityId?: string; typology?: AffiliateTypology }): Promise<Affiliate[]> {
    await delay()
    let result = affiliates
    if (filters?.entityId) result = result.filter((a) => a.entityId === filters.entityId)
    if (filters?.typology) result = result.filter((a) => a.typology === filters.typology)
    return result
  }

  static async getAffiliate(id: string): Promise<Affiliate | undefined> {
    await delay()
    return affiliates.find((a) => a.id === id)
  }

  // Remuneration
  static async getRemunerationGroups(filters?: {
    entityId?: string
    clientId?: string
    affiliateId?: string
  }): Promise<RemunerationGroup[]> {
    await delay()
    let result = remunerationGroups
    if (filters?.entityId) result = result.filter((r) => r.entityId === filters.entityId)
    if (filters?.clientId) result = result.filter((r) => !r.clientId || r.clientId === filters.clientId)
    if (filters?.affiliateId) result = result.filter((r) => !r.affiliateId || r.affiliateId === filters.affiliateId)
    return result
  }

  // Plans
  static async getPlans(filters?: {
    operationId?: string
    affiliateId?: string
    status?: PlanStatus
    amId?: string
  }): Promise<Plan[]> {
    await delay()
    let result = plans

    if (filters?.operationId) result = result.filter((p) => p.operationId === filters.operationId)
    if (filters?.affiliateId) result = result.filter((p) => p.affiliateId === filters.affiliateId)
    if (filters?.status) result = result.filter((p) => p.status === filters.status)

    // Filter by AM through assignments
    if (filters?.amId) {
      const amAssignments = assignments.filter((a) => a.amId === filters.amId)
      const amOperationIds = amAssignments.map((a) => a.operationId)
      result = result.filter((p) => amOperationIds.includes(p.operationId))
    }

    return result
  }

  static async getPlan(id: string): Promise<Plan | undefined> {
    await delay()
    return plans.find((p) => p.id === id)
  }

  static async updatePlanStatus(id: string, status: PlanStatus): Promise<Plan | undefined> {
    await delay()
    const plan = plans.find((p) => p.id === id)
    if (plan) {
      plan.status = status
      plan.updatedAt = new Date().toISOString()
    }
    return plan
  }

  // Assignments
  static async getAssignments(filters?: { amId?: string; clientId?: string }): Promise<Assignment[]> {
    await delay()
    let result = assignments
    if (filters?.amId) result = result.filter((a) => a.amId === filters.amId)
    if (filters?.clientId) result = result.filter((a) => a.clientId === filters.clientId)
    return result
  }

  // Notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    await delay()
    return notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  static async markNotificationRead(id: string): Promise<void> {
    await delay()
    const notif = notifications.find((n) => n.id === id)
    if (notif) notif.read = true
  }

  static async markAllNotificationsRead(userId: string): Promise<void> {
    await delay()
    notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true))
  }

  // Helper: Get commission for a plan
  static async getCommissionForPlan(planId: string): Promise<number> {
    await delay()
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return 20 // default

    const operation = operations.find((o) => o.id === plan.operationId)
    if (!operation) return 20

    // Check if operation has override
    if (operation.commissionOpOverridePct) return operation.commissionOpOverridePct

    const brand = brands.find((b) => b.id === operation.brandId)
    if (!brand) return 20

    const client = clients.find((c) => c.id === brand.clientId)
    if (!client) return 20

    const affiliate = affiliates.find((a) => a.id === plan.affiliateId)
    if (!affiliate) return 20

    // Priority: client_affiliate > client > entity
    const clientAffiliateRemu = remunerationGroups.find(
      (r) => r.scope === "client_affiliate" && r.clientId === client.id && r.affiliateId === affiliate.id,
    )
    if (clientAffiliateRemu) return clientAffiliateRemu.commissionPct

    const clientRemu = remunerationGroups.find(
      (r) => r.scope === "client" && r.clientId === client.id && r.typology === affiliate.typology,
    )
    if (clientRemu) return clientRemu.commissionPct

    const entityRemu = remunerationGroups.find(
      (r) => r.scope === "entity" && r.entityId === client.entityId && r.typology === affiliate.typology,
    )
    if (entityRemu) return entityRemu.commissionPct

    return 20 // fallback
  }
}

export const mockAPI = {
  // Entities
  listEntities: () => entities,
  getEntity: (id: string) => entities.find((e) => e.id === id),

  // Poles
  listPoles: (entityId?: string) => (entityId ? poles.filter((p) => p.entityId === entityId) : poles),
  getPole: (id: string) => poles.find((p) => p.id === id),

  // Users
  listUsers: (filters?: { role?: string; entityId?: string }) => {
    let result = users
    if (filters?.role) result = result.filter((u) => u.role === filters.role)
    if (filters?.entityId) result = result.filter((u) => u.entityId === filters.entityId)
    return result
  },
  getUser: (id: string) => users.find((u) => u.id === id),
  getUserByEmail: (email: string) => users.find((u) => u.email === email),

  // Clients
  listClients: (filters?: { amId?: string; entityId?: string }) => {
    let result = clients
    if (filters?.amId) result = result.filter((c) => c.amId === filters.amId)
    if (filters?.entityId) result = result.filter((c) => c.entityId === filters.entityId)
    return result
  },
  getClient: (id: string) => clients.find((c) => c.id === id),

  // Brands
  listBrands: (clientId?: string) => (clientId ? brands.filter((b) => b.clientId === clientId) : brands),
  getBrand: (id: string) => brands.find((b) => b.id === id),

  // Operations
  listOperations: (filters?: { brandId?: string; status?: string; clientId?: string }) => {
    let result = operations
    if (filters?.brandId) result = result.filter((o) => o.brandId === filters.brandId)
    if (filters?.status) result = result.filter((o) => o.status === filters.status)
    if (filters?.clientId) {
      const clientBrands = brands.filter((b) => b.clientId === filters.clientId).map((b) => b.id)
      result = result.filter((o) => clientBrands.includes(o.brandId))
    }
    return result
  },
  getOperation: (id: string) => operations.find((o) => o.id === id),

  // Affiliates
  listAffiliates: (filters?: { entityId?: string; typology?: AffiliateTypology }) => {
    let result = affiliates
    if (filters?.entityId) result = result.filter((a) => a.entityId === filters.entityId)
    if (filters?.typology) result = result.filter((a) => a.typology === filters.typology)
    return result
  },
  getAffiliate: (id: string) => affiliates.find((a) => a.id === id),

  // Remuneration
  listRemunerationGroups: (filters?: { entityId?: string; clientId?: string; affiliateId?: string }) => {
    let result = remunerationGroups
    if (filters?.entityId) result = result.filter((r) => r.entityId === filters.entityId)
    if (filters?.clientId) result = result.filter((r) => !r.clientId || r.clientId === filters.clientId)
    if (filters?.affiliateId) result = result.filter((r) => !r.affiliateId || r.affiliateId === filters.affiliateId)
    return result
  },

  // Plans
  listPlans: (filters?: { operationId?: string; affiliateId?: string; status?: PlanStatus; amId?: string }) => {
    let result = plans

    if (filters?.operationId) result = result.filter((p) => p.operationId === filters.operationId)
    if (filters?.affiliateId) result = result.filter((p) => p.affiliateId === filters.affiliateId)
    if (filters?.status) result = result.filter((p) => p.status === filters.status)

    if (filters?.amId) {
      const amAssignments = assignments.filter((a) => a.amId === filters.amId)
      const amOperationIds = amAssignments.map((a) => a.operationId)
      result = result.filter((p) => amOperationIds.includes(p.operationId))
    }

    return result
  },
  getPlan: (id: string) => plans.find((p) => p.id === id),
  updatePlanStatus: (id: string, status: PlanStatus) => {
    const plan = plans.find((p) => p.id === id)
    if (plan) {
      plan.status = status
      plan.updatedAt = new Date().toISOString()
    }
    return plan
  },

  // Assignments
  listAssignments: (filters?: { amId?: string; clientId?: string }) => {
    let result = assignments
    if (filters?.amId) result = result.filter((a) => a.amId === filters.amId)
    if (filters?.clientId) result = result.filter((a) => a.clientId === filters.clientId)
    return result
  },

  // Notifications
  listNotifications: (userId: string) =>
    notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  markNotificationRead: (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    if (notif) notif.read = true
  },
  markAllNotificationsRead: (userId: string) => {
    notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true))
  },

  // Helper: Get commission for a plan
  getCommissionForPlan: (planId: string): number => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return 20

    const operation = operations.find((o) => o.id === plan.operationId)
    if (!operation) return 20

    if (operation.commissionOpOverridePct) return operation.commissionOpOverridePct

    const brand = brands.find((b) => b.id === operation.brandId)
    if (!brand) return 20

    const client = clients.find((c) => c.id === brand.clientId)
    if (!client) return 20

    const affiliate = affiliates.find((a) => a.id === plan.affiliateId)
    if (!affiliate) return 20

    const clientAffiliateRemu = remunerationGroups.find(
      (r) => r.scope === "client_affiliate" && r.clientId === client.id && r.affiliateId === affiliate.id,
    )
    if (clientAffiliateRemu) return clientAffiliateRemu.commissionPct

    const clientRemu = remunerationGroups.find(
      (r) => r.scope === "client" && r.clientId === client.id && r.typology === affiliate.typology,
    )
    if (clientRemu) return clientRemu.commissionPct

    const entityRemu = remunerationGroups.find(
      (r) => r.scope === "entity" && r.entityId === client.entityId && r.typology === affiliate.typology,
    )
    if (entityRemu) return entityRemu.commissionPct

    return 20
  },
}
