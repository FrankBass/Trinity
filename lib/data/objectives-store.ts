export type ObjectivePeriod = {
  type: "monthly" | "quarterly" | "custom"
  startDate: string
  endDate: string
  label: string
}

export type ObjectiveMetric = {
  target: number
  current: number
}

export type AMObjectives = {
  amId: number
  amName: string
  period: ObjectivePeriod
  metrics: {
    margeBrute: ObjectiveMetric
    depenses: ObjectiveMetric
  }
  createdAt: string
  createdBy: string
}

export type ObjectiveHistory = {
  id: string
  amId: number
  amName: string
  period: ObjectivePeriod
  metrics: {
    margeBrute: { target: number; achieved: number }
    depenses: { target: number; achieved: number }
  }
  status: "achieved" | "partial" | "missed"
  completedAt: string
}

// Simulated global store (in a real app, use Context API, Redux, or Zustand)
class ObjectivesStore {
  private currentObjectives: Map<string, AMObjectives> = new Map() // Changed from Map<number, ...> to Map<string, ...>
  private history: ObjectiveHistory[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Objectives will be set when manager defines them

    // History with past objectives
    this.history = [
      {
        id: "1",
        amId: 1,
        amName: "Sophie Martin",
        period: {
          type: "monthly",
          startDate: "2024-12-01",
          endDate: "2024-12-31",
          label: "Décembre 2024",
        },
        metrics: {
          margeBrute: { target: 10000, achieved: 11200 },
          depenses: { target: 50000, achieved: 52000 },
        },
        status: "achieved",
        completedAt: "2024-12-31T23:59:59Z",
      },
      {
        id: "2",
        amId: 1,
        amName: "Sophie Martin",
        period: {
          type: "quarterly",
          startDate: "2024-10-01",
          endDate: "2024-12-31",
          label: "Q4 2024",
        },
        metrics: {
          margeBrute: { target: 30000, achieved: 28500 },
          depenses: { target: 150000, achieved: 142000 },
        },
        status: "partial",
        completedAt: "2024-12-31T23:59:59Z",
      },
      {
        id: "3",
        amId: 2,
        amName: "Thomas Dubois",
        period: {
          type: "monthly",
          startDate: "2024-11-01",
          endDate: "2024-11-30",
          label: "Novembre 2024",
        },
        metrics: {
          margeBrute: { target: 8000, achieved: 6500 },
          depenses: { target: 40000, achieved: 35000 },
        },
        status: "missed",
        completedAt: "2024-11-30T23:59:59Z",
      },
    ]
  }

  private getObjectiveKey(amId: number, periodType: string): string {
    return `${amId}-${periodType}`
  }

  getCurrentObjectives(amId: number, periodType?: string): AMObjectives | null {
    if (periodType) {
      return this.currentObjectives.get(this.getObjectiveKey(amId, periodType)) || null
    }
    // Return first found objective for this AM
    const monthlyKey = this.getObjectiveKey(amId, "monthly")
    return this.currentObjectives.get(monthlyKey) || null
  }

  getAllCurrentObjectives(): AMObjectives[] {
    return Array.from(this.currentObjectives.values())
  }

  setObjectives(objectives: AMObjectives): void {
    const key = this.getObjectiveKey(objectives.amId, objectives.period.type)
    this.currentObjectives.set(key, objectives)
    console.log("[v0] Objectives saved:", objectives)
  }

  updateProgress(amId: number, periodType: string, margeBruteCurrent: number, depensesCurrent: number): void {
    const key = this.getObjectiveKey(amId, periodType)
    const objectives = this.currentObjectives.get(key)
    if (objectives) {
      objectives.metrics.margeBrute.current = margeBruteCurrent
      objectives.metrics.depenses.current = depensesCurrent
      this.currentObjectives.set(key, objectives)
    }
  }

  getHistory(amId?: number): ObjectiveHistory[] {
    if (amId) {
      return this.history.filter((h) => h.amId === amId)
    }
    return this.history
  }

  addToHistory(history: ObjectiveHistory): void {
    this.history.unshift(history)
  }

  resetObjectives(amId: number, periodType?: string): void {
    if (periodType) {
      const key = this.getObjectiveKey(amId, periodType)
      const objectives = this.currentObjectives.get(key)
      if (objectives) {
        objectives.metrics.margeBrute.current = 0
        objectives.metrics.depenses.current = 0
        this.currentObjectives.set(key, objectives)
      }
    } else {
      // Reset both monthly and quarterly
      ;["monthly", "quarterly"].forEach((type) => {
        const key = this.getObjectiveKey(amId, type)
        const objectives = this.currentObjectives.get(key)
        if (objectives) {
          objectives.metrics.margeBrute.current = 0
          objectives.metrics.depenses.current = 0
          this.currentObjectives.set(key, objectives)
        }
      })
    }
  }
}

export const objectivesStore = new ObjectivesStore()

// Helper function to get objectives for display
export function getAMObjectivesForDisplay(amId: number) {
  const monthly = objectivesStore.getCurrentObjectives(amId, "monthly")
  const quarterly = objectivesStore.getCurrentObjectives(amId, "quarterly")

  return {
    monthly: monthly
      ? {
          margeBrute: monthly.metrics.margeBrute,
          depenses: monthly.metrics.depenses,
        }
      : { margeBrute: { target: 0, current: 0 }, depenses: { target: 0, current: 0 } },
    quarterly: quarterly
      ? {
          margeBrute: quarterly.metrics.margeBrute,
          depenses: quarterly.metrics.depenses,
        }
      : { margeBrute: { target: 0, current: 0 }, depenses: { target: 0, current: 0 } },
  }
}
