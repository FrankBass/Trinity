import type { Entity, Pole } from "./types"

export const entities: Entity[] = [
  {
    id: "entity-1",
    name: "Trinity Demo Co",
    defaultCommissionPct: 20,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export const poles: Pole[] = [
  {
    id: "pole-1",
    entityId: "entity-1",
    name: "E-commerce",
    createdAt: "2024-01-15T00:00:00Z",
  },
]
