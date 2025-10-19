// lib/aff-db.ts
// === Mock utilisateur affilié (front-only) ===
export type Typology = "cashback" | "code_promo" | "css" | "content"

export const AFF_USER = {
  id: "aff_jean",
  name: "Jean Dupont",
  typology: "cashback" as Typology,
  // Structure affiliée : "entite" = une seule entité ; "groupe" = un groupe avec plusieurs entités affiliées
  structures: {
    mode: "entite" as "groupe" | "entite",
    groupName: "PlayBeacon" as string | null,
    entities: ["Poulpeo", "Ma Reduc", "eBuyClub"], // utilisé si mode === "groupe"
  },
  // Entité Trinity (cliente) sélectionnée côté contexte
  currentEntity: { id: "entity_google", name: "Google" },
  // Entité affiliée active pour la soumission (utile quand mode === "groupe")
  currentAffiliateEntity: "Poulpeo",
}

// === Types front-only ===
export type OPStatus = "Upcoming" | "Active" | "Closed"
export type OP = {
  id: string
  brandId: string
  brandName: string
  entityId: string
  entityName: string
  name: string
  startDate: string
  endDate: string
  status: OPStatus
  mechanicsMd?: string
  allowedTypologies: Typology[]
  feeMaxEur: number
  hdrMaxPct: number
  nvxBasePct?: number
  ancBasePct?: number
}

export type PlanStatus =
  | "Submitted"
  | "InDiscussion"
  | "ValidatedAffiliate"
  | "PendingClient"
  | "ClientOnHold"
  | "ClientApproved"
  | "ClientRejected"

export type PlanVersion = {
  at: string
  actor: "Affiliate" | "AM" | "Client"
  changes: {
    hdrPct?: [number, number]
    hdrPctNvx?: [number, number]
    hdrPctAnc?: [number, number]
    fixedFeeAffEur?: [number, number]
    comment?: string
  }
}

export type Plan = {
  id: string
  opId: string
  opName: string
  brandName: string
  entityId: string // Entité Trinity (cliente)
  affiliateId: string
  affiliateName: string
  affiliateEntity?: string // Entité affiliée utilisée pour cette soumission (si groupe)
  typology: Typology
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
  isDraft?: boolean
}

export type Notif = {
  id: string
  type: "op_news" | "plan_update" | "client_decision"
  title: string
  body: string
  at: string
  read: boolean
  deepLink: string
}

// === Fixtures (front-only) ===
export const OPS: OP[] = [
  {
    id: "op_srp_octrose",
    brandId: "brand_srp_fr",
    brandName: "SRP FR",
    entityId: "entity_google",
    entityName: "Google",
    name: "Octobre Rose",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    status: "Active",
    mechanicsMd: "Carrousel home + NL solidaire.",
    allowedTypologies: ["cashback", "code_promo", "css"],
    feeMaxEur: 2000,
    hdrMaxPct: 4,
    nvxBasePct: 10,
    ancBasePct: 5,
  },
  {
    id: "op_bp_blackfriday",
    brandId: "brand_bp_fr",
    brandName: "BP FR",
    entityId: "entity_google",
    entityName: "Google",
    name: "Black Friday Pré-chauffe",
    startDate: "2025-11-15",
    endDate: "2025-11-28",
    status: "Upcoming",
    mechanicsMd: "Home hero + topsellers",
    allowedTypologies: ["cashback", "css"],
    feeMaxEur: 3000,
    hdrMaxPct: 6,
    nvxBasePct: 12,
    ancBasePct: 6,
  },
  {
    id: "op_srp_bts",
    brandId: "brand_srp_fr",
    brandName: "SRP FR",
    entityId: "entity_google",
    entityName: "Google",
    name: "Back to School",
    startDate: "2025-08-20",
    endDate: "2025-09-10",
    status: "Closed",
    mechanicsMd: "Catégorie scolaire",
    allowedTypologies: ["code_promo", "content"],
    feeMaxEur: 1500,
    hdrMaxPct: 3,
  },
]

export const PLANS_FIX: Plan[] = [
  {
    id: "pl_001",
    opId: "op_srp_octrose",
    opName: "Octobre Rose",
    brandName: "SRP FR",
    entityId: "entity_google",
    affiliateId: "aff_jean",
    affiliateName: "Jean Dupont",
    affiliateEntity: "Poulpeo",
    typology: "cashback",
    placementText: "Homepage carousel – 2 jours\nPush app – 1 jour",
    hdrPct: 5,
    fixedFeeAffEur: 800,
    fileUrls: [],
    status: "InDiscussion",
    versions: [
      {
        at: "2025-10-02T10:00:00Z",
        actor: "Affiliate",
        changes: { comment: "Proposition initiale", hdrPct: [5, 5], fixedFeeAffEur: [800, 800] },
      },
      { at: "2025-10-03T09:00:00Z", actor: "AM", changes: { fixedFeeAffEur: [800, 600], comment: "600€ max budget" } },
    ],
    createdAt: "2025-10-02T10:00:00Z",
    updatedAt: "2025-10-03T09:00:00Z",
  },
  {
    id: "pl_002",
    opId: "op_srp_octrose",
    opName: "Octobre Rose",
    brandName: "SRP FR",
    entityId: "entity_google",
    affiliateId: "aff_jean",
    affiliateName: "Jean Dupont",
    affiliateEntity: "Ma Reduc",
    typology: "cashback",
    placementText: "Newsletter solo + post social",
    hdrPctNvx: 12,
    hdrPctAnc: 6,
    fixedFeeAffEur: 0,
    fileUrls: [],
    status: "PendingClient",
    versions: [
      {
        at: "2025-10-04T11:00:00Z",
        actor: "Affiliate",
        changes: { hdrPctNvx: [10, 12], hdrPctAnc: [5, 6], comment: "Demande +2/+1" },
      },
      { at: "2025-10-04T15:20:00Z", actor: "AM", changes: { comment: "OK pour envoyer client" } },
    ],
    createdAt: "2025-10-04T11:00:00Z",
    updatedAt: "2025-10-04T15:20:00Z",
  },
  {
    id: "pl_003",
    opId: "op_srp_bts",
    opName: "Back to School",
    brandName: "SRP FR",
    entityId: "entity_google",
    affiliateId: "aff_jean",
    affiliateName: "Jean Dupont",
    affiliateEntity: "eBuyClub",
    typology: "cashback",
    placementText: "Catégorie lifestyle – 1 semaine",
    hdrPct: 3,
    fixedFeeAffEur: 300,
    fileUrls: [],
    status: "ClientApproved",
    versions: [{ at: "2025-08-22T08:00:00Z", actor: "Client", changes: { comment: "Validé" } }],
    createdAt: "2025-08-20T09:00:00Z",
    updatedAt: "2025-08-22T08:00:00Z",
  },
]

export const NOTIFS_FIX: Notif[] = [
  {
    id: "n1",
    type: "plan_update",
    title: "Contre-proposition AM",
    body: "FF baissé à 600€",
    at: "2025-10-03T09:00:00Z",
    read: false,
    deepLink: "/affiliate/op/op_srp_octrose#history",
  },
  {
    id: "n2",
    type: "client_decision",
    title: "Plan validé",
    body: "Back to School approuvé",
    at: "2025-08-22T08:00:00Z",
    read: true,
    deepLink: "/affiliate/op/op_srp_bts#history",
  },
  {
    id: "n3",
    type: "op_news",
    title: "Nouvelle OP disponible",
    body: "BP FR — Black Friday Pré-chauffe",
    at: "2025-11-01T08:00:00Z",
    read: true,
    deepLink: "/affiliate/brand/brand_bp_fr",
  },
]

// === Persistance front-only ===
const LS_PLANS = "trinity_aff_plans"
const LS_NOTIFS = "trinity_aff_notifs"
const LS_PORTFOLIO = "trinity_aff_portfolio"

function readLS<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = window.localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLS<T>(k: string, v: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(k, JSON.stringify(v))
}

export function getPlans(): Plan[] {
  return [...PLANS_FIX, ...readLS<Plan[]>(LS_PLANS, [])]
}
export function upsertPlan(p: Plan) {
  const ls = readLS<Plan[]>(LS_PLANS, [])
  const i = ls.findIndex((x) => x.id === p.id)
  if (i > -1) ls[i] = p
  else ls.unshift(p)
  writeLS(LS_PLANS, ls)
}
export function upsertManyPlans(list: Plan[]) {
  const ls = readLS<Plan[]>(LS_PLANS, [])
  list.forEach((p) => {
    const i = ls.findIndex((x) => x.id === p.id)
    if (i > -1) ls[i] = p
    else ls.unshift(p)
  })
  writeLS(LS_PLANS, ls)
}
export function deletePlan(id: string) {
  const ls = readLS<Plan[]>(LS_PLANS, []).filter((x) => x.id !== id)
  writeLS(LS_PLANS, ls)
}
export function getNotifs(): Notif[] {
  return [...NOTIFS_FIX, ...readLS<Notif[]>(LS_NOTIFS, [])]
}
export function setNotifs(n: Notif[]) {
  writeLS(LS_NOTIFS, n)
}

// === Portfolio (front-only) ===
export function getPortfolio(): string[] {
  return readLS<string[]>(LS_PORTFOLIO, [])
}
export function addToPortfolio(brandId: string) {
  const s = new Set(getPortfolio()); s.add(brandId); writeLS(LS_PORTFOLIO, [...s])
}
export function removeFromPortfolio(brandId: string) {
  const s = new Set(getPortfolio()); s.delete(brandId); writeLS(LS_PORTFOLIO, [...s])
}

// === Helpers front ===
export function opsForCurrentEntity() {
  return OPS.filter((o) => o.entityId === AFF_USER.currentEntity.id && o.allowedTypologies.includes(AFF_USER.typology))
}
export function plansForAffiliateByOp(opId: string) {
  return getPlans().filter((p) => p.opId === opId && p.affiliateId === AFF_USER.id)
}
export function plansForAffiliate() {
  return getPlans().filter(
    (p) =>
      p.affiliateId === AFF_USER.id && OPS.some((o) => o.id === p.opId && o.entityId === AFF_USER.currentEntity.id),
  )
}

export function canEditPlan(plan: Plan, op: OP): boolean {
  if (plan.status === "ClientApproved") return false
  if (op.status !== "Active") return false
  return true
}
export function canAddPlan(op: OP): boolean {
  // Autoriser l’ajout même si d’anciens plans sont validés ; bloqué uniquement si OP fermée
  return op.status === "Active"
}

// Recherche globale (simple)
export function searchClientsAndOps(query: string): { brands: { brandId: string; brandName: string }[]; ops: OP[] } {
  const q = query.trim().toLowerCase()
  if (!q) return { brands: [], ops: [] }
  const brandSet = new Map<string, string>()
  OPS.forEach((op) => {
    if (op.entityId !== AFF_USER.currentEntity.id) return
    if (!op.allowedTypologies.includes(AFF_USER.typology)) return
    if (op.brandName.toLowerCase().includes(q)) brandSet.set(op.brandId, op.brandName)
  })
  const ops = OPS.filter(
    (op) =>
      op.entityId === AFF_USER.currentEntity.id &&
      op.allowedTypologies.includes(AFF_USER.typology) &&
      (op.name.toLowerCase().includes(q) || op.brandName.toLowerCase().includes(q)),
  )
  return { brands: [...brandSet.entries()].map(([brandId, brandName]) => ({ brandId, brandName })), ops }
}
