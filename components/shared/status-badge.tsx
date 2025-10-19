import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

type Status = "success" | "pending" | "error" | "warning"

interface StatusBadgeProps {
  status: Status
  label: string
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  },
  pending: {
    icon: Clock,
    className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  },
  error: {
    icon: XCircle,
    className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
}
