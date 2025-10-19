import type { Client, Brand } from "./types"

export const clients: Client[] = [
  {
    id: "client-srp",
    entityId: "entity-1",
    name: "ShowroomPrivé",
    amId: "user-am-a",
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "client-bp",
    entityId: "entity-1",
    name: "BeautéPrivée",
    amId: "user-am-a",
    status: "active",
    createdAt: "2024-02-05T00:00:00Z",
  },
]

export const brands: Brand[] = [
  {
    id: "brand-srp-fr",
    clientId: "client-srp",
    name: "SRP FR",
    country: "FR",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "brand-srp-de",
    clientId: "client-srp",
    name: "SRP DE",
    country: "DE",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "brand-bp-fr",
    clientId: "client-bp",
    name: "BP FR",
    country: "FR",
    createdAt: "2024-02-05T00:00:00Z",
  },
  {
    id: "brand-bp-uk",
    clientId: "client-bp",
    name: "BP UK",
    country: "UK",
    createdAt: "2024-02-05T00:00:00Z",
  },
]
