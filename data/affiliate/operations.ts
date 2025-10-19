import type { Operation } from "./types"

export const operations: Operation[] = [
  {
    id: "op_srp_octrose",
    brand: "SRP FR",
    client: "Google",
    name: "Octobre Rose",
    start: "2025-10-01",
    end: "2025-10-31",
    details: "Soutien Octobre Rose : mise en avant thématique, bannière HP, NL dédiées.",
    allowedTypologies: ["Cashback", "Code Promo", "CSS", "Contenu"],
    caps: { ffMax: 2000, hdrMax: 4 },
    hdrBaseByTypology: { Cashback: 4, "Code Promo": 2, CSS: 3, Contenu: 0 },
    hdrOldNew: { baseNew: 10, maxNew: 5, baseOld: 5, maxOld: 3 },
  },
  {
    id: "op_srp_back2school",
    brand: "SRP FR",
    client: "Google",
    name: "Back to School",
    start: "2025-08-15",
    end: "2025-09-15",
    details: "OP rentrée : catégories papeterie, mode, tech.",
    allowedTypologies: ["Cashback", "Code Promo"],
    caps: { ffMax: 1500, hdrMax: 3 },
    hdrBaseByTypology: { Cashback: 3, "Code Promo": 1 },
  },
]
