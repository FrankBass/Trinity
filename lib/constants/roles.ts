export const ROLES = {
  AFFILIATE: "affiliate",
  CLIENT: "client",
  AM: "am",
  MANAGER: "manager",
  POLE_MANAGER: "pole_manager",
  ENTITY_ADMIN: "entity_admin",
  OWNER: "owner",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.AFFILIATE]: "Affilié",
  [ROLES.CLIENT]: "Client",
  [ROLES.AM]: "Account Manager",
  [ROLES.MANAGER]: "Manager",
  [ROLES.POLE_MANAGER]: "Pole Manager",
  [ROLES.ENTITY_ADMIN]: "Admin Entité",
  [ROLES.OWNER]: "Trinity Owner",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.AFFILIATE]: 1,
  [ROLES.CLIENT]: 2,
  [ROLES.AM]: 3,
  [ROLES.MANAGER]: 4,
  [ROLES.POLE_MANAGER]: 5,
  [ROLES.ENTITY_ADMIN]: 6,
  [ROLES.OWNER]: 7,
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
