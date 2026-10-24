// Global search store for aggregating all searchable entities
export interface SearchableEntity {
  id: string
  type: "client" | "affiliate" | "campaign" | "plan" | "am"
  title: string
  subtitle?: string
  description?: string
  status?: string
  link: string
  metadata?: Record<string, any>
}

class SearchStore {
  private entities: SearchableEntity[] = []

  // Initialize with mock data (in production, this would fetch from API/database)
  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Clients
    this.entities.push(
      {
        id: "1",
        type: "client",
        title: "TechCorp",
        subtitle: "Technologie",
        description: "Entreprise de technologie B2B",
        status: "Actif",
        link: "/manager/clients/1",
        metadata: { revenue: "2.5M€", plans: 15 },
      },
      {
        id: "2",
        type: "client",
        title: "StartupXYZ",
        subtitle: "E-commerce",
        description: "Plateforme e-commerce innovante",
        status: "Actif",
        link: "/manager/clients/2",
        metadata: { revenue: "1.8M€", plans: 8 },
      },
      {
        id: "3",
        type: "client",
        title: "MegaRetail",
        subtitle: "Retail",
        description: "Chaîne de magasins nationale",
        status: "Actif",
        link: "/manager/clients/3",
        metadata: { revenue: "5.2M€", plans: 22 },
      },
    )

    // Affiliates
    this.entities.push(
      {
        id: "1",
        type: "affiliate",
        title: "Marie Laurent",
        subtitle: "Influenceuse Tech",
        description: "Spécialiste produits technologiques",
        status: "Actif",
        link: "/manager/affiliates/1",
        metadata: { followers: "250K", conversionRate: "3.2%" },
      },
      {
        id: "2",
        type: "affiliate",
        title: "Pierre Dubois",
        subtitle: "Blogueur E-commerce",
        description: "Expert en shopping en ligne",
        status: "Actif",
        link: "/manager/affiliates/2",
        metadata: { followers: "180K", conversionRate: "2.8%" },
      },
      {
        id: "3",
        type: "affiliate",
        title: "Sophie Martin",
        subtitle: "YouTubeuse Lifestyle",
        description: "Contenu lifestyle et shopping",
        status: "Actif",
        link: "/manager/affiliates/3",
        metadata: { followers: "420K", conversionRate: "4.1%" },
      },
    )

    // Campaigns
    this.entities.push(
      {
        id: "1",
        type: "campaign",
        title: "Black Friday 2024",
        subtitle: "TechCorp",
        description: "Campagne promotionnelle Black Friday",
        status: "En cours",
        link: "/manager/campaigns/1",
        metadata: { startDate: "2024-11-15", endDate: "2024-11-30", plans: 12 },
      },
      {
        id: "2",
        type: "campaign",
        title: "Lancement Produit Q1",
        subtitle: "StartupXYZ",
        description: "Lancement nouvelle gamme de produits",
        status: "Planifiée",
        link: "/manager/campaigns/2",
        metadata: { startDate: "2025-01-15", endDate: "2025-03-31", plans: 8 },
      },
      {
        id: "3",
        type: "campaign",
        title: "Campagne d'été 2024",
        subtitle: "MegaRetail",
        description: "Promotions estivales",
        status: "Terminée",
        link: "/manager/campaigns/3",
        metadata: { startDate: "2024-06-01", endDate: "2024-08-31", plans: 18 },
      },
    )

    // Plans
    this.entities.push(
      {
        id: "1",
        type: "plan",
        title: "Plan Marie Laurent - Black Friday",
        subtitle: "TechCorp × Marie Laurent",
        description: "Promotion produits tech Black Friday",
        status: "Validé",
        link: "/manager/plans/1",
        metadata: { fraisFixes: "1008€", hdr: "12%", campaign: "Black Friday 2024" },
      },
      {
        id: "2",
        type: "plan",
        title: "Plan Pierre Dubois - Lancement Q1",
        subtitle: "StartupXYZ × Pierre Dubois",
        description: "Lancement nouvelle gamme e-commerce",
        status: "En attente",
        link: "/manager/plans/2",
        metadata: { fraisFixes: "850€", hdr: "10%", campaign: "Lancement Produit Q1" },
      },
      {
        id: "3",
        type: "plan",
        title: "Plan Sophie Martin - Été 2024",
        subtitle: "MegaRetail × Sophie Martin",
        description: "Promotions estivales lifestyle",
        status: "Validé",
        link: "/manager/plans/3",
        metadata: { fraisFixes: "1200€", hdr: "15%", campaign: "Campagne d'été 2024" },
      },
    )

    // Account Managers
    this.entities.push(
      {
        id: "1",
        type: "am",
        title: "Sophie Martin",
        subtitle: "Account Manager",
        description: "Gère 12 clients et 45 affiliés",
        status: "Actif",
        link: "/manager/ams/1",
        metadata: { clients: 12, affiliates: 45, revenue: "2.8M€" },
      },
      {
        id: "2",
        type: "am",
        title: "Thomas Dubois",
        subtitle: "Account Manager",
        description: "Gère 8 clients et 32 affiliés",
        status: "Actif",
        link: "/manager/ams/2",
        metadata: { clients: 8, affiliates: 32, revenue: "1.9M€" },
      },
    )
  }

  // Search across all entities
  search(query: string, filters?: { type?: string[]; status?: string[] }): SearchableEntity[] {
    if (!query && !filters) return []

    let results = this.entities

    // Apply type filter
    if (filters?.type && filters.type.length > 0) {
      results = results.filter((entity) => filters.type!.includes(entity.type))
    }

    // Apply status filter
    if (filters?.status && filters.status.length > 0) {
      results = results.filter((entity) => entity.status && filters.status!.includes(entity.status))
    }

    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(
        (entity) =>
          entity.title.toLowerCase().includes(lowerQuery) ||
          entity.subtitle?.toLowerCase().includes(lowerQuery) ||
          entity.description?.toLowerCase().includes(lowerQuery),
      )
    }

    return results
  }

  // Get all entities of a specific type
  getByType(type: SearchableEntity["type"]): SearchableEntity[] {
    return this.entities.filter((entity) => entity.type === type)
  }

  // Get entity by ID and type
  getById(id: string, type: SearchableEntity["type"]): SearchableEntity | undefined {
    return this.entities.find((entity) => entity.id === id && entity.type === type)
  }
}

export const searchStore = new SearchStore()
