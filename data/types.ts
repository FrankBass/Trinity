// Types pour toutes les entités de données
export type UserRole = "affiliate" | "client" | "am" | "manager" | "pole_manager" | "admin" | "owner"

export type PlanStatus =
  | "Submitted"
  | "InDiscussion"
  | "ValidatedAffiliate"
  | "PendingClient"
  | "ClientOnHold"
  | "ClientApproved"
  | "ClientRejected"

export type OpMechanic = "cashback" | "code_promo" | "css" | "display"
export type AffiliateTypology = "cashback" | "code_promo" | "css" | "display" | "influencer"
export type RemuScope = "entity" | "client" | "client" | "client_affiliate"

export interface Entity {
  id: string
  name: string
  defaultCommissionPct: number
  createdAt: string
}

export interface Pole {
  id: string
  entityId: string
  name: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  entityId?: string
  poleId?: string
  managerId?: string
  avatar?: string
  createdAt: string
}

export interface Client {
  id: string
  entityId: string
  name: string
  amId: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Brand {
  id: string
  clientId: string
  name: string
  country: string
  createdAt: string
}

export interface Operation {
  id: string
  clientId: string
  brandId: string
  name: string
  startDate: string
  endDate: string
  status: "Upcoming" | "Active" | "Closed"
  mechanicsMd?: string
  allowedTypologies: string[]
  feeMaxEur?: number
  hdrMaxPct?: number
  nvxBasePct?: number
  ancBasePct?: number
}

export interface Affiliate {
  id: string
  entityId: string
  name: string
  typology: AffiliateTypology
  email: string
  status: "active" | "inactive"
  createdAt: string
}

export interface RemunerationGroup {
  id: string
  scope: "entity" | "client" | "op" | "client_affiliate"
  clientId?: string
  opId?: string
  affiliateId?: string
  typology?: string
  hdrBasePct?: number
  hdrMaxPct?: number
  feeMaxEur?: number
  active: boolean
}

export interface PlanVersion {
  at: string // ISO timestamp
  actorRole: "Affiliate" | "AM" | "Client"
  changes: {
    hdrPct?: [number, number] // [old, new]
    hdrPctNvx?: [number, number]
    hdrPctAnc?: [number, number]
    fixedFeeAffEur?: [number, number]
    comment?: string
  }
}

export interface Plan {
  id: string
  opId: string // renamed from operationId to opId
  clientId: string
  affiliateId: string
  placementText: string
  hdrPct?: number
  hdrPctNvx?: number
  hdrPctAnc?: number
  fixedFeeAffEur: number
  fileUrls: string[]
  status: PlanStatus
  versions: PlanVersion[]
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  clientId: string
  operationId: string
  amId: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "plan_update" | "client_decision" | "transfer" | "remu_change"
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}
