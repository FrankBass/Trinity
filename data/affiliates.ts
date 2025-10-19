import type { Affiliate } from "./types"

export const affiliates: Affiliate[] = [
  {
    id: "affiliate-igral",
    entityId: "entity-1",
    name: "IGRAL",
    typology: "cashback",
    email: "contact@igral.com",
    status: "active",
    createdAt: "2024-02-10T00:00:00Z",
  },
  {
    id: "affiliate-mr",
    entityId: "entity-1",
    name: "MaReduc",
    typology: "code_promo",
    email: "contact@mareduc.com",
    status: "active",
    createdAt: "2024-02-11T00:00:00Z",
  },
  {
    id: "affiliate-css",
    entityId: "entity-1",
    name: "CSSPro",
    typology: "css",
    email: "contact@csspro.com",
    status: "active",
    createdAt: "2024-02-12T00:00:00Z",
  },
]
