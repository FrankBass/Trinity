import type { RemunerationGroup } from "./types"

export const REMU_GROUPS: RemunerationGroup[] = [
  {
    id: "rg_entity_cashback",
    scope: "entity",
    typology: "cashback",
    hdrBasePct: 5,
    hdrMaxPct: 5,
    feeMaxEur: 1200,
    active: true,
  },
  {
    id: "rg_client_srp_cashback",
    scope: "client",
    clientId: "cli_srp",
    typology: "cashback",
    hdrBasePct: 5,
    hdrMaxPct: 4,
    feeMaxEur: 2000,
    active: true,
  },
  {
    id: "rg_client_aff_srp_jean",
    scope: "client_affiliate",
    clientId: "cli_srp",
    affiliateId: "aff_jean",
    typology: "cashback",
    hdrBasePct: 5,
    hdrMaxPct: 4,
    feeMaxEur: 2000,
    active: true,
  },
]

export const remunerationGroups = REMU_GROUPS
