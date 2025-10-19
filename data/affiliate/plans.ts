import type { Plan } from "./types"

export const plansInitial: Plan[] = [
  {
    id: "pl_001",
    opId: "op_srp_octrose",
    affiliateEntity: "Poulpeo",
    date: "2025-10-02",
    placements: "Homepage carousel – 2 jours\nPush app – 1 bannière catégorie Mode",
    hdr_new: 5,
    ff: 800,
    status: "InDiscussion",
    versions: [
      {
        at: "2025-10-02T10:00:00Z",
        by: "Affiliate",
        changes: [
          { field: "hdr_new", to: 5 },
          { field: "ff", to: 800 },
        ],
      },
      {
        at: "2025-10-03T12:07:00Z",
        by: "AM",
        changes: [
          { field: "ff", from: 800, to: 600 },
          { field: "comment", to: "Budget limité S1" },
        ],
      },
    ],
  },
  {
    id: "pl_002",
    opId: "op_srp_octrose",
    affiliateEntity: "Poulpeo",
    date: "2025-10-04",
    placements: "Newsletter solo + post social…",
    hdr_new: 12,
    hdr_old: 6,
    ff: 0,
    status: "PendingClient",
    versions: [
      {
        at: "2025-10-04T09:00:00Z",
        by: "Affiliate",
        changes: [
          { field: "hdr_new", to: 12 },
          { field: "hdr_old", to: 6 },
        ],
      },
    ],
  },
  {
    id: "pl_003",
    opId: "op_srp_back2school",
    affiliateEntity: "Poulpeo",
    date: "2025-08-20",
    placements: "Catégorie lifestyle – 1 semaine – bloc top",
    hdr_new: 3,
    ff: 300,
    status: "ClientApproved",
    versions: [
      {
        at: "2025-08-20T08:00:00Z",
        by: "Affiliate",
        changes: [
          { field: "hdr_new", to: 3 },
          { field: "ff", to: 300 },
        ],
      },
      { at: "2025-08-22T16:00:00Z", by: "AM", changes: [{ field: "comment", to: "Validé + envoi client" }] },
    ],
  },
]

export const plans = plansInitial

// localStorage helper
const STORAGE_KEY = "trinity_affiliate_plans"

export function getPlans(): Plan[] {
  if (typeof window === "undefined") return plansInitial
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : plansInitial
}

export function savePlans(plans: Plan[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}
