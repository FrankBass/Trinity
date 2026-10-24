import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Settings,
  UserCircle,
  Briefcase,
  Target,
  BarChart3,
  Shield,
  Store,
  Bell,
  History,
  ClipboardList,
  DollarSign,
  CreditCard,
  FolderOpen,
  FileSignature,
  Mail,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/lib/store/user-store"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// Navigation items for each role
export const navigationConfig: Record<UserRole, NavGroup[]> = {
  affiliate: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/affiliate",
          icon: LayoutDashboard,
        },
        {
          title: "Mes Enseignes",
          href: "/affiliate/brands",
          icon: Store,
        },
        {
          title: "Historique",
          href: "/affiliate/history",
          icon: History,
        },
        {
          title: "Notifications",
          href: "/affiliate/notifications",
          icon: Bell,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Profil",
          href: "/affiliate/profile",
          icon: UserCircle,
        },
        {
          title: "Paramètres",
          href: "/affiliate/settings",
          icon: Settings,
        },
      ],
    },
  ],
  client: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/client",
          icon: LayoutDashboard,
        },
        {
          title: "Mes Campagnes",
          href: "/client/campaigns",
          icon: Target,
        },
        {
          title: "Affiliés",
          href: "/client/affiliates",
          icon: Users,
        },
        {
          title: "Rapports",
          href: "/client/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Profil",
          href: "/client/profile",
          icon: UserCircle,
        },
        {
          title: "Paramètres",
          href: "/client/settings",
          icon: Settings,
        },
      ],
    },
  ],
  am: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/am",
          icon: LayoutDashboard,
        },
        {
          title: "Mes Affiliés",
          href: "/am/affiliates",
          icon: Users,
        },
        {
          title: "Mes Clients",
          href: "/am/clients",
          icon: Building2,
        },
        {
          title: "Performance",
          href: "/am/performance",
          icon: TrendingUp,
        },
        {
          title: "Rapports",
          href: "/am/reports",
          icon: FileText,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Profil",
          href: "/am/profile",
          icon: UserCircle,
        },
        {
          title: "Paramètres",
          href: "/am/settings",
          icon: Settings,
        },
      ],
    },
  ],
  manager: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/manager",
          icon: LayoutDashboard,
        },
        {
          title: "Account Managers",
          href: "/manager/ams",
          icon: Briefcase,
        },
        {
          title: "Affiliés",
          href: "/manager/affiliates",
          icon: Users,
        },
        {
          title: "Clients",
          href: "/manager/clients",
          icon: Building2,
        },
        {
          title: "Campagnes",
          href: "/manager/campaigns",
          icon: Target,
        },
        {
          title: "Plans",
          href: "/manager/plans",
          icon: ClipboardList,
        },
        {
          title: "Objectifs",
          href: "/manager/objectifs",
          icon: TrendingUp,
        },
        {
          title: "Performance",
          href: "/manager/performance",
          icon: BarChart3,
        },
        {
          title: "Rapports",
          href: "/manager/reports",
          icon: FileText,
        },
        {
          title: "Activité",
          href: "/manager/activity",
          icon: History,
        },
        {
          title: "Notifications",
          href: "/manager/notifications",
          icon: Bell,
        },
        {
          title: "Support",
          href: "/manager/support/tickets",
          icon: LifeBuoy,
        },
      ],
    },
    {
      label: "Financier",
      items: [
        {
          title: "Commissions",
          href: "/manager/commissions",
          icon: DollarSign,
        },
        {
          title: "Récapitulatif",
          href: "/manager/recapitulatif",
          icon: CreditCard,
        },
      ],
    },
    {
      label: "Documents",
      items: [
        {
          title: "Kit Média Affilié",
          href: "/manager/media-kits",
          icon: FolderOpen,
        },
        {
          title: "Contrats",
          href: "/manager/contracts",
          icon: FileSignature,
        },
        {
          title: "Templates d'Emails",
          href: "/manager/email-templates",
          icon: Mail,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Profil",
          href: "/manager/profile",
          icon: UserCircle,
        },
        {
          title: "Paramètres",
          href: "/manager/settings",
          icon: Settings,
        },
      ],
    },
  ],
  pole_manager: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/pole",
          icon: LayoutDashboard,
        },
        {
          title: "Managers",
          href: "/pole/managers",
          icon: Shield,
        },
        {
          title: "Account Managers",
          href: "/pole/ams",
          icon: Briefcase,
        },
        {
          title: "Vue d'ensemble",
          href: "/pole/overview",
          icon: BarChart3,
        },
        {
          title: "Performance",
          href: "/pole/performance",
          icon: TrendingUp,
        },
        {
          title: "Rapports",
          href: "/pole/reports",
          icon: FileText,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Profil",
          href: "/pole/profile",
          icon: UserCircle,
        },
        {
          title: "Paramètres",
          href: "/pole/settings",
          icon: Settings,
        },
      ],
    },
  ],
  admin: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Pôles",
          href: "/admin/poles",
          icon: Building2,
        },
        {
          title: "Managers",
          href: "/admin/managers",
          icon: Shield,
        },
        {
          title: "Utilisateurs",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: "Performance Globale",
          href: "/admin/performance",
          icon: TrendingUp,
        },
        {
          title: "Rapports",
          href: "/admin/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "Configuration",
          href: "/admin/config",
          icon: Settings,
        },
        {
          title: "Profil",
          href: "/admin/profile",
          icon: UserCircle,
        },
      ],
    },
  ],
  owner: [
    {
      label: "Principal",
      items: [
        {
          title: "Tableau de bord",
          href: "/owner",
          icon: LayoutDashboard,
        },
        {
          title: "Entités",
          href: "/owner/entities",
          icon: Building2,
        },
        {
          title: "Tous les Utilisateurs",
          href: "/owner/users",
          icon: Users,
        },
        {
          title: "Performance Globale",
          href: "/owner/performance",
          icon: TrendingUp,
        },
        {
          title: "Rapports Consolidés",
          href: "/owner/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "Configuration Système",
          href: "/owner/system",
          icon: Settings,
        },
        {
          title: "Sécurité",
          href: "/owner/security",
          icon: Shield,
        },
        {
          title: "Profil",
          href: "/owner/profile",
          icon: UserCircle,
        },
      ],
    },
  ],
}

export const managerNavItems = navigationConfig.manager
