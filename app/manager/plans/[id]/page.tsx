"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building,
  FileText,
  MessageSquare,
  Lock,
  Send,
  TrendingUp,
  Plus,
  Trash2,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client" // Import supabase client
import { Switch } from "@/components/ui/switch" // Import Switch
import { PlanChatDialog } from "@/components/messaging/plan-chat-dialog" // Import PlanChatDialog

import {
  getPlanWithDetails,
  calculateClientExpense,
  calculateOurCommission,
  getPlanHistory,
  getPlanComments,
  addPlanComment,
} from "@/lib/supabase/queries/plans"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DocumentUpload } from "@/components/manager/document-upload"
import { DocumentList } from "@/components/manager/document-list"

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

type PlanChange = {
  field: string
  label: string
  oldValue: string | number
  newValue: string | number
}

type StatusHistoryEntry = {
  id: number
  actor: string
  actorName: string
  date: string
  time: string
  status: string
  action: string
  message: string
  changes: PlanChange[] | null | Record<string, any> // Allow object for changes
}

// Helper function to get a readable label for REM
const getRemLabel = (device: string, customerType: string): string => {
  const deviceLabel = device.charAt(0).toUpperCase() + device.slice(1)
  const customerLabel = customerType === "new" ? "Nouveau Client" : "Ancien Client"
  return `${deviceLabel} - ${customerLabel}`
}

// Helper function to get a message for history entries based on status and action
const getHistoryMessage = (status: string, action?: string): string => {
  switch (status) {
    case "pending":
      return "Plan soumis et en attente de validation."
    case "approved":
      return "Plan approuvé."
    case "rejected":
      return "Plan rejeté."
    case "counter_proposal_sent":
      return "Une contre-proposition a été envoyée."
    default:
      return `Statut mis à jour à ${status}.`
  }
}

const isPlanFinalized = (endDate: string | null): boolean => {
  if (!endDate) return false
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  return new Date() > end
}

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [planInfo, setPlanInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"validate" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [counterProposalForm, setCounterProposalForm] = useState<any>({
    fixedFee: 0,
    hdrPct: 0,
    placementText: "",
    startDate: "", // Added for counter proposal form
    endDate: "", // Added for counter proposal form
  })
  const [planData, setPlanData] = useState<any>(null)
  const [previousPlanData, setPreviousPlanData] = useState<any | null>(null)
  const [hasCounterProposal, setHasCounterProposal] = useState(false)
  const [planStatus, setPlanStatus] = useState<string>("")
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([])
  const [counterProposalMessage, setCounterProposalMessage] = useState<string>("") // For the message in plan_history
  const [showCounterProposalDialog, setShowCounterProposalDialog] = useState(false) // Declare this variable

  const [internalComment, setInternalComment] = useState("")
  const [showInternalCommentDialog, setShowInternalCommentDialog] = useState(false)
  const [internalComments, setInternalComments] = useState<
    Array<{ id: number; text: string; date: string; time: string }>
  >([])

  const [placements, setPlacements] = useState<string[]>([])
  const [showAddPlacementDialog, setShowAddPlacementDialog] = useState(false)
  const [showEditPlacementDialog, setShowEditPlacementDialog] = useState(false)
  const [editingPlacementIndex, setEditingPlacementIndex] = useState<number | null>(null)
  const [newPlacement, setNewPlacement] = useState("")
  const [editedPlacement, setEditedPlacement] = useState("")
  const [showEditPlacementTextDialog, setShowEditPlacementTextDialog] = useState(false) // Renamed to avoid conflict with state variable
  const [placementText, setPlacementText] = useState("") // Added for inline editing of general placement text
  const [editingPlacementText, setEditingPlacementText] = useState("") // Added for the dialog

  const [remsList, setRemsList] = useState<any[]>([])
  const [showAddRemDialog, setShowAddRemDialog] = useState(false)
  const [showEditRemDialog, setShowEditRemDialog] = useState(false)
  const [editingRemIndex, setEditingRemIndex] = useState<number | null>(null)
  const [newRemForm, setNewRemForm] = useState({
    label: "",
    value: 0,
    description: "",
  })

  const [editingFixedFee, setEditingFixedFee] = useState<string | number>("")
  const [showEditFixedFeeDialog, setShowEditFixedFeeDialog] = useState(false)

  const [editDetailsForm, setEditDetailsForm] = useState({
    campaignName: "",
    startDate: "",
    endDate: "",
    estimatedBudget: 0,
  })
  const [editNegotiationForm, setEditNegotiationForm] = useState({
    fixedFee: 0,
    hdrPct: 0,
    placementText: "",
  })
  const [isParameterized, setIsParameterized] = useState(false)
  const [shouldFollow, setShouldFollow] = useState(true)

  const [showEditDetailsDialog, setShowEditDetailsDialog] = useState(false)
  const [showEditNegotiationDialog, setShowEditNegotiationDialog] = useState(false)
  const [isEditingCounterProposal, setIsEditingCounterProposal] = useState(false)

  const [placementMode, setPlacementMode] = useState<"text" | "list">("list") // Default to list mode
  const [placementsWithDates, setPlacementsWithDates] = useState<
    Array<{ name: string; startDate: string; endDate: string }>
  >([])

  const [viewingCounterProposal, setViewingCounterProposal] = useState<any>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false) // Declare this variable
  const [newStatusAction, setNewStatusAction] = useState<"validate" | "reject" | null>(null) // Declare this variable
  const [showChangeStatusDialog, setShowChangeStatusDialog] = useState(false) // Declare this variable

  const [documentRefreshTrigger, setDocumentRefreshTrigger] = useState(0)

  const hasShownValidationToast = useRef(false)

  const submissionDate = planInfo?.created_at
    ? new Date(planInfo.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Non défini"

  const daysAgo = planInfo?.created_at
    ? Math.floor((Date.now() - new Date(planInfo.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const isReadOnly = planInfo?.end_date ? isPlanFinalized(planInfo.end_date) : false

  useEffect(() => {
    const fetchData = async () => {
      if (!isValidUUID(params.id)) {
        console.error("[v0] Invalid UUID detected:", params.id)
        toast({
          title: "Identifiant invalide",
          description: "Ce plan ne peut pas être chargé car son identifiant est incorrect.",
          variant: "destructive",
        })
        router.push("/manager/plans")
        setLoading(false)
        return
      }

      try {
        const plan = await getPlanWithDetails(params.id)

        if (!plan) {
          toast({
            title: "Plan introuvable",
            description: "Ce plan n'existe pas ou a été supprimé.",
            variant: "destructive",
          })
          router.push("/manager/plans")
          return
        }

        setPlanInfo(plan)
        setPlanData({
          fixedFee: plan.fixed_fee,
          hdrPct: plan.hdr_pct,
          placementText: plan.placement_text,
        })
        setPlanStatus(plan.status)
        setHasCounterProposal(plan.status === "counter_proposal_sent")

        // Initialize placements and placementsWithDates based on plan.placement_text
        if (plan.placement_text) {
          const sections = plan.placement_text.split("\n---\n")
          if (sections.length > 1) {
            // Text mode and list with dates mode
            setPlacementText(sections[0])
            const dateSection = sections[1]
            const parsedPlacementsWithDates = dateSection
              .split("\n")
              .filter((line: string) => line.trim())
              .map((line: string) => {
                const match = line.match(/^(.*)\s*$$(.*)\s*-\s*(.*)$$$/)
                if (match && match[1] && match[2] && match[3]) {
                  return { name: match[1].trim(), startDate: match[2].trim(), endDate: match[3].trim() }
                }
                return { name: line.trim(), startDate: "", endDate: "" } // Fallback if no dates found
              })
            setPlacementsWithDates(parsedPlacementsWithDates)
          } else {
            // Only text mode
            setPlacementText(plan.placement_text)
            const placementArray = plan.placement_text.split("\n").filter((p: string) => p.trim())
            setPlacements(placementArray) // Keep this for older data or single mode
          }
        }

        // Predefined REMs, not from DB for now
        setRemsList([
          { label: "Mobile - Nouveau Client", value: 4.0, description: "NC / New Customer", type: "percentage" },
          { label: "Desktop - Nouveau Client", value: 4.0, description: "NC / New Customer", type: "percentage" },
          { label: "Mobile - Ancien Client", value: 4.0, description: "AC / Old Customer", type: "percentage" },
          { label: "Desktop - Ancien Client", value: 4.0, description: "AC / Old Customer", type: "percentage" },
        ])

        const history = await getPlanHistory(params.id)
        const formattedHistory = history.map((entry: any) => {
          if (!entry.created_at) {
            console.warn("[v0] Missing created_at in plan history entry:", entry)
          }

          return {
            id: entry.id,
            actor: entry.actor_type,
            actorName: entry.actor_name,
            date: entry.created_at ? entry.created_at.split("T")[0] : "N/A",
            time: entry.created_at
              ? new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : "N/A",
            status: entry.status,
            action: entry.action,
            message: getHistoryMessage(entry.status, entry.action),
            changes: typeof entry.changes === "string" ? JSON.parse(entry.changes) : entry.changes || {},
          }
        })
        setStatusHistory(formattedHistory)

        const comments = await getPlanComments(params.id)
        const formattedComments = comments.map((comment: any) => {
          if (!comment.created_at) {
            console.warn("[v0] Missing created_at in plan comment:", comment)
          }

          return {
            id: comment.id,
            text: comment.comment_text,
            date: comment.created_at ? comment.created_at.split("T")[0] : "N/A",
            time: comment.created_at
              ? new Date(comment.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : "N/A",
          }
        })
        setInternalComments(formattedComments)

        setIsParameterized(plan.is_parameterized || false)
        setShouldFollow(plan.should_follow !== false)

        setEditDetailsForm({
          campaignName: plan.campaign_name || "",
          startDate: plan.start_date || "",
          endDate: plan.end_date || "",
          estimatedBudget: plan.estimated_budget || 0,
        })

        setEditNegotiationForm({
          fixedFee: plan.fixed_fee || 0,
          hdrPct: plan.hdr_pct || 0,
          placementText: plan.placement_text || "",
        })

        // Initialize states for new dialogs
        setEditingFixedFee(plan.fixedFee || 0) // Corrected state initialization
        setPlacementText(plan.placement_text || "") // Corrected state initialization
        setEditingPlacementText(plan.placement_text || "") // Initialize editingPlacementText

        // Initialize counterProposalForm with current plan data
        setCounterProposalForm({
          fixedFee: plan.fixed_fee || 0,
          hdrPct: plan.hdr_pct || 0,
          placementText: plan.placement_text || "",
          startDate: plan.start_date || "",
          endDate: plan.end_date || "",
          campaignName: plan.campaign_name || "",
          remunerations: remsList,
          placementsWithDates: placementsWithDates,
        })

        console.log("[v0] Loaded plan from Supabase:", plan.campaign_name, "with", plan.status, "status")
      } catch (error) {
        console.error("[v0] Error fetching plan details:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du plan.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  useEffect(() => {
    const isCampaignEnded = (): boolean => {
      if (!planInfo || !planInfo.end_date) return false
      const endDate = new Date(planInfo.end_date)
      endDate.setHours(23, 59, 59, 999)
      return new Date() > endDate
    }

    const campaignEnded = isCampaignEnded()

    if (campaignEnded && planStatus === "pending") {
      setPlanStatus("rejected")

      const newHistoryEntry: StatusHistoryEntry = {
        id: statusHistory.length + 1,
        actor: "system",
        actorName: "Système",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "rejected",
        action: "auto_rejected",
        message: "Plan refusé automatiquement car aucune action n'a été effectuée avant la fin de la campagne",
        changes: null,
      }
      setStatusHistory((prev) => [...prev, newHistoryEntry])

      toast({
        title: "Plan rejeté automatiquement",
        description: "La campagne est terminée et le plan n'a pas été validé à temps.",
        variant: "destructive",
      })
    }
  }, [planInfo, planStatus, statusHistory, toast])

  if (loading) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (!planInfo || !planData) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <h2 className="text-2xl font-bold">Plan introuvable</h2>
              <p className="text-muted-foreground">Ce plan n'existe pas ou a été supprimé.</p>
              <Button onClick={() => router.push("/manager/plans")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const margeBrute = calculateOurCommission({ ...planInfo, fixed_fee: planData.fixedFee, hdr_pct: planData.hdrPct })
  const depenseClient = calculateClientExpense({ ...planInfo, fixed_fee: planData.fixedFee, hdr_pct: planData.hdrPct })

  const previousMargeBrute = previousPlanData
    ? calculateOurCommission({ ...planInfo, fixed_fee: previousPlanData.fixedFee, hdr_pct: previousPlanData.hdrPct })
    : undefined
  const previousDepenseClient = previousPlanData
    ? calculateClientExpense({ ...planInfo, fixed_fee: previousPlanData.fixedFee, hdr_pct: previousPlanData.hdrPct })
    : undefined

  const isCampaignEnded = (): boolean => {
    if (!planInfo.end_date) return false
    const endDate = new Date(planInfo.end_date)
    endDate.setHours(23, 59, 59, 999)
    return new Date() > endDate
  }

  const campaignEnded = isCampaignEnded()
  const isLocked = campaignEnded && planStatus === "pending"

  // Calculate days waiting
  const daysWaiting = Math.floor(
    (new Date().getTime() - new Date(planInfo.proposed_at).getTime()) / (1000 * 60 * 60 * 24),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        )
      case "counter_proposal_sent":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Send className="w-3 h-3 mr-1" />
            Contre-proposition envoyée
          </Badge>
        )
      case "counter_proposal":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Contre-proposition
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <Clock className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        )
    }
  }

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case "client":
        return <Building className="w-4 h-4" />
      case "affiliate":
        return <User className="w-4 h-4" />
      case "am":
      case "manager":
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getActorColor = (actor: string) => {
    switch (actor) {
      case "client":
        return "text-purple-600 bg-purple-500/10"
      case "affiliate":
        return "text-blue-600 bg-blue-500/10"
      case "am":
      case "manager":
        return "text-emerald-600 bg-emerald-500/10"
      default:
        return "text-gray-600 bg-gray-500/10"
    }
  }

  const handleAddInternalComment = async () => {
    if (!internalComment.trim()) {
      toast({
        title: "Commentaire vide",
        description: "Veuillez saisir un commentaire avant d'enregistrer.",
        variant: "destructive",
      })
      return
    }

    try {
      // TODO: Get real AM ID from user session
      const amId = planInfo.account_manager_id
      const amName = "Manager"

      await addPlanComment(params.id, amId, amName, internalComment.trim())

      const newComment = {
        id: Date.now(),
        text: internalComment.trim(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }

      setInternalComments([newComment, ...internalComments])
      setInternalComment("")
      setShowInternalCommentDialog(false)

      toast({
        title: "Commentaire interne ajouté",
        description: "Votre note privée a été enregistrée dans Supabase.",
      })
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire.",
        variant: "destructive",
      })
    }
  }

  const handleSavePlacementText = async () => {
    try {
      setPlacementText(editingPlacementText)

      const placementsWithDatesText = placementsWithDates
        .filter((p) => p.name.trim())
        .map((p) => {
          if (p.startDate && p.endDate) {
            return `${p.name} (${p.startDate} - ${p.endDate})`
          }
          return p.name
        })
        .join("\n")

      const combinedPlacementText = [editingPlacementText, placementsWithDatesText]
        .filter((text) => text.trim())
        .join("\n---\n")

      const { error } = await supabase
        .from("plans")
        .update({
          placement_text: combinedPlacementText,
        })
        .eq("id", params.id)

      if (error) throw error

      // Reload plan to sync
      const updatedPlan = await getPlanWithDetails(params.id)
      setPlanInfo(updatedPlan)

      setShowEditPlacementTextDialog(false)

      toast({
        title: "Texte enregistré",
        description: "Le texte de placement a été sauvegardé",
      })
    } catch (error) {
      console.error("[v0] Error saving placement text:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le texte",
        variant: "destructive",
      })
    }
  }

  const handleCounterProposalSubmit = async () => {
    if (isSubmitting) {
      return
    }

    const fixedFeeValue = counterProposalForm.fixedFee ?? planData.fixedFee
    const hdrPctValue = counterProposalForm.hdrPct ?? planData.hdrPct
    const placementTextValue = counterProposalForm.placementText ?? placementText
    const startDateValue = counterProposalForm.startDate ?? planInfo.start_date
    const endDateValue = counterProposalForm.endDate ?? planInfo.end_date
    const campaignNameValue = counterProposalForm.campaignName ?? planInfo.campaign_name

    // Get REMs - either from form or current state
    const proposedRems = counterProposalForm.remunerations ?? remsList
    const proposedPlacementsWithDates = counterProposalForm.placementsWithDates ?? placementsWithDates

    if (!fixedFeeValue || !hdrPctValue) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const actorName = user?.email ? user.email.split("@")[0] : "Manager"

      const { data: existingCounterProposal } = await supabase
        .from("plan_history")
        .select("*")
        .eq("plan_id", params.id)
        .eq("status", "counter_proposal")
        .eq("actor_type", "manager")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // This should NEVER change - it's the baseline for comparison
      let originalProposal: any

      if (existingCounterProposal && existingCounterProposal.changes) {
        // If updating existing counter proposal, keep the same original
        const existingChanges =
          typeof existingCounterProposal.changes === "string"
            ? JSON.parse(existingCounterProposal.changes)
            : existingCounterProposal.changes
        originalProposal = existingChanges.original
      } else {
        // Try to get the affiliate's initial submission
        const { data: affiliateSubmission } = await supabase
          .from("plan_history")
          .select("*")
          .eq("plan_id", params.id)
          .eq("actor_type", "affiliate")
          .or("action.eq.submitted,action.eq.created")
          .order("created_at", { ascending: true })
          .limit(1)
          .single()

        if (affiliateSubmission && affiliateSubmission.changes) {
          const affiliateChanges =
            typeof affiliateSubmission.changes === "string"
              ? JSON.parse(affiliateSubmission.changes)
              : affiliateSubmission.changes
          originalProposal = affiliateChanges.proposed || affiliateChanges.original || affiliateChanges
        } else {
          // Last fallback: use current plan state as baseline
          originalProposal = {
            campaignName: planInfo.campaign_name,
            client: planInfo.client?.name || "—",
            affiliate: planInfo.affiliate?.name || "—",
            startDate: planInfo.start_date,
            endDate: planInfo.end_date,
            fixedFee: planInfo.fixed_fee,
            hdrPct: planInfo.hdr_pct,
            remunerations: remsList.map((r) => ({
              name: r.label,
              percentage: r.value,
              type: "percentage",
            })),
            placementText: planInfo.placement_text || "",
            placementsWithDates: placementsWithDates.map((p) => ({
              name: p.name,
              startDate: p.startDate,
              endDate: p.endDate,
            })),
          }
        }
      }

      const proposedProposal = {
        campaignName: campaignNameValue,
        client: planInfo.client?.name || "—",
        affiliate: planInfo.affiliate?.name || "—",
        startDate: startDateValue,
        endDate: endDateValue,
        fixedFee: fixedFeeValue,
        hdrPct: hdrPctValue,
        remunerations: proposedRems.map((r) => ({
          name: r.label,
          percentage: r.value,
          type: "percentage",
        })),
        placementText: placementTextValue,
        placementsWithDates: proposedPlacementsWithDates.map((p) => ({
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate,
        })),
      }

      const changesObject = {
        original: originalProposal,
        proposed: proposedProposal,
      }

      if (existingCounterProposal) {
        const { error } = await supabase
          .from("plan_history")
          .update({
            message: counterProposalMessage || "Contre-proposition mise à jour",
            changes: changesObject,
            created_at: new Date().toISOString(), // Update timestamp
          })
          .eq("id", existingCounterProposal.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("plan_history").insert({
          plan_id: params.id,
          actor_type: "manager",
          actor_name: actorName,
          status: "counter_proposal",
          action: "counter_proposed",
          message: counterProposalMessage || "Contre-proposition envoyée",
          changes: changesObject,
        })

        if (error) throw error
      }

      await supabase.from("plans").update({ status: "counter_proposal" }).eq("id", params.id)

      // Reload data
      const updatedPlan = await getPlanWithDetails(params.id)
      const history = await getPlanHistory(params.id)

      setPlanInfo(updatedPlan)
      setPlanStatus("counter_proposal") // Ensure status is correctly set
      setHasCounterProposal(true)

      const formattedHistory = history.map((entry: any) => ({
        id: entry.id,
        actor: entry.actor_type,
        actorName: entry.actor_name?.split("@")[0] || entry.actor_name,
        date: entry.created_at ? entry.created_at.split("T")[0] : "N/A",
        time: entry.created_at
          ? new Date(entry.created_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        status: entry.status,
        action: entry.action,
        message: entry.message,
        changes: entry.changes,
      }))
      setStatusHistory(formattedHistory)

      setShowCounterProposalDialog(false)
      setCounterProposalMessage("")
      setCounterProposalForm({})

      toast({
        title: existingCounterProposal ? "Contre-proposition mise à jour" : "Contre-proposition envoyée",
        description: existingCounterProposal
          ? "Votre contre-proposition a été mise à jour."
          : "Votre proposition a été transmise à l'affilié.",
      })
    } catch (error) {
      console.error("[v0] Error submitting counter proposal:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la contre-proposition",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleValidatePlan = async () => {
    if (isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      hasShownValidationToast.current = false

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const actorName = user?.email ? user.email.split("@")[0] : "Manager"

      // Update plan status
      await supabase
        .from("plans")
        .update({
          status: "approved",
        })
        .eq("id", params.id)

      // Add history entry
      await supabase.from("plan_history").insert({
        plan_id: params.id,
        actor_type: "manager",
        actor_name: actorName,
        status: "approved",
        action: "validated",
        message: "Plan validé et envoyé au client",
      })

      // Reload data
      const updatedPlan = await getPlanWithDetails(params.id)
      const history = await getPlanHistory(params.id)

      setPlanInfo(updatedPlan)
      setPlanStatus(updatedPlan.status)
      setHasCounterProposal(false)

      const formattedHistory = history.map((entry: any) => ({
        id: entry.id,
        actor: entry.actor_type,
        actorName: entry.actor_name?.split("@")[0] || entry.actor_name,
        date: entry.created_at ? entry.created_at.split("T")[0] : "N/A",
        time: entry.created_at
          ? new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "N/A",
        status: entry.status,
        action: entry.action,
        message: entry.message,
        changes: entry.changes,
      }))
      setStatusHistory(formattedHistory)

      setShowActionDialog(false)
      setActionType(null)

      if (!hasShownValidationToast.current) {
        hasShownValidationToast.current = true
        toast({
          title: "✅ Plan validé et envoyé au client",
          description: "Le client a été notifié et peut maintenant valider le plan.",
        })
      }
    } catch (error) {
      console.error("[v0] Error validating plan:", error)
      toast({
        title: "Erreur",
        description: "Impossible de valider le plan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectPlan = async () => {
    if (isSubmitting) {
      return
    }

    if (!rejectionReason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez indiquer une raison pour le rejet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const actorName = user?.email ? user.email.split("@")[0] : "Manager"

      await supabase.from("plans").update({ status: "rejected" }).eq("id", params.id)

      await supabase.from("plan_history").insert({
        plan_id: params.id,
        actor_type: "manager",
        actor_name: actorName,
        status: "rejected",
        action: "rejected",
        message: rejectionReason,
      })

      // Reload data
      const updatedPlan = await getPlanWithDetails(params.id)
      const history = await getPlanHistory(params.id)

      setPlanInfo(updatedPlan)
      setPlanStatus(updatedPlan.status)
      setHasCounterProposal(false)

      const formattedHistory = history.map((entry: any) => ({
        id: entry.id,
        actor: entry.actor_type,
        actorName: entry.actor_name?.split("@")[0] || entry.actor_name,
        date: entry.created_at ? entry.created_at.split("T")[0] : "N/A",
        time: entry.created_at
          ? new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "N/A",
        status: entry.status,
        action: entry.action,
        message: entry.message,
        changes: entry.changes,
      }))
      setStatusHistory(formattedHistory)

      setShowActionDialog(false)
      setActionType(null)
      setRejectionReason("")

      toast({
        title: "Plan rejeté",
        description: "Le plan a été refusé.",
      })
    } catch (error) {
      console.error("[v0] Error rejecting plan:", error)
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le plan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevertValidation = async () => {
    try {
      setIsSubmitting(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const actorName = user?.email ? user.email.split("@")[0] : "Manager"

      await supabase
        .from("plans")
        .update({
          status: "rejected",
        })
        .eq("id", params.id)

      await supabase.from("plan_history").insert({
        plan_id: params.id,
        actor_type: "manager",
        actor_name: actorName,
        status: "rejected",
        action: "reverted_validation",
        message: "Plan rejeté après validation",
      })

      const updatedPlan = await getPlanWithDetails(params.id)
      const history = await getPlanHistory(params.id)

      setPlanInfo(updatedPlan)
      setPlanStatus(updatedPlan.status)

      const formattedHistory = history.map((entry: any) => ({
        id: entry.id,
        actor: entry.actor_type,
        actorName: entry.actor_name?.split("@")[0] || entry.actor_name,
        date: entry.created_at ? entry.created_at.split("T")[0] : "N/A",
        time: entry.created_at
          ? new Date(entry.created_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        status: entry.status,
        action: entry.action,
        message: entry.message,
        changes: entry.changes,
      }))
      setStatusHistory(formattedHistory)

      toast({
        title: "Plan rejeté",
        description: "Le plan a été rejeté",
      })
    } catch (error) {
      console.error("[v0] Error reverting validation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le plan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModifyValidatedPlan = () => {
    // Load current counter proposal data into form
    setCounterProposalForm({
      fixedFee: planData.fixedFee || 0,
      hdrPct: planData.hdrPct || 0,
      placementText: placementText || "",
      startDate: planInfo.start_date || "",
      endDate: planInfo.end_date || "",
      campaignName: planInfo.campaign_name || "",
      remunerations: remsList,
      placementsWithDates: placementsWithDates,
    })
    setIsEditingCounterProposal(true)
    setShowCounterProposalDialog(true)
  }

  const handleChangeStatus = async () => {
    if (!newStatusAction) return

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newStatus = newStatusAction === "validate" ? "approved" : "rejected"
    setPlanStatus(newStatus)

    const newHistoryEntry: StatusHistoryEntry = {
      id: statusHistory.length + 1,
      actor: "manager",
      actorName: "Manager",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      status: newStatus,
      action: newStatusAction === "validate" ? "status_changed_to_approved" : "status_changed_to_rejected",
      message:
        newStatusAction === "validate"
          ? "Statut changé: Plan validé après révision"
          : `Statut changé: Plan rejeté après révision${rejectionReason ? ` - ${rejectionReason}` : ""}`,
      changes: null,
    }
    setStatusHistory([...statusHistory, newHistoryEntry])

    setShowChangeStatusDialog(false) // Use the declared variable
    setIsSubmitting(false)
    setNewStatusAction(null) // Use the declared variable
    setRejectionReason("")

    toast({
      title: newStatusAction === "validate" ? "Plan validé" : "Plan rejeté",
      description: "Le statut du plan a été changé avec succès.",
      variant: newStatusAction === "validate" ? "default" : "destructive",
    })
  }

  const handleWithdrawCounterProposal = async () => {
    try {
      setIsSubmitting(true)

      // Update plan status back to pending
      const { error } = await supabase.from("plans").update({ status: "pending" }).eq("id", params.id)

      if (error) throw error

      // Refresh plan data
      const updatedPlan = await getPlanWithDetails(params.id)
      setPlanInfo(updatedPlan)
      setPlanStatus(updatedPlan.status)
      setHasCounterProposal(false)

      toast({
        title: "Contre-proposition annulée",
        description: "Le plan est revenu en statut 'En attente'",
      })
    } catch (error) {
      console.error("Error withdrawing counter proposal:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la contre-proposition",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCounterProposal = () => {
    // Load current counter proposal data into form
    setCounterProposalForm({
      fixedFee: planData.fixedFee || 0,
      hdrPct: planData.hdrPct || 0,
      placementText: placementText || "",
      startDate: planInfo.start_date || "",
      endDate: planInfo.end_date || "",
      campaignName: planInfo.campaign_name || "",
      remunerations: remsList,
      placementsWithDates: placementsWithDates,
    })
    setIsEditingCounterProposal(true)
    setShowCounterProposalDialog(true)
  }

  const renderValueWithChange = (
    currentValue: string | number,
    previousValue: string | number | undefined,
    suffix = "",
  ) => {
    if (hasCounterProposal && previousValue !== undefined && previousValue !== currentValue) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm line-through text-muted-foreground">
            {previousValue}
            {suffix}
          </span>
          <span className="text-base font-semibold text-emerald-600">
            {currentValue}
            {suffix}
          </span>
        </div>
      )
    }
    return (
      <p className="text-base font-semibold">
        {currentValue}
        {suffix}
      </p>
    )
  }

  const header = (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{planInfo.campaign_name}</h1>
            {getStatusBadge(planStatus)}
          </div>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <Link href={`/manager/clients/${planInfo.client_id}`} className="hover:text-foreground transition-colors">
              <span className="font-medium">{planInfo.client?.name}</span>
            </Link>
            <span>×</span>
            <Link
              href={`/manager/affiliates/${planInfo.affiliate_id}`}
              className="hover:text-foreground transition-colors"
            >
              <span className="font-medium">{planInfo.affiliate.name}</span>
            </Link>
            <span>•</span>
            <span className="text-sm">
              {planInfo.start_date ? new Date(planInfo.start_date).toLocaleDateString("fr-FR") : "N/A"} -{" "}
              {planInfo.end_date ? new Date(planInfo.end_date).toLocaleDateString("fr-FR") : "N/A"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {daysWaiting > 7 && planStatus === "pending" && (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <AlertCircle className="w-3 h-3 mr-1" />
            {daysWaiting}j d'attente
          </Badge>
        )}
        {campaignEnded && (
          <Badge variant="outline" className="text-muted-foreground">
            <Lock className="w-3 h-3 mr-1" />
            Campagne terminée
          </Badge>
        )}
      </div>
    </div>
  )

  const statsCards = (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Marge Brute</CardTitle>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600 flex items-baseline gap-1">
            {margeBrute.toFixed(2)}
            <span className="text-lg">€</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Commission {planData.hdrPct}%</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Dépense Client</CardTitle>
          <Building className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 flex items-baseline gap-1">
            {Math.round(depenseClient)}
            <span className="text-lg">€</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Frais fixes + Marge</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gains Affiliés</CardTitle>
          <FileText className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 flex items-baseline gap-1">
            {planData.fixedFee}
            <span className="text-lg">€</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Frais fixes</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardDescription className="text-xs">Date de Soumission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{submissionDate}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Il y a {daysAgo} jour{daysAgo > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const actionAlerts = (
    <div className="space-y-4">
      {/* Removed duplicate validation alert, keeping only one per status */}
      {planStatus === "approved" && !isReadOnly && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Plan validé et envoyé au client</AlertTitle>
          <AlertDescription className="text-green-700">
            Le client a été notifié et peut maintenant valider le plan. Vous pouvez encore le modifier ou l'annuler tant
            qu'il n'est pas terminé.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActionType("reject")
                setShowActionDialog(true)
              }}
              disabled={isSubmitting}
            >
              Rejeter finalement
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCounterProposalDialog(true)}
              disabled={isSubmitting}
            >
              Modifier le plan
            </Button>
          </div>
        </Alert>
      )}

      {planStatus === "rejected" && !isReadOnly && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900">Plan rejeté</AlertTitle>
          <AlertDescription className="text-red-700">
            Ce plan a été refusé. Vous pouvez le valider, le modifier ou envoyer une contre-proposition.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setActionType("validate")
                setShowActionDialog(true)
              }}
              disabled={isSubmitting}
            >
              Valider finalement
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCounterProposalDialog(true)}
              disabled={isSubmitting}
            >
              Faire une contre-proposition
            </Button>
          </div>
        </Alert>
      )}

      {hasCounterProposal && planStatus === "counter_proposal" && !isReadOnly && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900">Contre-proposition en cours</AlertTitle>
          <AlertDescription className="text-orange-700">
            Une contre-proposition a été envoyée à l'affilié. Vous pouvez la modifier ou valider le plan directement.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleEditCounterProposal} disabled={isSubmitting}>
              Modifier la contre-proposition
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setActionType("validate")
                setShowActionDialog(true)
              }}
              disabled={isSubmitting}
            >
              Valider finalement
            </Button>
          </div>
        </Alert>
      )}

      {planStatus === "pending" && !hasCounterProposal && !isReadOnly && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900">Plan en attente de validation</AlertTitle>
          <AlertDescription className="text-blue-700">
            Ce plan attend votre approbation. Vous pouvez le valider, le refuser ou envoyer une contre-proposition.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setActionType("validate")
                setShowActionDialog(true)
              }}
              disabled={isSubmitting}
            >
              Valider
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActionType("reject")
                setShowActionDialog(true)
              }}
              disabled={isSubmitting}
            >
              Refuser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCounterProposalDialog(true)}
              disabled={isSubmitting}
            >
              Faire une contre-proposition
            </Button>
          </div>
        </Alert>
      )}

      {isReadOnly && (
        <Alert className="border-gray-300 bg-gray-50">
          <Lock className="h-5 w-5 text-gray-600" />
          <AlertTitle className="text-gray-900">Plan terminé - Facturation en cours</AlertTitle>
          <AlertDescription className="text-gray-700">
            Cette campagne est terminée et ne peut plus être modifiée
          </AlertDescription>
        </Alert>
      )}
    </div>
  )

  const handleAddPlacement = () => {
    if (!newPlacement.trim()) {
      toast({
        title: "Placement vide",
        description: "Veuillez saisir un texte de placement.",
        variant: "destructive",
      })
      return
    }

    setPlacements([...placements, newPlacement.trim()])
    setNewPlacement("")
    setShowAddPlacementDialog(false)

    toast({
      title: "Placement ajouté",
      description: "Le nouveau placement a été ajouté.",
    })
  }

  const handleEditPlacement = (index: number) => {
    setEditingPlacementIndex(index)
    setEditedPlacement(placements[index])
    setShowEditPlacementDialog(true)
  }

  const handleSavePlacement = () => {
    if (editingPlacementIndex === null) return

    const updatedPlacements = [...placements]
    updatedPlacements[editingPlacementIndex] = editedPlacement.trim()
    setPlacements(updatedPlacements)

    setShowEditPlacementDialog(false)
    setEditingPlacementIndex(null)
    setEditedPlacement("")

    toast({
      title: "Placement modifié",
      description: "Le placement a été mis à jour.",
    })
  }

  const handleDeletePlacement = (index: number) => {
    setPlacements(placements.filter((_, i) => i !== index))

    toast({
      title: "Placement supprimé",
      description: "Le placement a été retiré.",
      variant: "destructive",
    })
  }

  const handleAddRem = () => {
    if (!newRemForm.label.trim() || !newRemForm.value) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    setRemsList([...remsList, { ...newRemForm, type: "percentage" }]) // Added type
    setNewRemForm({ label: "", value: 0, description: "" })
    setShowAddRemDialog(false)

    toast({
      title: "REM ajoutée",
      description: "La nouvelle rémunération a été créée.",
    })
  }

  const handleEditRem = (index: number) => {
    setEditingRemIndex(index)
    setNewRemForm(remsList[index])
    setShowEditRemDialog(true)
  }

  const handleSaveRem = () => {
    if (editingRemIndex === null) return

    const updatedRems = [...remsList]
    updatedRems[editingRemIndex] = { ...newRemForm, type: "percentage" } // Added type
    setRemsList(updatedRems)

    setShowEditRemDialog(false)
    setEditingRemIndex(null)
    setNewRemForm({ label: "", value: 0, description: "" })

    toast({
      title: "REM modifiée",
      description: "La rémunération a été mise à jour.",
    })
  }

  const handleDeleteRem = (index: number) => {
    setRemsList(remsList.filter((_, i) => i !== index))

    toast({
      title: "REM supprimée",
      description: "La rémunération a été supprimée.",
      variant: "destructive",
    })
  }

  const handleSaveDetails = async () => {
    try {
      // TODO: Update in Supabase with server action
      setPlanInfo({
        ...planInfo,
        campaign_name: editDetailsForm.campaignName,
        start_date: editDetailsForm.startDate,
        end_date: editDetailsForm.endDate,
        estimated_budget: editDetailsForm.estimatedBudget,
      })

      toast({
        title: "Détails mis à jour",
        description: "Les informations du plan ont été modifiées.",
      })

      setShowEditDetailsDialog(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les détails.",
        variant: "destructive",
      })
    }
  }

  const handleSaveNegotiation = async () => {
    try {
      setPlanData({
        fixedFee: editNegotiationForm.fixedFee,
        hdrPct: editNegotiationForm.hdrPct,
        placementText: editNegotiationForm.placementText,
      })

      toast({
        title: "Négociation mise à jour",
        description: "Les paramètres de négociation ont été modifiés.",
      })

      setShowEditNegotiationDialog(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la négociation.",
        variant: "destructive",
      })
    }
  }

  const handleToggleParameterized = async (checked: boolean) => {
    try {
      setIsParameterized(checked)
      // TODO: Update in Supabase
      toast({
        title: checked ? "Plan paramétré" : "Paramétrage désactivé",
        description: checked ? "Le plan est maintenant marqué comme paramétré." : "Le plan ne sera plus suivi.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut.",
        variant: "destructive",
      })
    }
  }

  const handleToggleShouldFollow = async (checked: boolean) => {
    try {
      setShouldFollow(checked)
      // TODO: Update in Supabase
      toast({
        title: checked ? "Plan à suivre" : "Suivi désactivé",
        description: checked ? "Le plan sera inclus dans le suivi." : "Le plan ne sera plus suivi.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut.",
        variant: "destructive",
      })
    }
  }

  const handleSavePlacementsWithDates = async () => {
    try {
      const placementsWithDatesText = placementsWithDates
        .filter((p) => p.name.trim())
        .map((p) => {
          if (p.startDate && p.endDate) {
            return `${p.name} (${p.startDate} - ${p.endDate})`
          }
          return p.name
        })
        .join("\n")

      // Combiner avec texte libre s'il existe, séparés par "---"
      const combinedPlacementText = [placementText, placementsWithDatesText]
        .filter((text) => text.trim())
        .join("\n---\n")

      const { error } = await supabase
        .from("plans")
        .update({
          placement_text: combinedPlacementText,
        })
        .eq("id", params.id)

      if (error) throw error

      // Recharger le plan pour sync
      const updatedPlan = await getPlanWithDetails(params.id)
      setPlanInfo(updatedPlan)

      if (updatedPlan.placement_text) {
        const sections = updatedPlan.placement_text.split("\n---\n")
        if (sections.length > 1) {
          setPlacementText(sections[0])
          const dateSection = sections[1]
          const parsedPlacementsWithDates = dateSection
            .split("\n")
            .filter((line: string) => line.trim())
            .map((line: string) => {
              // Match pattern: "name (YYYY-MM-DD - YYYY-MM-DD)"
              const match = line.match(/^(.+?)\s*$$([^)]+)\s*-\s*([^)]+)$$$/)
              if (match && match[1] && match[2] && match[3]) {
                return {
                  name: match[1].trim(),
                  startDate: match[2].trim(),
                  endDate: match[3].trim(),
                }
              }
              return { name: line.trim(), startDate: "", endDate: "" }
            })
          setPlacementsWithDates(parsedPlacementsWithDates)
        } else {
          setPlacementText(updatedPlan.placement_text)
        }
      }

      toast({
        title: "Emplacements enregistrés",
        description: `${placementsWithDates.filter((p) => p.name.trim()).length} emplacement(s) avec dates sauvegardé(s)`,
      })
    } catch (error) {
      console.error("[v0] Error saving placements:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les emplacements",
        variant: "destructive",
      })
    }
  }

  const tabsContent = (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="details">Détails</TabsTrigger>
        <TabsTrigger value="rems">Rémunérations (REMs)</TabsTrigger>
        <TabsTrigger value="placements">Emplacements</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
        <TabsTrigger value="comments">Commentaires AM</TabsTrigger>
      </TabsList>

      {/* DÉTAILS - Résumé en lecture seule */}
      <TabsContent value="details" className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Résumé du Plan</CardTitle>
                <CardDescription>Vue d'ensemble - Modifiez via les onglets spécifiques</CardDescription>
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="parameterized"
                      checked={isParameterized}
                      onCheckedChange={handleToggleParameterized}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="parameterized" className="text-sm cursor-pointer">
                      Plan paramétré
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="follow"
                      checked={shouldFollow}
                      onCheckedChange={handleToggleShouldFollow}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="follow" className="text-sm cursor-pointer">
                      Inclus dans le suivi
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dans le résumé, afficher les DEUX types d'emplacements séparément */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Emplacements datés */}
              {placementsWithDates.filter((p) => p.name.trim()).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Emplacements avec dates</Label>
                  <div className="space-y-2">
                    {placementsWithDates
                      .filter((p) => p.name.trim())
                      .map((placement, idx) => (
                        <div key={idx} className="rounded-lg border p-3 bg-muted/30 text-sm">
                          <div className="font-medium">{placement.name}</div>
                          {placement.startDate && placement.endDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(placement.startDate).toLocaleDateString("fr-FR")} -{" "}
                              {new Date(placement.endDate).toLocaleDateString("fr-FR")}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Texte libre des emplacements */}
              {placementText && placementText.trim() && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Emplacements (Texte libre)</Label>
                  <div className="rounded-lg border p-4 bg-muted/30 text-sm whitespace-pre-wrap">{placementText}</div>
                </div>
              )}
            </div>

            <Separator />

            {/* Résumé des REMs */}
            <div>
              <p className="text-sm font-medium mb-3">Rémunérations définies ({remsList.length})</p>
              {remsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune rémunération définie</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {remsList.map((rem, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">{rem.label}</span>
                      <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                        +{rem.value}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Emplacements section - show both text and dated placements */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Emplacements</Label>

              {/* Emplacements datés */}
              {placementsWithDates.length > 0 && placementsWithDates.some((p) => p.name.trim()) && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-muted-foreground font-medium">Emplacements avec dates:</p>
                  <div className="space-y-2">
                    {placementsWithDates
                      .filter((p) => p.name.trim())
                      .map((placement, index) => (
                        <div
                          key={index}
                          className="text-sm bg-muted/30 p-3 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-medium">{placement.name}</span>
                          {placement.startDate && placement.endDate && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(placement.startDate).toLocaleDateString("fr-FR")} -{" "}
                              {new Date(placement.endDate).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Text placements */}
              {placementText && placementText.trim() && (
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground font-medium">Texte libre:</p>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{placementText}</div>
                </div>
              )}

              {!placementText?.trim() && placementsWithDates.filter((p) => p.name.trim()).length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun emplacement défini</p>
              )}
            </div>

            <Separator />

            {/* Résumé négociation */}
            <div>
              <p className="text-sm font-medium mb-3">Frais fixes négociés</p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-muted-foreground mb-1">Emplacements premium</p>
                <p className="text-2xl font-bold text-blue-600 flex items-baseline gap-1">
                  {planData.fixedFee}
                  <span className="text-lg">€</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* RÉMUNÉRATIONS - CRUD Complet */}
      <TabsContent value="rems" className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rémunérations (REMs)</CardTitle>
                <CardDescription>Ajoutez et gérez les différentes rémunérations du plan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Type de REM</Label>
                <Input
                  placeholder="Ex: Mobile Nouveaux Clients"
                  value={newRemForm.label}
                  onChange={(e) => setNewRemForm({ ...newRemForm, label: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label className="text-xs">Valeur (%)</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={newRemForm.value || ""}
                  onChange={(e) => setNewRemForm({ ...newRemForm, value: Number(e.target.value) })}
                  disabled={isReadOnly}
                />
              </div>
              <Button onClick={handleAddRem} size="sm" disabled={!newRemForm.label || !newRemForm.value || isReadOnly}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {remsList.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-emerald-900">
                    {remsList.length} rémunération{remsList.length > 1 ? "s" : ""} définie
                    {remsList.length > 1 ? "s" : ""}
                  </h4>
                  {/* No total - percentages don't add up */}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {remsList.map((rem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rem.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">HDR + {rem.value}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                          +{rem.value}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteRem(index)}
                          disabled={isReadOnly}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Frais Fixes</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditFixedFeeDialog(true)}
                  disabled={isReadOnly}
                >
                  Modifier
                </Button>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-muted-foreground mb-1">Emplacements premium</p>
                <p className="text-3xl font-bold text-blue-600 flex items-baseline gap-1">
                  {planData.fixedFee}
                  <span className="text-xl">€</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* New placements tab with two modes */}
      <TabsContent value="placements" className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Emplacements</CardTitle>
            <CardDescription>Définissez les zones de placement de la campagne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode selector */}
            <div className="flex items-center gap-4">
              <Label>Mode d'ajout</Label>
              <div className="flex gap-2">
                <Button
                  variant={placementMode === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlacementMode("text")}
                >
                  Texte libre
                </Button>
                <Button
                  variant={placementMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlacementMode("list")}
                >
                  Liste avec dates
                </Button>
              </div>
            </div>

            <Separator />

            {/* Text mode */}
            {placementMode === "text" && (
              <div className="space-y-3">
                <Label>Texte de placement (un emplacement par ligne)</Label>
                <Textarea
                  value={placementText}
                  onChange={(e) => setPlacementText(e.target.value)}
                  placeholder="Emplacement 1&#10;Emplacement 2&#10;Emplacement 3"
                  rows={8}
                  className="resize-none"
                  disabled={isReadOnly} // Disable if finalized
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (isReadOnly) {
                      toast({
                        title: "Plan finalisé",
                        description: "Ce plan ne peut plus être modifié car il a été validé ou rejeté.",
                        variant: "destructive",
                      })
                      return
                    }

                    const parsedPlacements = placementText
                      .split("\n")
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0)

                    setPlacements(parsedPlacements)

                    await supabase.from("plans").update({ placement_text: placementText }).eq("id", params.id)

                    toast({
                      title: "Emplacements enregistrés",
                      description: `${parsedPlacements.length} emplacement(s) sauvegardé(s)`,
                    })
                  }}
                  disabled={isReadOnly} // Disable button if finalized
                >
                  Enregistrer
                </Button>
              </div>
            )}

            {/* List mode with dates */}
            {placementMode === "list" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Liste des emplacements avec dates</Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPlacementsWithDates([...placementsWithDates, { name: "", startDate: "", endDate: "" }])
                    }}
                    disabled={isReadOnly}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un emplacement
                  </Button>
                </div>

                {placementsWithDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun emplacement défini</p>
                ) : (
                  <div className="space-y-3">
                    {placementsWithDates.map((placement, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Nom de l'emplacement"
                            value={placement.name}
                            onChange={(e) => {
                              const updated = [...placementsWithDates]
                              updated[index].name = e.target.value
                              setPlacementsWithDates(updated)
                            }}
                            className="flex-1"
                            disabled={isReadOnly}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => {
                              setPlacementsWithDates([...placementsWithDates, { ...placement }])
                              toast({ title: "Emplacement dupliqué" })
                            }}
                            title="Dupliquer"
                            disabled={isReadOnly}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setPlacementsWithDates(placementsWithDates.filter((_, i) => i !== index))
                              toast({ title: "Emplacement supprimé", variant: "destructive" })
                            }}
                            disabled={isReadOnly}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Date de début</Label>
                            <Input
                              type="date"
                              value={placement.startDate}
                              onChange={(e) => {
                                const updated = [...placementsWithDates]
                                updated[index].startDate = e.target.value
                                setPlacementsWithDates(updated)
                              }}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Date de fin</Label>
                            <Input
                              type="date"
                              value={placement.endDate}
                              onChange={(e) => {
                                const updated = [...placementsWithDates]
                                updated[index].endDate = e.target.value
                                setPlacementsWithDates(updated)
                              }}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={async () => {
                    if (isReadOnly) {
                      toast({
                        title: "Plan finalisé",
                        description: "Ce plan ne peut plus être modifié car il a été validé ou rejeté.",
                        variant: "destructive",
                      })
                      return
                    }
                    await handleSavePlacementsWithDates()
                  }}
                  disabled={isReadOnly} // Disable button if finalized
                >
                  Enregistrer tous les emplacements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Documents du plan</CardTitle>
            <CardDescription>
              Uploadez et gérez les documents liés à ce plan (emplacements, ressources, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUpload
              planId={params.id}
              onUploadComplete={() => setDocumentRefreshTrigger((prev) => prev + 1)}
              disabled={isReadOnly}
            />

            <Separator />

            <DocumentList planId={params.id} refreshTrigger={documentRefreshTrigger} disabled={isReadOnly} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* HISTORIQUE */}
      {/* Use the new 'history' value from TabsList */}
      <TabsContent value="history" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Historique des Statuts</h3>
          <p className="text-sm text-muted-foreground">Timeline complète des changements avec détails</p>
          <div className="space-y-4">
            {statusHistory.map((entry) => {
              const changes = typeof entry.changes === "string" ? JSON.parse(entry.changes) : entry.changes
              const hasChanges = changes && changes.original && changes.proposed

              return (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{entry.actorName}</span>
                          <Badge
                            variant={
                              entry.status === "approved"
                                ? "default"
                                : entry.status === "rejected"
                                  ? "destructive"
                                  : entry.status === "counter_proposal"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {entry.status === "approved"
                              ? "Validé"
                              : entry.status === "rejected"
                                ? "Rejeté"
                                : entry.status === "counter_proposal"
                                  ? "Contre-proposition"
                                  : entry.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.date} à {entry.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.message}</p>

                        {hasChanges && entry.status === "counter_proposal" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingCounterProposal(entry)}
                            className="mt-2"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Voir la contre-proposition
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </TabsContent>

      {/* Ajouter le contenu de l'onglet Commentaires AM */}
      <TabsContent value="comments" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Échanges Manager - Account Manager</h3>
          <p className="text-sm text-muted-foreground mb-4">Historique des communications internes sur ce plan</p>

          {internalComments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun commentaire pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {internalComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{comment.actorName || "Account Manager"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.date).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )

  const handleSaveFixedFee = async () => {
    try {
      setPlanData({ ...planData, fixedFee: Number.parseInt(editingFixedFee as string) || 0 })
      // TODO: Update in Supabase
      toast({
        title: "Frais fixes mis à jour",
        description: "Le montant des frais fixes a été modifié.",
      })
      setShowEditFixedFeeDialog(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les frais fixes.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {header}

        {statsCards}

        {actionAlerts}

        {/* Modifier le message d'alerte selon si le plan est terminé ou validé */}
        {isReadOnly && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Plan terminé - Facturation en cours</strong>
              <br />
              Ce plan ne peut plus être modifié car la date de fin est dépassée.
            </AlertDescription>
          </Alert>
        )}

        {!isReadOnly && planStatus === "approved" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Plan validé et envoyé au client</strong>
              <br />
              Le client a été notifié et peut maintenant valider le plan. Vous pouvez encore le modifier ou l'annuler
              tant qu'il n'est pas terminé.
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleRevertValidation}>
                  Rejeter finalement
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCounterProposalDialog(true)}>
                  Modifier le plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {tabsContent}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {planInfo.affiliate && (
              <PlanChatDialog
                planId={params.id}
                recipientId={planInfo.affiliate_id}
                recipientName={planInfo.affiliate.name}
                recipientEmail={planInfo.affiliate.email || "contact@affiliate.com"}
                recipientType="affiliate"
                context={`Plan - ${planInfo.campaign_name}`}
              >
                <Button variant="outline" disabled={isReadOnly}>
                  <User className="w-4 h-4 mr-2" />
                  Contacter l'affilié
                </Button>
              </PlanChatDialog>
            )}
            {planInfo.client && (
              <PlanChatDialog
                planId={params.id}
                recipientId={planInfo.client_id}
                recipientName={planInfo.client.name}
                recipientEmail={planInfo.client.email || "contact@client.com"}
                recipientType="client"
                context={`Plan - ${planInfo.campaign_name}`}
              >
                <Button variant="outline" disabled={isReadOnly}>
                  <Building className="w-4 h-4 mr-2" />
                  Contacter le client
                </Button>
              </PlanChatDialog>
            )}
          </div>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setShowInternalCommentDialog(true)}
            disabled={isReadOnly}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ajouter un commentaire
          </Button>
        </div>
      </div>

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "validate" ? "Valider le plan" : "Rejeter le plan"}</DialogTitle>
            <DialogDescription>
              {actionType === "validate"
                ? "Êtes-vous sûr de vouloir valider ce plan ? Le client et l'affilié seront notifiés."
                : "Indiquez la raison du rejet. Le client et l'affilié seront notifiés."}
            </DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2 py-4">
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Expliquez pourquoi ce plan est rejeté..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowActionDialog(false)
                setActionType(null)
                setRejectionReason("")
              }}
            >
              Annuler
            </Button>
            <Button
              variant={actionType === "validate" ? "default" : "destructive"}
              onClick={actionType === "validate" ? handleValidatePlan : handleRejectPlan}
              disabled={isSubmitting || (actionType === "reject" && !rejectionReason.trim())}
            >
              {isSubmitting ? "En cours..." : actionType === "validate" ? "Valider" : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCounterProposalDialog} onOpenChange={setShowCounterProposalDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingCounterProposal ? "Modifier la contre-proposition" : "Créer une contre-proposition complète"}
            </DialogTitle>
            <DialogDescription>
              Modifiez tous les éléments du plan : dates, frais, rémunérations, emplacements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Détails du plan</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom de campagne</Label>
                  <Input
                    value={counterProposalForm.campaignName || planInfo.campaign_name}
                    onChange={(e) => setCounterProposalForm({ ...counterProposalForm, campaignName: e.target.value })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input
                    type="date"
                    value={counterProposalForm.startDate || planInfo.start_date}
                    onChange={(e) => setCounterProposalForm({ ...counterProposalForm, startDate: e.target.value })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={counterProposalForm.endDate || planInfo.end_date}
                    onChange={(e) => setCounterProposalForm({ ...counterProposalForm, endDate: e.target.value })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Rémunérations</h3>
              <p className="text-sm text-muted-foreground">Ajustez les REMs pour cette contre-proposition</p>
              {/* Liste des REMs avec possibilité de modifier */}
              <div className="space-y-2">
                {remsList.map((rem, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="flex-1 text-sm">{rem.label}</span>
                    <Input
                      type="number"
                      className="w-20"
                      value={rem.value}
                      onChange={(e) => {
                        const updated = [...remsList]
                        updated[index].value = Number(e.target.value)
                        setRemsList(updated)
                        setCounterProposalForm({ ...counterProposalForm, remunerations: updated })
                      }}
                      disabled={isReadOnly}
                    />
                    <span className="text-sm">%</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Négociation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frais fixes (€)</Label>
                  <Input
                    type="number"
                    value={counterProposalForm.fixedFee || planData.fixedFee}
                    onChange={(e) =>
                      setCounterProposalForm({ ...counterProposalForm, fixedFee: Number(e.target.value) })
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Emplacements</h3>

              <div className="space-y-2">
                <Label>Texte de placement libre</Label>
                <Textarea
                  value={counterProposalForm.placementText || placementText}
                  onChange={(e) => setCounterProposalForm({ ...counterProposalForm, placementText: e.target.value })}
                  rows={3}
                  placeholder="Collez le texte des emplacements..."
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Emplacements avec dates</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPlacementsWithDates([...placementsWithDates, { name: "", startDate: "", endDate: "" }])
                    }}
                    disabled={isReadOnly}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {placementsWithDates.map((placement, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg space-y-2">
                      <Input
                        placeholder="Nom de l'emplacement"
                        value={placement.name}
                        onChange={(e) => {
                          const updated = [...placementsWithDates]
                          updated[idx].name = e.target.value
                          setPlacementsWithDates(updated)
                        }}
                        disabled={isReadOnly}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Date de début</Label>
                          <Input
                            type="date"
                            value={placement.startDate}
                            onChange={(e) => {
                              const updated = [...placementsWithDates]
                              updated[idx].startDate = e.target.value
                              setPlacementsWithDates(updated)
                            }}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Date de fin</Label>
                          <Input
                            type="date"
                            value={placement.endDate}
                            onChange={(e) => {
                              const updated = [...placementsWithDates]
                              updated[idx].endDate = e.target.value
                              setPlacementsWithDates(updated)
                            }}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPlacementsWithDates([...placementsWithDates, { ...placement }])
                          }}
                          disabled={isReadOnly}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Dupliquer
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setPlacementsWithDates(placementsWithDates.filter((_, i) => i !== idx))
                          }}
                          disabled={isReadOnly}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Message (optionnel)</Label>
              <Textarea
                value={counterProposalMessage}
                onChange={(e) => setCounterProposalMessage(e.target.value)}
                placeholder="Ajoutez un message pour expliquer vos modifications..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterProposalDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCounterProposalSubmit} disabled={isReadOnly || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la contre-proposition
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInternalCommentDialog} onOpenChange={setShowInternalCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire interne AM</DialogTitle>
            <DialogDescription asChild>
              <div>
                Ce commentaire sera visible uniquement par l'AM assigné à ce plan. Utilisez-le pour garder des notes
                privées sur ce plan.
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="internal-comment">Commentaire *</Label>
              <Textarea
                id="internal-comment"
                placeholder="Ex: Attention, le client est très exigeant sur les délais..."
                value={internalComment}
                onChange={(e) => setInternalComment(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Ce commentaire ne sera pas visible par le client ou l'affilié
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInternalCommentDialog(false)
                setInternalComment("")
              }}
            >
              Annuler
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleAddInternalComment}
              disabled={!internalComment.trim() || isReadOnly}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Enregistrer le commentaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRemDialog} onOpenChange={setShowEditRemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Rémunération</DialogTitle>
            <DialogDescription>Modifier cette structure de rémunération</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rem-label">Nom de la REM *</Label>
              <Input
                id="edit-rem-label"
                value={newRemForm.label}
                onChange={(e) => setNewRemForm({ ...newRemForm, label: e.target.value })}
                placeholder="Ex: Mobile - Nouveau Client, Travel..."
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rem-value">Valeur (%) *</Label>
              <Input
                id="edit-rem-value"
                type="number"
                step="0.01"
                value={newRemForm.value || ""}
                onChange={(e) => setNewRemForm({ ...newRemForm, value: Number.parseFloat(e.target.value) || 0 })}
                placeholder="4.00"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rem-desc">Description (optionnel)</Label>
              <Input
                id="edit-rem-desc"
                value={newRemForm.description}
                onChange={(e) => setNewRemForm({ ...newRemForm, description: e.target.value })}
                placeholder="Ex: NC / New Customer..."
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRemDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRem} disabled={!newRemForm.label.trim() || !newRemForm.value || isReadOnly}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddRemDialog} onOpenChange={setShowAddRemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une Nouvelle Rémunération</DialogTitle>
            <DialogDescription>Créer une structure de rémunération personnalisée</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-rem-label">Nom de la REM *</Label>
              <Input
                id="new-rem-label"
                value={newRemForm.label}
                onChange={(e) => setNewRemForm({ ...newRemForm, label: e.target.value })}
                placeholder="Ex: Mobile - Nouveau Client, Desktop Premium..."
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-rem-value">Valeur (%) *</Label>
              <Input
                id="new-rem-value"
                type="number"
                step="0.01"
                value={newRemForm.value || ""}
                onChange={(e) => setNewRemForm({ ...newRemForm, value: Number.parseFloat(e.target.value) || 0 })}
                placeholder="4.00"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">Valeur ajoutée au HDR (ex: 4% = HDR + 4%)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-rem-desc">Description (optionnel)</Label>
              <Input
                id="new-rem-desc"
                value={newRemForm.description}
                onChange={(e) => setNewRemForm({ ...newRemForm, description: e.target.value })}
                placeholder="Ex: NC / New Customer, Premium tier..."
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRemDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddRem} disabled={!newRemForm.label.trim() || !newRemForm.value || isReadOnly}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddPlacementDialog} onOpenChange={setShowAddPlacementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un Emplacement</DialogTitle>
            <DialogDescription>Définir un nouvel emplacement pour ce plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-placement">Texte de l'emplacement *</Label>
              <Textarea
                id="new-placement"
                value={newPlacement}
                onChange={(e) => setNewPlacement(e.target.value)}
                placeholder="Ex: Homepage - Bannière principale..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlacementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPlacement} disabled={isReadOnly}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPlacementDialog} onOpenChange={setShowEditPlacementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'Emplacement</DialogTitle>
            <DialogDescription>Modifier le texte de cet emplacement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-placement">Texte de l'emplacement *</Label>
              <Textarea
                id="edit-placement"
                value={editedPlacement}
                onChange={(e) => setEditedPlacement(e.target.value)}
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlacementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePlacement} disabled={isReadOnly}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDetailsDialog} onOpenChange={setShowEditDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier les Détails du Plan</DialogTitle>
            <DialogDescription>Modifier les informations générales du plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-campaign-name">Nom de la campagne *</Label>
              <Input
                id="edit-campaign-name"
                value={editDetailsForm.campaignName}
                onChange={(e) => setEditDetailsForm({ ...editDetailsForm, campaignName: e.target.value })}
                placeholder="Soldes d'hiver"
                disabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Date de début *</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editDetailsForm.startDate}
                  onChange={(e) => setEditDetailsForm({ ...editDetailsForm, startDate: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">Date de fin *</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editDetailsForm.endDate}
                  onChange={(e) => setEditDetailsForm({ ...editDetailsForm, endDate: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Budget estimé (€) *</Label>
              <Input
                id="edit-budget"
                type="number"
                value={editDetailsForm.estimatedBudget || ""}
                onChange={(e) =>
                  setEditDetailsForm({ ...editDetailsForm, estimatedBudget: Number.parseInt(e.target.value) || 0 })
                }
                placeholder="50000"
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDetailsDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveDetails} disabled={isReadOnly}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditNegotiationDialog} onOpenChange={setShowEditNegotiationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Négociation</DialogTitle>
            <DialogDescription>Ajuster les paramètres de négociation du plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fixed-fee">Frais fixes (€) *</Label>
                <Input
                  id="edit-fixed-fee"
                  type="number"
                  value={editNegotiationForm.fixedFee || ""}
                  onChange={(e) =>
                    setEditNegotiationForm({ ...editNegotiationForm, fixedFee: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="900"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hdr">HDR (%) *</Label>
                <Input
                  id="edit-hdr"
                  type="number"
                  value={editNegotiationForm.hdrPct || ""}
                  onChange={(e) =>
                    setEditNegotiationForm({ ...editNegotiationForm, hdrPct: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="10"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-placement">Texte de placement</Label>
              <Textarea
                id="edit-placement"
                value={editNegotiationForm.placementText}
                onChange={(e) => setEditNegotiationForm({ ...editNegotiationForm, placementText: e.target.value })}
                placeholder="Description de l'emplacement"
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNegotiationDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveNegotiation} disabled={isReadOnly}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPlacementTextDialog} onOpenChange={setShowEditPlacementTextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le texte de placement</DialogTitle>
            <DialogDescription>
              Collez votre texte ici. Les emplacements seront automatiquement extraits (un par ligne).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={editingPlacementText}
              onChange={(e) => setEditingPlacementText(e.target.value)}
              rows={10}
              placeholder="Emplacement 1&#10;Emplacement 2&#10;Emplacement 3"
              disabled={isReadOnly}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlacementTextDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePlacementText} disabled={isReadOnly}>
              Enregistrer et parser les emplacements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditFixedFeeDialog} onOpenChange={setShowEditFixedFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les frais fixes</DialogTitle>
            <DialogDescription>Montant fixe pour les emplacements premium</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fixedFee">Frais fixes (€)</Label>
              <Input
                id="fixedFee"
                type="number"
                value={editingFixedFee}
                onChange={(e) => setEditingFixedFee(e.target.value)}
                placeholder="Ex: 5000"
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFixedFeeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveFixedFee} disabled={isReadOnly}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCounterProposal} onOpenChange={() => setViewingCounterProposal(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Contre-proposition</DialogTitle>
            <DialogDescription>Comparaison entre la proposition originale et la contre-proposition</DialogDescription>
          </DialogHeader>

          {viewingCounterProposal &&
            (() => {
              const changes =
                typeof viewingCounterProposal.changes === "string"
                  ? JSON.parse(viewingCounterProposal.changes)
                  : viewingCounterProposal.changes

              if (!changes || !changes.original || !changes.proposed) {
                return <p className="text-sm text-muted-foreground">Aucun détail disponible</p>
              }

              const { original, proposed } = changes

              // Helper to format values, especially dates and numbers
              const formatDisplayValue = (value: any, field?: string): React.ReactNode => {
                if (value === null || value === undefined || value === "")
                  return <span className="italic text-muted-foreground">—</span>

                if (field === "startDate" || field === "endDate") {
                  try {
                    return new Date(value).toLocaleDateString("fr-FR")
                  } catch (e) {
                    return "—"
                  }
                }

                if (typeof value === "number") {
                  if (field === "fixedFee") return `${value}€`
                  if (field === "hdrPct" || field === "percentage") return `${value}%`
                  return value.toLocaleString("fr-FR")
                }

                if (Array.isArray(value)) {
                  if (value.length === 0) return <span className="italic text-muted-foreground">—</span>

                  return (
                    <ul className="list-disc pl-5 text-sm">
                      {value.map((item, index) => (
                        <li key={index}>
                          {typeof item === "object" && item !== null
                            ? Object.entries(item)
                                .map(([key, val]) => `${key}: ${formatDisplayValue(val, key)}`)
                                .join(", ")
                            : formatDisplayValue(item)}
                        </li>
                      ))}
                    </ul>
                  )
                }

                if (typeof value === "object" && value !== null) {
                  return (
                    <div className="text-sm whitespace-pre-wrap">
                      {Object.entries(value).map(([key, val]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key}:</span> {formatDisplayValue(val, key)}
                        </div>
                      ))}
                    </div>
                  )
                }

                return String(value)
              }

              const formatDiffValue = (field: string, originalValue: any, proposedValue: any): React.ReactNode => {
                // Normalize values for comparison
                const normalize = (val: any): string => {
                  if (val === null || val === undefined || val === "") return "—"
                  if (typeof val === "object") return JSON.stringify(val)
                  return String(val)
                }

                const origNorm = normalize(originalValue)
                const propNorm = normalize(proposedValue)
                const changed = origNorm !== propNorm

                // Special handling for remunerations (array comparison)
                if (field === "remunerations" && Array.isArray(originalValue) && Array.isArray(proposedValue)) {
                  const allRemNames = new Set([
                    ...originalValue.map((r: any) => r.name),
                    ...proposedValue.map((r: any) => r.name),
                  ])

                  return (
                    <div className="space-y-2">
                      {Array.from(allRemNames).map((remName: string, idx: number) => {
                        const origRem = originalValue.find((r: any) => r.name === remName)
                        const propRem = proposedValue.find((r: any) => r.name === remName)
                        const remChanged = origRem && propRem && origRem.percentage !== propRem.percentage
                        const isNew = !origRem && propRem
                        const isDeleted = origRem && !propRem

                        if (isNew) {
                          return (
                            <div key={idx} className="flex items-center gap-2 text-green-600">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Nouveau
                              </Badge>
                              <span className="font-medium underline decoration-2">{remName}:</span>
                              <span className="font-semibold">{propRem.percentage}%</span>
                            </div>
                          )
                        }
                        if (isDeleted) {
                          return (
                            <div key={idx} className="flex items-center gap-2 text-red-600">
                              <Badge variant="destructive" className="text-xs">
                                Supprimé
                              </Badge>
                              <span className="font-medium line-through">{remName}:</span>
                              <span className="line-through">{origRem.percentage}%</span>
                            </div>
                          )
                        }
                        if (remChanged) {
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-medium">{remName}:</span>
                              <span className="line-through text-red-600">{origRem.percentage}%</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="font-semibold text-green-600">{propRem.percentage}%</span>
                            </div>
                          )
                        }
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-medium">{remName}:</span>
                            <span>{origRem.percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                }

                // Special handling for placements with dates
                if (field === "placementsWithDates") {
                  const origPlacements = Array.isArray(originalValue) ? originalValue : []
                  const propPlacements = Array.isArray(proposedValue) ? proposedValue : []

                  if (origPlacements.length === 0 && propPlacements.length === 0) {
                    return <span className="text-muted-foreground">—</span>
                  }

                  const allPlacementKeys = new Set([
                    ...origPlacements.map((p: any, i: number) => `${p.name}-${i}`),
                    ...propPlacements.map((p: any, i: number) => `${p.name}-${i}`),
                  ])

                  return (
                    <div className="space-y-2">
                      {origPlacements.map((orig: any, idx: number) => {
                        const prop = propPlacements[idx]
                        if (!prop) {
                          // Deleted
                          return (
                            <div key={idx} className="p-2 rounded bg-red-50 border border-red-200">
                              <Badge variant="destructive" className="text-xs mb-1">
                                Supprimé
                              </Badge>
                              <div className="line-through text-red-600 text-sm">
                                {orig.name || "Sans nom"} ({orig.startDate} - {orig.endDate})
                              </div>
                            </div>
                          )
                        }
                        const nameChanged = orig.name !== prop.name
                        const datesChanged = orig.startDate !== prop.startDate || orig.endDate !== prop.endDate
                        if (nameChanged || datesChanged) {
                          return (
                            <div key={idx} className="space-y-1">
                              {nameChanged && (
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-red-600 text-sm">{orig.name || "Sans nom"}</span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="font-semibold text-green-600 text-sm">
                                    {prop.name || "Sans nom"}
                                  </span>
                                </div>
                              )}
                              {datesChanged && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="line-through text-red-600">
                                    {orig.startDate} - {orig.endDate}
                                  </span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-green-600 font-medium">
                                    {prop.startDate} - {prop.endDate}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        }
                        return (
                          <div key={idx} className="text-sm">
                            {orig.name || "Sans nom"} ({orig.startDate} - {orig.endDate})
                          </div>
                        )
                      })}
                      {propPlacements.slice(origPlacements.length).map((prop: any, idx: number) => (
                        <div key={`new-${idx}`} className="p-2 rounded bg-green-50 border border-green-200">
                          <Badge variant="secondary" className="text-xs mb-1 bg-green-100 text-green-700">
                            Nouveau
                          </Badge>
                          <div className="text-green-600 font-medium underline decoration-2 text-sm">
                            {prop.name || "Sans nom"} ({prop.startDate} - {prop.endDate})
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }

                // Default handling for simple values (strings, numbers, dates)
                if (changed) {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-600">{origNorm}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold text-green-600">{propNorm}</span>
                    </div>
                  )
                }

                return <span>{origNorm}</span>
              }

              return (
                <div className="space-y-6">
                  {/* Campaign details */}
                  <div>
                    <h4 className="font-semibold text-lg">Détails de la campagne</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Champ</TableHead>
                          <TableHead className="w-1/3">Avant</TableHead>
                          <TableHead className="w-1/3">Après</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { key: "campaignName", label: "Nom de campagne" },
                          { key: "client", label: "Client" },
                          { key: "affiliate", label: "Affilié" },
                          { key: "startDate", label: "Date de début" },
                          { key: "endDate", label: "Date de fin" },
                        ].map(({ key, label }) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{label}</TableCell>
                            <TableCell colSpan={2}>{formatDiffValue(key, original[key], proposed[key])}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Negotiation */}
                  <div>
                    <h4 className="font-semibold text-lg">Négociation</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Champ</TableHead>
                          <TableHead className="w-1/3">Avant</TableHead>
                          <TableHead className="w-1/3">Après</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Frais fixes</TableCell>
                          <TableCell colSpan={2}>
                            {formatDiffValue("fixedFee", original.fixedFee, proposed.fixedFee)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Remunerations */}
                  <div>
                    <h4 className="font-semibold text-lg">Rémunérations</h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      {formatDiffValue("remunerations", original.remunerations || [], proposed.remunerations || [])}
                    </div>
                  </div>

                  {/* Emplacements */}
                  <div>
                    <h4 className="font-semibold text-lg">Emplacements</h4>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Texte libre</h5>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        {formatDiffValue("placementText", original.placementText || "", proposed.placementText || "")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Emplacements avec dates</h5>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        {formatDiffValue(
                          "placementsWithDates",
                          original.placementsWithDates || [],
                          proposed.placementsWithDates || [],
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
