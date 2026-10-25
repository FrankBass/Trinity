"use client"

import type { AuditLog } from "@/lib/data/audit-log-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Edit, Trash2, Plus, Target, FileText, Users, Download, Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface ActivityTimelineProps {
  logs: AuditLog[]
  showUser?: boolean
}

const actionIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  validate: CheckCircle2,
  reject: XCircle,
  counter_proposal: FileText,
  assign: Users,
  unassign: Users,
  set_objectives: Target,
  update_objectives: Target,
  export: Download,
  import: Upload,
  login: Users,
  logout: Users,
}

const actionColors = {
  create: "bg-green-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
  validate: "bg-green-500",
  reject: "bg-red-500",
  counter_proposal: "bg-yellow-500",
  assign: "bg-purple-500",
  unassign: "bg-gray-500",
  set_objectives: "bg-indigo-500",
  update_objectives: "bg-indigo-500",
  export: "bg-cyan-500",
  import: "bg-cyan-500",
  login: "bg-gray-500",
  logout: "bg-gray-500",
}

const actionLabels = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  validate: "Validation",
  reject: "Rejet",
  counter_proposal: "Contre-proposition",
  assign: "Assignation",
  unassign: "Désassignation",
  set_objectives: "Définition d'objectifs",
  update_objectives: "Mise à jour d'objectifs",
  export: "Export",
  import: "Import",
  login: "Connexion",
  logout: "Déconnexion",
}

export function ActivityTimeline({ logs, showUser = true }: ActivityTimelineProps) {
  // Group logs by date
  const groupedLogs = logs.reduce(
    (acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(log)
      return acc
    },
    {} as Record<string, AuditLog[]>,
  )

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Aucune activité enregistrée</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{date}</h3>
          <div className="space-y-4">
            {dateLogs.map((log) => {
              const Icon = actionIcons[log.action]
              const colorClass = actionColors[log.action]
              const actionLabel = actionLabels[log.action]

              return (
                <div key={log.id} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {dateLogs.indexOf(log) !== dateLogs.length - 1 && (
                      <div className="absolute top-10 left-5 w-px h-8 bg-border" />
                    )}
                  </div>

                  <Card className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{actionLabel}</Badge>
                          {showUser && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-xs">
                                  {log.userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{log.userName}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">{log.description}</p>

                        {log.changes && log.changes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground">
                                <span className="font-medium">{change.field}:</span>{" "}
                                <span className="line-through">{String(change.before)}</span>
                                {" → "}
                                <span className="text-foreground font-medium">{String(change.after)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
