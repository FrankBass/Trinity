"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Download,
  ChevronDown,
  Calendar,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { notificationsStore } from "@/lib/data/notifications-store"
import * as XLSX from "xlsx"
import { SendMessageButton } from "@/components/messaging/send-message-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { getAMWithDetails, getAccountManagerById, getAllAccountManagers } from "@/lib/supabase/queries/ams"
import { updateAccountManager } from "@/lib/supabase/queries/account-managers"
import { getClientsByAM } from "@/lib/supabase/queries/clients"
import { getPlansByAM, updatePlanStatus } from "@/lib/supabase/queries/plans"
import { getAffiliatesByAM } from "@/lib/supabase/queries/affiliates"
import { getCampaigns } from "@/lib/supabase/queries/campaigns"
import { createDelegation, getDelegationsByAM, deleteDelegation } from "@/lib/supabase/queries/delegations"
import { createBrowserClient } from "@/lib/supabase/client"

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

function AMDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const [am, setAm] = useState<any>(null)
  const [amStats, setAmStats] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [allAMs, setAllAMs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [amData, setAmData] = useState<any>(null)
  const [objectives, setObjectives] = useState<any>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "Paris, France",
    role: "Junior Account Manager",
    status: "active",
    transferToManagerId: "",
  })

  const [objectivesForm, setObjectivesForm] = useState({
    monthlyMargeBrute: 0,
    monthlyDepenses: 0,
    quarterlyMargeBrute: 0,
    quarterlyDepenses: 0,
  })

  const [delegationForm, setDelegationForm] = useState({
    managerId: "",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [showDelegationDialog, setShowDelegationDialog] = useState(false)
  const [delegations, setDelegations] = useState<any[]>([])
  const [isDeletingDelegation, setIsDeletingDelegation] = useState<string | null>(null)

  const [planStatusFilter, setPlanStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const PLANS_PER_PAGE = 10

  const [isSaving, setIsSaving] = useState(false)
  const [isSavingObjectives, setIsSavingObjectives] = useState(false)

  const [quickValidatePlan, setQuickValidatePlan] = useState<string | null>(null)
  const [quickRejectPlan, setQuickRejectPlan] = useState<string | null>(null)
  const [isQuickValidating, setIsQuickValidating] = useState(false)

  const [privateNotes, setPrivateNotes] = useState("")
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const [messages, setMessages] = useState<any[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)

  // Add state for dismissed alerts
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateLong = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateWithTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Helper to format campaign dates for plan display
  const formatCampaignDates = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return "Dates non spécifiées"
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  // Fetch all data on mount
  useEffect(() => {
    async function loadAMData() {
      try {
        if (!isValidUUID(id)) {
          console.error("[v0] Invalid UUID detected:", id)
          toast({
            title: "Identifiant invalide",
            description: "L'identifiant fourni n'est pas un UUID valide.",
            variant: "destructive",
          })
          setIsLoading(false)
          setAmData(null)
          setObjectives(null)
          return
        }

        // Fetch all necessary data in parallel
        const [amData, amStatsData, plansData, clientsData, affiliatesData, campaignsData, allAMsData] =
          await Promise.all([
            getAccountManagerById(id),
            getAMWithDetails(id),
            getPlansByAM(id),
            getClientsByAM(id),
            getAffiliatesByAM(id),
            getCampaigns(), // Fetch all campaigns to potentially use in other contexts
            getAllAccountManagers(),
          ])

        setAm(amData)
        setAmStats(amStatsData)
        setPlans(plansData)
        setClients(clientsData)
        setAffiliates(affiliatesData)
        setCampaigns(campaignsData)
        setAllAMs(allAMsData)

        const delegationsData = await getDelegationsByAM(id)
        setDelegations(delegationsData)

        const { data: notesData, error: notesError } = await supabase
          .from("am_private_notes")
          .select("notes")
          .eq("am_id", id)
          .single()

        if (notesData) {
          setPrivateNotes(notesData.notes || "")
        }
        setIsLoadingNotes(false)

        if (amData && amStatsData) {
          // Calculate performance metrics
          const performance = amStatsData.plans_validated > 0 ? "+15%" : "N/A" // This needs to be dynamic based on history

          const computedAmData = {
            id: amData.id,
            name: amData.name,
            email: amData.email,
            phone: amData.phone,
            role: amData.level === "senior" ? "Senior Account Manager" : "Junior Account Manager",
            location: amData.location || "Paris, France",
            joinDate: amData.join_date,
            clients: clientsData.length,
            affiliates: affiliatesData.length,
            depenseClient: amStatsData.depense_client_validated || 0,
            margebrute: amStatsData.notre_marge_validated || 0,
            margeEnAttente: plansData
              .filter((p: any) => p.status === "pending" || p.status === "proposed")
              .reduce((sum, p: any) => sum + (p.notre_marge || 0), 0),
            performance: performance,
            status: "excellent", // This seems like a placeholder, should be derived from stats
            plansEnCours: (amStatsData.plans_total || 0) - (amStatsData.plans_validated || 0),
            plansValides: amStatsData.plans_validated || 0,
            plansRejetes: 0, // Needs to be fetched or calculated
            amStatus: amData.status || "active", // Use the status directly from amData
          }

          setAmData(computedAmData)

          console.log(`[v0] Loaded AM from Supabase: ${amData.name} with ${clientsData.length} clients`)

          // Initialize edit form with current AM data
          setEditForm({
            name: computedAmData.name,
            email: computedAmData.email,
            phone: computedAmData.phone,
            location: computedAmData.location,
            role: computedAmData.role,
            status: computedAmData.amStatus,
            transferToManagerId: "", // Default empty
          })

          // Initialize objectives
          const monthlyObjective = amData.monthly_objective || 10000 // Default if not set
          const quarterlyObjective = monthlyObjective * 3 // Quarterly is 3x monthly

          setObjectives({
            monthly: {
              margeBrute: {
                target: monthlyObjective,
                current: amStatsData.notre_marge_validated || 0, // Assuming validated stats reflect current performance
                label: "Marge brute mensuelle",
              },
              depenses: {
                // Assuming 'depense_client_validated' relates to expenses for reporting
                target: monthlyObjective * 5, // Example target, adjust as needed
                current: amStatsData.depense_client_validated || 0,
                label: "Dépenses client",
              },
            },
            quarterly: {
              margeBrute: {
                target: quarterlyObjective,
                current: amStatsData.notre_marge_validated || 0, // Assuming validated stats reflect current performance
                label: "Marge brute trimestrielle",
              },
              depenses: {
                target: quarterlyObjective * 5, // Example target, adjust as needed
                current: amStatsData.depense_client_validated || 0,
                label: "Dépenses client",
              },
            },
          })

          // Initialize objectives form with initial objectives
          setObjectivesForm({
            monthlyMargeBrute: monthlyObjective,
            monthlyDepenses: monthlyObjective * 5,
            quarterlyMargeBrute: quarterlyObjective,
            quarterlyDepenses: quarterlyObjective * 5,
          })
        }
      } catch (error) {
        console.error("[v0] Error loading AM data:", error)
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données depuis Supabase.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadAMData()
  }, [id, toast])

  useEffect(() => {
    async function loadMessages() {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("am_id", id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (!error && data) {
          setMessages(data)
        }
      } catch (error) {
        console.error("[v0] Error loading messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }
    loadMessages()
  }, [id])

  // Memoize objectives history calculation
  const objectivesHistory = useMemo(() => {
    if (!amData) return []

    // Simplified history generation based on available data for now
    // In a real app, this would fetch historical objective data from the database
    if (amData.plansValides === 0) {
      return []
    }

    const amCampaigns = campaigns.filter((c) => clients.some((client) => client.id === c.client_id))

    const clientNames = clients.map((c) => c.name)
    const campaignNames = amCampaigns.map((c) => c.name)

    // Placeholder data for historical objectives
    return [
      {
        id: 1,
        period: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString("fr-FR", {
          month: "long",
          year: "numeric",
        }),
        periodType: "monthly" as const,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split("T")[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split("T")[0],
        objectives: {
          margeBrute: { target: 10000, achieved: Math.round(amData.margebrute * 0.9) }, // Example: 90% of current margin
          depenses: { target: 50000, achieved: Math.round(amData.depenseClient * 0.9) }, // Example
        },
        status: "achieved" as const, // Example status
        clients: clientNames,
        campaigns: campaignNames.slice(0, 2), // Show first 2 campaigns
      },
      {
        id: 2,
        period: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`, // Current quarter
        periodType: "quarterly" as const,
        startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0)
          .toISOString()
          .split("T")[0],
        objectives: {
          margeBrute: { target: 30000, achieved: Math.round(amData.margebrute * 0.85) }, // Example: 85%
          depenses: { target: 150000, achieved: Math.round(amData.depenseClient * 0.85) }, // Example
        },
        status: "partial" as const, // Example status
        clients: clientNames,
        campaigns: campaignNames,
      },
    ]
  }, [id, amData, clients, campaigns]) // Dependencies for memoization

  const benchmarkingData = useMemo(() => {
    if (!amStats || !allAMs || allAMs.length === 0) return null

    const activeAMs = allAMs.filter((a) => a.status === "active" && a.id !== id)
    if (activeAMs.length === 0) return null

    const avgMargin = activeAMs.reduce((sum, a) => sum + (a.monthly_objective || 0), 0) / activeAMs.length
    const currentMargin = amStats.notre_marge_validated || 0
    const avgPlansValidated =
      activeAMs.reduce((sum, a) => {
        const amPlans = plans.filter((p) => p.account_manager_id === a.id && p.status === "approved")
        return sum + amPlans.length
      }, 0) / activeAMs.length

    const currentPlansValidated = plans.filter((p) => p.status === "approved").length

    const ranking =
      allAMs
        .filter((a) => a.status === "active")
        .sort((a, b) => {
          const aPlans = plans.filter((p) => p.account_manager_id === a.id && p.status === "approved")
          const bPlans = plans.filter((p) => p.account_manager_id === b.id && p.status === "approved")
          return bPlans.length - aPlans.length
        })
        .findIndex((a) => a.id === id) + 1

    return {
      avgMargin,
      currentMargin,
      avgPlansValidated,
      currentPlansValidated,
      ranking,
      totalAMs: activeAMs.length + 1,
      performanceVsAvg: avgMargin > 0 ? ((currentMargin - avgMargin) / avgMargin) * 100 : 0,
    }
  }, [amStats, allAMs, plans, id])

  const campaignTimeline = useMemo(() => {
    if (!plans || plans.length === 0) return []

    const campaignMap = new Map()

    plans.forEach((plan) => {
      if (!plan.campaign_id || !plan.campaign) return

      const campaignId = plan.campaign_id
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: plan.campaign.name || "Campaign sans nom",
          client: plan.client?.name || "Client inconnu",
          plans: [],
          startDate: plan.created_at,
          endDate: plan.created_at,
          totalRevenue: 0,
          status: "active",
        })
      }

      const campaign = campaignMap.get(campaignId)
      campaign.plans.push(plan)

      if (new Date(plan.created_at) < new Date(campaign.startDate)) {
        campaign.startDate = plan.created_at
      }
      if (new Date(plan.created_at) > new Date(campaign.endDate)) {
        campaign.endDate = plan.created_at
      }

      if (plan.notre_marge) {
        campaign.totalRevenue += Number.parseFloat(plan.notre_marge)
      }
    })

    return Array.from(campaignMap.values()).sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    )
  }, [plans])

  if (isLoading || !amData || !objectives) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-5 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Chargement des données de l'Account Manager...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleSaveObjectives = async () => {
    setIsSavingObjectives(true)
    try {
      const amId = Number.parseInt(id)
      const am = { id: amId, name: amData.name }

      // Save objectives to local storage as a history (this should ideally be in DB)
      if (typeof window !== "undefined") {
        const objectivesKey = `objectives-${amId}`
        const existingObjectives = JSON.parse(localStorage.getItem(objectivesKey) || "[]")

        // Add current monthly objective
        existingObjectives.push({
          amId,
          amName: am.name,
          period: {
            type: "monthly",
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
            label: new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" }),
          },
          metrics: {
            margeBrute: { target: objectivesForm.monthlyMargeBrute, current: objectives.monthly.margeBrute.current },
            depenses: { target: objectivesForm.monthlyDepenses, current: objectives.monthly.depenses.current },
          },
          createdAt: new Date().toISOString(),
          createdBy: "Manager",
        })

        // Add current quarterly objective
        existingObjectives.push({
          amId,
          amName: am.name,
          period: {
            type: "quarterly",
            startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)
              .toISOString()
              .split("T")[0],
            endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0)
              .toISOString()
              .split("T")[0],
            label: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
          },
          metrics: {
            margeBrute: {
              target: objectivesForm.quarterlyMargeBrute,
              current: objectives.quarterly.margeBrute.current,
            },
            depenses: { target: objectivesForm.quarterlyDepenses, current: objectives.quarterly.depenses.current },
          },
          createdAt: new Date().toISOString(),
          createdBy: "Manager",
        })

        localStorage.setItem(objectivesKey, JSON.JSON.stringify(existingObjectives))
      }

      // Update the objectives state with new targets
      setObjectives({
        monthly: {
          margeBrute: { ...objectives.monthly.margeBrute, target: objectivesForm.monthlyMargeBrute },
          depenses: { ...objectives.monthly.depenses, target: objectivesForm.monthlyDepenses },
        },
        quarterly: {
          margeBrute: { ...objectives.quarterly.margeBrute, target: objectivesForm.quarterlyMargeBrute },
          depenses: { ...objectives.quarterly.depenses, target: objectivesForm.quarterlyDepenses },
        },
      })

      // Add notification
      if (typeof window !== "undefined") {
        notificationsStore.addNotification({
          type: "objective_set",
          title: "Objectifs définis",
          message: `Les objectifs de ${amData.name} ont été mis à jour avec succès`,
          link: `/manager/ams/${id}`,
          read: false,
          metadata: { amId },
        })
      }

      setIsObjectivesOpen(false) // Close the dialog

      toast({
        title: "Objectifs mis à jour",
        description: "Les nouveaux objectifs ont été enregistrés avec succès.",
      })
    } catch (error) {
      console.error("[v0] Error saving objectives:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les objectifs.",
        variant: "destructive",
      })
    } finally {
      setIsSavingObjectives(false)
    }
  }

  // Helper to calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    const safeCurrent = Number.isFinite(current) ? current : 0
    const safeTarget = Number.isFinite(target) ? target : 0
    if (!safeTarget || safeTarget === 0) return 0
    return Math.min((safeCurrent / safeTarget) * 100, 100)
  }

  // Helper to determine progress bar color
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-emerald-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  // Helper to get status icon based on progress
  const getStatusIcon = (progress: number) => {
    if (progress >= 100) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    if (progress < 50) return <AlertTriangle className="w-4 h-4 text-red-500" />
    return null
  }

  // Handler for saving edited AM profile
  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      await updateAccountManager(id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
        level: editForm.role === "Senior Account Manager" ? "senior" : "junior",
        status: editForm.status as any,
      })

      // Update local state after successful save
      setAmData({ ...amData, ...editForm, amStatus: editForm.status })
      setIsEditOpen(false)

      toast({
        title: "Modifications enregistrées",
        description: "Les informations de l'AM ont été mises à jour.",
      })
    } catch (error) {
      console.error("[v0] Error saving AM:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handler for creating a new delegation
  const handleSaveDelegation = async () => {
    try {
      const result = await createDelegation(
        id,
        delegationForm.managerId,
        delegationForm.startDate,
        delegationForm.endDate,
      )

      if (result) {
        setShowDelegationDialog(false) // Close dialog

        // Refresh delegations list
        const delegationsData = await getDelegationsByAM(id)
        setDelegations(delegationsData)

        toast({
          title: "Délégation créée",
          description: `Accès temporaire accordé jusqu'au ${new Date(delegationForm.endDate).toLocaleDateString("fr-FR")}`,
        })

        // Reset delegation form
        setDelegationForm({
          managerId: "",
          startDate: "",
          endDate: "",
          reason: "",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer la délégation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating delegation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  // Handler for revoking a delegation
  const handleRevokeDelegation = async (delegationId: string) => {
    setIsDeletingDelegation(delegationId)
    try {
      const success = await deleteDelegation(delegationId)

      if (success) {
        // Refresh delegations list
        const delegationsData = await getDelegationsByAM(id)
        setDelegations(delegationsData)

        toast({
          title: "Délégation révoquée",
          description: "L'accès temporaire a été supprimé",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de révoquer la délégation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error revoking delegation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsDeletingDelegation(null)
    }
  }

  // Process clients to include calculated revenue and plan counts
  const clientsWithCalculatedRevenue = clients.map((client) => {
    const clientPlans = plans.filter((p: any) => p.client_id === client.id && p.status === "approved")
    const revenue = clientPlans.reduce((sum, p: any) => sum + (p.depense_client || 0), 0)

    return {
      id: client.id,
      name: client.name,
      revenue,
      plans: clientPlans.length,
      status: client.status, // Assuming client has a status field
    }
  })

  // Process plans for display in the plans tab
  const allPlans_redeclaration_fix = plans.map((plan: any) => {
    const depenseClient = plan.depense_client || 0
    const gainAffiliate = plan.fixed_fee || 0 // Assuming fixed_fee is gainAffiliate
    const marge = depenseClient - gainAffiliate // Calculate margin

    return {
      id: plan.id,
      campaign: plan.campaign?.name || plan.campaign_name || "Campagne sans nom", // Use relation if available
      campaignDates: `${formatDate(plan.start_date)} - ${formatDate(plan.end_date)}`, // Formatted dates
      client: plan.client?.name || "Client non assigné", // Use relation if available
      client_id: plan.client_id,
      affiliate: plan.affiliate?.name || "Affilié non assigné", // Use relation if available
      gainAffiliate,
      depenseClient,
      marge,
      status: plan.status,
      date: plan.proposed_at || plan.created_at, // Use proposed_at or created_at as submission date
      validated_at: plan.validated_at,
      // Add plan type and HDR percentage if available
      type: plan.plan_type,
      hdr_pct: plan.hdr_pct,
    }
  })

  // Enhance recent activity data for display
  const enhancedRecentActivity = allPlans_redeclaration_fix.slice(0, 5).map((plan) => {
    const daysSince = plan.date ? Math.floor((Date.now() - new Date(plan.date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const isUrgent = daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")

    return {
      date: plan.date,
      action:
        plan.status === "approved"
          ? `Plan validé${plan.validated_at ? ` le ${formatDateLong(plan.validated_at)}` : ""}`
          : plan.status === "rejected"
            ? "Plan rejeté"
            : "Plan soumis",
      client: plan.client,
      clientId: plan.client_id,
      campaign: plan.campaign,
      planId: plan.id,
      amount: plan.depenseClient, // Use depenseClient for amount
      commission: plan.status === "approved" ? plan.marge : null, // Commission is the margin when approved
      margePotentielle: plan.status === "pending" || plan.status === "proposed" ? plan.marge : null, // Potential margin for pending plans
      type: "plan" as const,
      daysSince,
      isUrgent,
    }
  })

  // Function to export AM history to Excel
  const exportAMHistoryToExcel = () => {
    const wb = XLSX.utils.book_new()

    const wsData: any[][] = [
      ["HISTORIQUE DES OBJECTIFS - " + amData.name.toUpperCase()],
      [],
      ["Date d'export:", new Date().toLocaleDateString("fr-FR")],
      ["Account Manager:", amData.name],
      ["Nombre d'enregistrements:", objectivesHistory.length],
      [],
      [],
      ["DÉTAILS DES OBJECTIFS"],
      [
        "Période",
        "Type",
        "Date début",
        "Date fin",
        "Clients",
        "Campagnes",
        "Marge Brute Cible (€)",
        "Marge Brute Atteinte (€)",
        "Taux MB (%)",
        "Dépenses Cible (€)",
        "Dépenses Atteintes (€)",
        "Taux Dép (%)",
        "Statut",
      ],
    ]

    objectivesHistory.forEach((h) => {
      wsData.push([
        h.period,
        h.periodType === "monthly" ? "Mensuel" : "Trimestriel",
        h.startDate,
        h.endDate,
        h.clients.join(", "),
        h.campaigns.join(", "),
        h.objectives.margeBrute.target,
        h.objectives.margeBrute.achieved,
        Number.parseFloat(((h.objectives.margeBrute.achieved / h.objectives.margeBrute.target) * 100).toFixed(1)),
        h.objectives.depenses.target,
        h.objectives.depenses.achieved,
        Number.parseFloat(((h.objectives.depenses.achieved / h.objectives.depenses.target) * 100).toFixed(1)),
        h.status === "achieved" ? "Atteint" : h.status === "partial" ? "Partiel" : "Non atteint",
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 15 }, // Période
      { wch: 12 }, // Type
      { wch: 12 }, // Date début
      { wch: 12 }, // Date fin
      { wch: 25 }, // Clients
      { wch: 25 }, // Campagnes
      { wch: 18 }, // Marge Brute Cible (€)
      { wch: 20 }, // Marge Brute Atteinte (€)
      { wch: 12 }, // Taux MB (%)
      { wch: 18 }, // Dépenses Cible (€)
      { wch: 20 }, // Dépenses Atteintes (€)
      { wch: 12 }, // Taux Dép (%)
      { wch: 12 }, // Statut
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Historique")

    // Generate and download the Excel file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `historique_objectifs_${amData.name.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export réussi",
      description: "L'historique des objectifs a été exporté en Excel",
    })
  }

  // Function to export AM history to CSV
  const exportAMHistoryToCSV = () => {
    const csvContent = [
      [
        "Période",
        "Type",
        "Début",
        "Fin",
        "Clients",
        "Campagnes",
        "Marge Brute Cible",
        "Marge Brute Atteinte",
        "Taux MB (%)",
        "Dépenses Cible",
        "Dépenses Atteintes",
        "Taux Dép (%)",
        "Statut",
      ].join(","),
      ...objectivesHistory.map((h) =>
        [
          h.period,
          h.periodType === "monthly" ? "Mensuel" : "Trimestriel",
          h.startDate,
          h.endDate,
          h.clients.join("; "), // Use semicolon for lists in CSV
          h.campaigns.join("; "),
          h.objectives.margeBrute.target,
          h.objectives.margeBrute.achieved,
          ((h.objectives.margeBrute.achieved / h.objectives.margeBrute.target) * 100).toFixed(1),
          h.objectives.depenses.target,
          h.objectives.depenses.achieved,
          ((h.objectives.depenses.achieved / h.objectives.depenses.target) * 100).toFixed(1),
          h.status === "achieved" ? "Atteint" : h.status === "partial" ? "Partiel" : "Non atteint",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `historique_objectifs_${amData.name.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: "L'historique des objectifs a été exporté en CSV",
    })
  }

  // Function to get status badge for history table
  const getHistoryStatusBadge = (status: string) => {
    if (status === "achieved")
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Atteint
        </Badge>
      )
    if (status === "partial")
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Partiel
        </Badge>
      )
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Non atteint
      </Badge>
    )
  }

  // Function to calculate percentage for history progress bars
  const calculatePercentage = (achieved: number, target: number) => {
    const safeAchieved = Number.isFinite(achieved) ? achieved : 0
    const safeTarget = Number.isFinite(target) ? target : 0
    if (!safeTarget || safeTarget === 0) return 0
    return Math.min((safeAchieved / safeTarget) * 100, 100)
  }

  // Filter plans based on the selected status
  const filteredPlans =
    planStatusFilter === "all"
      ? allPlans_redeclaration_fix
      : planStatusFilter === "pending"
        ? allPlans_redeclaration_fix.filter((p) => p.status === "pending" || p.status === "proposed")
        : planStatusFilter === "approved"
          ? allPlans_redeclaration_fix.filter((p) => p.status === "approved")
          : planStatusFilter === "rejected"
            ? allPlans_redeclaration_fix.filter((p) => p.status === "rejected")
            : planStatusFilter === "urgent"
              ? allPlans_redeclaration_fix.filter((p) => {
                  const daysSince = p.date
                    ? Math.floor((Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  return daysSince > 7 && (p.status === "pending" || p.status === "proposed")
                })
              : allPlans_redeclaration_fix // Default to all if filter is unknown

  // Helper to get client expense for a plan, with fallback
  const calculateClientExpenseForPlan = (plan: any) => {
    return plan.depense_client ?? plan.depenseClient ?? 0
  }

  // Recalculate clients with revenue to ensure consistency (if `clientsWithRevenue` was intended to be updated)
  const clientsWithCalculatedRevenueRecalculated = clients.map((client) => {
    const clientPlans = plans.filter((p: any) => p.client_id === client.id && p.status === "approved")
    const revenue = clientPlans.reduce((sum, p: any) => sum + calculateClientExpenseForPlan(p), 0)
    return {
      id: client.id,
      name: client.name,
      revenue,
      plans: clientPlans.length,
      status: client.status,
    }
  })

  // Breadcrumb navigation
  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/manager">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/manager/ams">Account Managers</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{amData.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  const calculatePredictions = () => {
    if (!objectives?.monthly?.margeBrute?.target) {
      return null
    }

    const currentDay = new Date().getDate()
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const percentOfMonthElapsed = currentDay / daysInMonth

    const currentMargin = objectives.monthly.margeBrute.current || 0
    const projectedMonthlyMargin = percentOfMonthElapsed > 0 ? currentMargin / percentOfMonthElapsed : 0
    const projectedQuarterlyMargin = projectedMonthlyMargin * 3

    const monthlyProgress =
      objectives.monthly.margeBrute.target > 0
        ? (projectedMonthlyMargin / objectives.monthly.margeBrute.target) * 100
        : 0

    return {
      projectedMonthlyMargin,
      projectedQuarterlyMargin,
      monthlyProgress,
      isOnTrack: monthlyProgress >= 90,
    }
  }

  const predictions = calculatePredictions()

  const allPlans = plans.map((plan: any) => {
    const depenseClient = plan.depense_client || 0
    const gainAffiliate = plan.fixed_fee || 0
    const marge = depenseClient - gainAffiliate

    return {
      id: plan.id,
      campaign: plan.campaign?.name || plan.campaign_name || "Campagne sans nom",
      campaignDates: `${formatDate(plan.start_date)} - ${formatDate(plan.end_date)}`,
      client: plan.client?.name || "Client non assigné",
      client_id: plan.client_id,
      affiliate: plan.affiliate?.name || "Affilié non assigné",
      gainAffiliate,
      depenseClient,
      marge,
      status: plan.status,
      created_at: plan.created_at,
      proposed_at: plan.proposed_at,
      validated_at: plan.validated_at,
      type: plan.plan_type,
      hdr_pct: plan.hdr_pct,
    }
  })

  const urgentPlans = allPlans.filter((p) => {
    const daysSince = p.proposed_at
      ? Math.floor((Date.now() - new Date(p.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    return daysSince > 7 && (p.status === "pending" || p.status === "proposed")
  })

  const handleQuickValidate = async (planId: string) => {
    setQuickValidatePlan(planId)
    setIsQuickValidating(true)

    try {
      await updatePlanStatus(planId, "approved")

      // Refresh plans
      const updatedPlans = await getPlansByAM(id)
      setPlans(updatedPlans)

      toast({
        title: "Plan validé",
        description: "Le plan a été validé avec succès",
      })
    } catch (error) {
      console.error("Error validating plan:", error)
      toast({
        title: "Erreur",
        description: "Impossible de valider le plan",
        variant: "destructive",
      })
    } finally {
      setQuickValidatePlan(null)
      setIsQuickValidating(false)
    }
  }

  const urgentPlansButton = urgentPlans.length > 0 && (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="destructive" size="sm" className="relative">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Plans urgents ({urgentPlans.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm">Plans urgents à traiter</h4>
          <p className="text-xs text-muted-foreground mt-1">Plans en attente depuis plus de 7 jours</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {urgentPlans.map((plan) => {
            const daysSince = plan.proposed_at
              ? Math.floor((Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0
            return (
              <div key={plan.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{plan.campaign}</p>
                    <p className="text-xs text-muted-foreground">{plan.client}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs shrink-0">
                    {daysSince}j
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleQuickValidate(plan.id)}
                    disabled={isQuickValidating && quickValidatePlan === plan.id}
                  >
                    {isQuickValidating && quickValidatePlan === plan.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Valider
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/manager/plans/${plan.id}`}>Voir</Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )

  const predictionsBanner = predictions && amData && (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-6 flex-wrap text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-medium">Projection Fin de Mois:</span>
        <span className="font-bold text-lg">
          {predictions.projectedMonthlyMargin.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}€
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-medium">Progression:</span>
        <span className={`font-bold ${predictions.isOnTrack ? "text-green-600" : "text-orange-600"}`}>
          {predictions.monthlyProgress.toFixed(0)}%
        </span>
      </div>
      <Badge variant={predictions.isOnTrack ? "default" : "secondary"} className="text-xs ml-auto">
        {predictions.isOnTrack ? "Sur la bonne voie" : "Attention"}
      </Badge>
    </div>
  )

  const headerContent = amData && (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Retour">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold tracking-tight truncate">{amData.name}</h1>
            <p className="text-muted-foreground text-lg">{amData.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {urgentPlansButton}
          <Button variant="outline" onClick={exportAMHistoryToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporter en CSV
          </Button>
          <SendMessageButton
            recipientId={id}
            recipientName={amData.name}
            recipientType="am"
            trigger={<Button variant="outline">Envoyer un message</Button>}
          />
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button>Modifier le profil</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier le profil</DialogTitle>
                <DialogDescription asChild>
                  <div>Mettez à jour les informations de l'Account Manager</div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Coordonnées actuelles</h3>
                  <div className="grid gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                      <p className="text-sm">{amData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Téléphone</p>
                      <p className="text-sm">{amData.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Localisation</p>
                      <p className="text-sm">{amData.location}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nom complet</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Niveau</Label>
                    <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                      <SelectTrigger id="edit-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior Account Manager">Junior Account Manager</SelectItem>
                        <SelectItem value="Senior Account Manager">Senior Account Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Téléphone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Localisation</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="on_leave">En congé</SelectItem>
                      <SelectItem value="transferred">Muté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editForm.status === "transferred" && (
                  <div className="space-y-2">
                    <Label htmlFor="transfer-manager">Transférer vers</Label>
                    <Select
                      value={editForm.transferToManagerId}
                      onValueChange={(value) => setEditForm({ ...editForm, transferToManagerId: value })}
                    >
                      <SelectTrigger id="transfer-manager">
                        <SelectValue placeholder="Sélectionner un manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAMs.map((am) => (
                          <SelectItem key={am.id} value={am.id}>
                            {am.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveEdit} className="flex-1" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {predictionsBanner}
    </div>
  )

  // Main metrics cards section
  const metricsCards = (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Clients & Affiliés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-1">{amData.clients}</div>
          <p className="text-sm text-muted-foreground">clients actifs</p>
          <p className="text-xs text-muted-foreground mt-1">{amData.affiliates} partenaires</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Dépense Client</CardTitle>
          <CardDescription className="text-xs">Montant facturé aux clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600 mb-1">{(amData.depenseClient ?? 0).toLocaleString()}€</div>
          <p className="text-sm text-emerald-600 font-medium">
            Gains affiliés: {((amData.depenseClient ?? 0) - (amData.margebrute ?? 0)).toLocaleString()}€
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Marge Brute</CardTitle>
          <CardDescription className="text-xs">Commission validée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-emerald-600 mb-1">{(amData.margebrute ?? 0).toLocaleString()}€</div>
          <p className="text-sm text-orange-600 font-medium">
            MB en attente: {(amData.margeEnAttente ?? 0).toLocaleString()}€
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-1">{amData.plansValides}</div>
          <p className="text-sm text-muted-foreground">plans validés</p>
          <Badge variant="secondary" className="text-xs mt-2">
            {amData.plansEnCours} en attente
          </Badge>
        </CardContent>
      </Card>
    </div>
  )

  // Calculate alerts data based on urgent plans and objective progress
  const urgentPlansForAlerts = allPlans.filter((p) => {
    const daysSince = p.date ? Math.floor((Date.now() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24)) : 0
    return daysSince > 7 && (p.status === "pending" || p.status === "proposed")
  })

  const objectiveProgress =
    objectives.monthly.margeBrute.target > 0
      ? (objectives.monthly.margeBrute.current / objectives.monthly.margeBrute.target) * 100
      : 0

  const hasLowObjectiveProgress = objectiveProgress < 50 && objectives.monthly.margeBrute.target > 0

  // Chart data calculations
  const monthlyPerformanceData = [
    { month: "Jan", marge: 8500, depense: 42000 },
    { month: "Fév", marge: 9200, depense: 45000 },
    { month: "Mar", marge: 10100, depense: 48000 },
    { month: "Avr", marge: 9800, depense: 47000 },
    { month: "Mai", marge: objectives.monthly.margeBrute.current, depense: objectives.monthly.depenses.current },
  ]

  const clientRevenueData = clientsWithCalculatedRevenue
    .map((client) => ({
      name: client.name,
      revenue: client.revenue,
    }))
    .slice(0, 5)

  const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  // Redeclared urgentPlansButton and predictionsBanner are removed.
  // The original urgentPlansButton and predictionsBanner are kept.

  // const headerContent = amData && ( ... ); // This was a redeclaration, removed.

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {headerContent}

        {!dismissedAlerts.includes("objectives") &&
          objectives &&
          objectives.monthly?.margeBrute?.target &&
          (objectives.monthly.margeBrute.current / objectives.monthly.margeBrute.target) * 100 < 50 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-orange-900">Attention aux objectifs mensuels</p>
                  <p className="text-sm text-orange-700">
                    Progression actuelle:{" "}
                    {((objectives.monthly.margeBrute.current / objectives.monthly.margeBrute.target) * 100).toFixed(0)}%
                    de l'objectif de marge brute ({objectives.monthly.margeBrute.current.toLocaleString()}€ sur{" "}
                    {objectives.monthly.margeBrute.target.toLocaleString()}€)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-orange-100"
                onClick={() => setDismissedAlerts([...dismissedAlerts, "objectives"])}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

        {metricsCards}

        {/* Reduced activity section and moved to collapsible */}
        <Collapsible>
          <Card className="border-0 shadow-sm">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div>
                  <CardTitle className="text-lg">Activité récente</CardTitle>
                  <CardDescription className="text-xs">5 derniers plans soumis ou validés</CardDescription>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2">
                  {allPlans.slice(0, 5).map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 text-sm"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge
                          variant={
                            plan.status === "approved"
                              ? "default"
                              : plan.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="shrink-0"
                        >
                          {plan.status === "approved" ? "Validé" : plan.status === "rejected" ? "Rejeté" : "Soumis"}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{plan.campaign}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {plan.client} • {plan.affiliate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-bold text-sm ${plan.status === "approved" ? "text-green-600" : "text-orange-600"}`}
                        >
                          {plan.marge.toLocaleString()}€
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(plan.validated_at || plan.proposed_at || plan.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">
              Plans
              <Badge variant="secondary" className="ml-2">
                {allPlans.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="clients">
              Clients
              <Badge variant="secondary" className="ml-2">
                {clients.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Tous les plans gérés par {amData?.name}</CardTitle>
                    <CardDescription>
                      Vue complète avec actions rapides et filtres avancés pour une meilleure structuration des données
                    </CardDescription>
                  </div>
                  <Select value={planStatusFilter} onValueChange={setPlanStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les plans ({allPlans.length})</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Validés</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                      <SelectItem value="urgent">Urgents ({">"}7j)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allPlans
                    .filter((plan) => {
                      if (planStatusFilter === "all") return true
                      if (planStatusFilter === "urgent") {
                        const daysSince = plan.proposed_at
                          ? Math.floor((Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
                          : 0
                        return daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")
                      }
                      return plan.status === planStatusFilter
                    })
                    .slice((currentPage - 1) * PLANS_PER_PAGE, currentPage * PLANS_PER_PAGE)
                    .map((plan) => {
                      const daysSince = plan.proposed_at
                        ? Math.floor((Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
                        : 0
                      const isUrgent = daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")

                      return (
                        <div
                          key={plan.id}
                          className={`p-5 rounded-lg border transition-all ${isUrgent ? "border-red-200 bg-red-50" : "border-border bg-background hover:shadow-md"}`}
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant={
                                    plan.status === "approved"
                                      ? "default"
                                      : plan.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="h-6"
                                >
                                  {plan.status === "approved"
                                    ? "Validé"
                                    : plan.status === "rejected"
                                      ? "Rejeté"
                                      : "En attente"}
                                </Badge>
                                {isUrgent && (
                                  <Badge variant="destructive" className="h-6">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {daysSince}j d'attente
                                  </Badge>
                                )}
                                <h3 className="font-semibold text-lg truncate">{plan.campaign}</h3>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Dates campagne
                                  </p>
                                  <p className="font-semibold">{plan.campaignDates}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Client
                                  </p>
                                  <p className="font-semibold truncate">{plan.client}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Affilié
                                  </p>
                                  <p className="font-semibold truncate">{plan.affiliate}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Type de plan
                                  </p>
                                  <p className="font-semibold">{plan.type || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    HDR négocié
                                  </p>
                                  <p className="font-semibold">{plan.hdr_pct ? `${plan.hdr_pct}%` : "Aucun"}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Date soumission
                                  </p>
                                  <p className="font-semibold">{formatDate(plan.proposed_at || plan.created_at)}</p>
                                </div>
                                {plan.validated_at && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Date validation
                                    </p>
                                    <p className="font-semibold text-green-600">{formatDate(plan.validated_at)}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-8 text-sm pt-2">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Gain Affilié
                                  </p>
                                  <p className="font-bold text-emerald-600 text-xl">
                                    {plan.gainAffiliate.toLocaleString()}€
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Dépense Client
                                  </p>
                                  <p className="font-bold text-blue-600 text-xl">
                                    {plan.depenseClient.toLocaleString()}€
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {plan.status === "approved" ? "Marge Brute" : "MB potentielle"}
                                  </p>
                                  <p
                                    className={`font-bold text-xl ${plan.status === "approved" ? "text-green-600" : "text-orange-600"}`}
                                  >
                                    {plan.marge.toLocaleString()}€
                                  </p>
                                  {plan.status === "approved" && plan.depenseClient > 0 && (
                                    <p className="text-xs text-muted-foreground font-medium">
                                      {((plan.marge / plan.depenseClient) * 100).toFixed(1)}% du total
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              <Button variant="outline" size="sm" className="w-32 bg-transparent" asChild>
                                <Link href={`/manager/plans/${plan.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </Link>
                              </Button>
                              {plan.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="w-32"
                                  onClick={() => handleQuickValidate(plan.id)}
                                  disabled={isQuickValidating && quickValidatePlan === plan.id}
                                >
                                  {isQuickValidating && quickValidatePlan === plan.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Validation...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Valider
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {allPlans.filter((plan) => {
                  if (planStatusFilter === "all") return true
                  if (planStatusFilter === "urgent") {
                    const daysSince = plan.proposed_at
                      ? Math.floor((Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0
                    return daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")
                  }
                  return plan.status === planStatusFilter
                }).length > PLANS_PER_PAGE && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} sur{" "}
                      {Math.ceil(
                        allPlans.filter((plan) => {
                          if (planStatusFilter === "all") return true
                          if (planStatusFilter === "urgent") {
                            const daysSince = plan.proposed_at
                              ? Math.floor((Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24))
                              : 0
                            return daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")
                          }
                          return plan.status === planStatusFilter
                        }).length / PLANS_PER_PAGE,
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={
                          currentPage >=
                          Math.ceil(
                            allPlans.filter((plan) => {
                              if (planStatusFilter === "all") return true
                              if (planStatusFilter === "urgent") {
                                const daysSince = plan.proposed_at
                                  ? Math.floor(
                                      (Date.now() - new Date(plan.proposed_at).getTime()) / (1000 * 60 * 60 * 24),
                                    )
                                  : 0
                                return daysSince > 7 && (plan.status === "pending" || plan.status === "proposed")
                              }
                              return plan.status === planStatusFilter
                            }).length / PLANS_PER_PAGE,
                          )
                        }
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Clients gérés par {amData?.name}</CardTitle>
                <CardDescription>{clients.length} client(s) actif(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map((client) => {
                    const clientPlans = allPlans.filter((p) => p.client === client.name)
                    const validatedPlans = clientPlans.filter((p) => p.status === "approved")
                    const pendingPlans = clientPlans.filter((p) => p.status === "pending")
                    const totalDepenses = validatedPlans.reduce((sum, p) => sum + p.depenseClient, 0)
                    const pendingDepenses = pendingPlans.reduce((sum, p) => sum + p.depenseClient, 0)
                    const affiliatesCount = new Set(clientPlans.map((p) => p.affiliate)).size

                    return (
                      <div key={client.id} className="p-4 rounded-lg border bg-background">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.industry || "Industrie non spécifiée"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/manager/clients/${client.id}`}>Voir détails</Link>
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Plans validés</p>
                            <p className="font-bold text-lg">{validatedPlans.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Plans en attente</p>
                            <p className="font-bold text-lg text-orange-600">{pendingPlans.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Affiliés actifs</p>
                            <p className="font-bold text-lg">{affiliatesCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Dépenses validées</p>
                            <p className="font-bold text-lg text-blue-600">{totalDepenses.toLocaleString()}€</p>
                          </div>
                        </div>

                        {pendingDepenses > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">Dépenses en attente de validation</p>
                            <p className="font-bold text-orange-600">{pendingDepenses.toLocaleString()}€</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectifs">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>Objectifs & Performance</CardTitle>
                  <CardDescription>Suivi des objectifs mensuels et trimestriels</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Période
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-4 space-y-2">
                        <p className="text-sm font-medium">Sélectionner une période</p>
                        <p className="text-xs text-muted-foreground">Fonctionnalité à venir</p>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Dialog open={isObjectivesOpen} onOpenChange={setIsObjectivesOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setObjectivesForm({
                            monthlyMargeBrute: objectives.monthly.margeBrute.target,
                            monthlyDepenses: objectives.monthly.depenses.target,
                            quarterlyMargeBrute: objectives.quarterly.margeBrute.target,
                            quarterlyDepenses: objectives.quarterly.depenses.target,
                          })
                        }
                      >
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Définir les objectifs</DialogTitle>
                        <DialogDescription>Mise à jour des objectifs de marge brute et dépenses.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="monthly-marge">Marge Brute Mensuelle (Cible)</Label>
                            <Input
                              id="monthly-marge"
                              type="number"
                              min="0"
                              value={objectivesForm.monthlyMargeBrute}
                              onChange={(e) =>
                                setObjectivesForm({ ...objectivesForm, monthlyMargeBrute: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monthly-depenses">Dépenses Mensuelles (Cible)</Label>
                            <Input
                              id="monthly-depenses"
                              type="number"
                              min="0"
                              value={objectivesForm.monthlyDepenses}
                              onChange={(e) =>
                                setObjectivesForm({ ...objectivesForm, monthlyDepenses: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="quarterly-marge">Marge Brute Trimestrielle (Cible)</Label>
                            <Input
                              id="quarterly-marge"
                              type="number"
                              min="0"
                              value={objectivesForm.quarterlyMargeBrute}
                              onChange={(e) =>
                                setObjectivesForm({ ...objectivesForm, quarterlyMargeBrute: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quarterly-depenses">Dépenses Trimestrielles (Cible)</Label>
                            <Input
                              id="quarterly-depenses"
                              type="number"
                              min="0"
                              value={objectivesForm.quarterlyDepenses}
                              onChange={(e) =>
                                setObjectivesForm({ ...objectivesForm, quarterlyDepenses: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleSaveObjectives} className="flex-1" disabled={isSavingObjectives}>
                            {isSavingObjectives ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sauvegarde...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsObjectivesOpen(false)}
                            disabled={isSavingObjectives}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={exportAMHistoryToExcel} disabled={objectivesHistory.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter historique
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Monthly Objectives */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Objectifs Mensuels</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {objectives?.monthly &&
                        Object.entries(objectives.monthly).map(([key, metric]: [string, any]) => {
                          const progress = calculateProgress(metric.current, metric.target)
                          return (
                            <Card key={key} className="shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  {metric.label}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between gap-4 mb-3">
                                  <div className="space-y-1">
                                    <p className="text-3xl font-bold">
                                      {metric.current.toLocaleString()}€{" "}
                                      <span className="text-sm font-normal text-muted-foreground">
                                        / {metric.target.toLocaleString()}€
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">Cible atteinte</p>
                                  </div>
                                  {getStatusIcon(progress)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div
                                    className={`h-2.5 rounded-full ${getProgressColor(progress)}`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground text-right mt-1">{progress.toFixed(0)}%</p>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>

                  {/* Quarterly Objectives */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Objectifs Trimestriels</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {objectives?.quarterly &&
                        Object.entries(objectives.quarterly).map(([key, metric]: [string, any]) => {
                          const progress = calculateProgress(metric.current, metric.target)
                          return (
                            <Card key={key} className="shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  {metric.label}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between gap-4 mb-3">
                                  <div className="space-y-1">
                                    <p className="text-3xl font-bold">
                                      {metric.current.toLocaleString()}€{" "}
                                      <span className="text-sm font-normal text-muted-foreground">
                                        / {metric.target.toLocaleString()}€
                                      </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">Cible atteinte</p>
                                  </div>
                                  {getStatusIcon(progress)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div
                                    className={`h-2.5 rounded-full ${getProgressColor(progress)}`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground text-right mt-1">{progress.toFixed(0)}%</p>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>

                  {/* Historical Objectives */}
                  {objectivesHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Historique des objectifs</h3>
                      <Card className="shadow-sm">
                        <CardContent className="overflow-x-auto p-0">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Période
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Marge Brute
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Dépenses
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Statut
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {objectivesHistory.map((h) => (
                                <tr key={h.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {h.period}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                      {getHistoryStatusBadge(h.status)}
                                      <p>
                                        {h.objectives.margeBrute.achieved.toLocaleString()}€ /{" "}
                                        {h.objectives.margeBrute.target.toLocaleString()}€
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <p>
                                      {h.objectives.depenses.achieved.toLocaleString()}€ /{" "}
                                      {h.objectives.depenses.target.toLocaleString()}€
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {h.status === "achieved" && (
                                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Atteint
                                      </Badge>
                                    )}
                                    {h.status === "partial" && (
                                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Partiel
                                      </Badge>
                                    )}
                                    {h.status === "not_achieved" && (
                                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Non atteint
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Performance par rapport au marché</CardTitle>
                <CardDescription>Comparaison des métriques clés de {amData?.name} avec la moyenne</CardDescription>
              </CardHeader>
              <CardContent>
                {benchmarkingData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Marge Brute</h4>
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Actuelle</p>
                          <p className="font-bold text-xl">{benchmarkingData.currentMargin.toLocaleString()}€</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Moyenne</p>
                          <p className="font-bold text-xl text-muted-foreground">
                            {benchmarkingData.avgMargin.toLocaleString()}€
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span
                          className={`font-semibold ${benchmarkingData.performanceVsAvg >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {benchmarkingData.performanceVsAvg >= 0 ? "+" : ""}
                          {benchmarkingData.performanceVsAvg.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground"> vs moyenne</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Plans Validés</h4>
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-xl">{benchmarkingData.currentPlansValidated}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Moyenne</p>
                          <p className="font-bold text-xl text-muted-foreground">
                            {benchmarkingData.avgPlansValidated.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">#{benchmarkingData.ranking}</span>
                        <span className="text-muted-foreground"> sur {benchmarkingData.totalAMs} AMs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Chargement des données de performance...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
export default AMDetailPage
