export type PlanStatus =
  | "Draft"
  | "Submitted"
  | "InDiscussion"
  | "ValidatedAffiliate"
  | "PendingClient"
  | "ClientApproved"
  | "ClientRejected"

export type PlanVersion = {
  at: string // ISO
  by: "Affiliate" | "AM"
  changes: Array<
    | { field: "hdr_new"; from?: number; to: number }
    | { field: "hdr_old"; from?: number; to: number }
    | { field: "ff"; from?: number; to: number }
    | { field: "placements"; from?: string; to: string }
    | { field: "comment"; from?: string; to: string }
  >
}

export type Plan = {
  id: string
  opId: string
  affiliateEntity: string // ex "Poulpeo"
  date: string // ISO
  placements: string // multiline text
  hdr_new?: number // %
  hdr_old?: number // %
  ff?: number // €
  comment?: string
  status: PlanStatus
  versions: PlanVersion[]
}

export type Operation = {
  id: string // ex "op_srp_octrose"
  brand: string // "SRP FR"
  client: string // "Google"
  name: string // "Octobre Rose"
  start: string
  end: string // ISO
  details: string // texte mécanique
  allowedTypologies: string[] // ["Cashback", ...]
  caps: { ffMax: number; hdrMax: number }
  hdrBaseByTypology: Record<string, number> // { Cashback: 4, ... }
  hdrOldNew?: { baseNew: number; maxNew: number; baseOld: number; maxOld: number }
}

export type AffiliateContext = {
  typology: string // "Cashback"
  affiliateGroup?: string // "Playbicon"
  affiliateEntities: string[] // ["Poulpeo", "Ma Reduc"]
  currentEntity: string // "Google" (Trinity entité cible)
  portfolioClients: string[] // clients suivis par l'affilié
}
