export type OPStatus = "Upcoming" | "Active" | "Closed"

export type OP = {
  id: string
  clientId: string
  clientName: string
  brandId: string
  brandName: string
  name: string
  startDate: string
  endDate: string
  status: OPStatus
  mechanicsMd?: string
  allowedTypologies: string[]
  feeMaxEur: number
  hdrMaxPct: number
  nvxBasePct?: number
  ancBasePct?: number
  commissionOpOverridePct?: number
}

export const OPS: OP[] = [
  {
    id: "op_srp_octrose",
    clientId: "cli_srp",
    clientName: "ShowroomPrivé",
    brandId: "brand_srp_fr",
    brandName: "SRP FR",
    name: "Octobre Rose",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    status: "Active",
    mechanicsMd: "Mise en avant carrousel + newsletter thème solidaire.",
    allowedTypologies: ["cashback", "code_promo", "css"],
    feeMaxEur: 2000,
    hdrMaxPct: 4,
    nvxBasePct: 10,
    ancBasePct: 5,
    commissionOpOverridePct: 25,
  },
  {
    id: "op_bp_blackfriday",
    clientId: "cli_bp",
    clientName: "Beauté Privée",
    brandId: "brand_bp_fr",
    brandName: "BP FR",
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
    id: "op_srp_backtoschool",
    clientId: "cli_srp",
    clientName: "ShowroomPrivé",
    brandId: "brand_srp_fr",
    brandName: "SRP FR",
    name: "Back to School",
    startDate: "2025-08-20",
    endDate: "2025-09-10",
    status: "Closed",
    mechanicsMd: "Catégorie Scolaire",
    allowedTypologies: ["code_promo", "content"],
    feeMaxEur: 1500,
    hdrMaxPct: 3,
  },
]
