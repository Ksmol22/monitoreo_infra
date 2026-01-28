import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const config = {
    online: {
      color: "text-green-700 bg-green-50 border-green-200",
      icon: CheckCircle2,
      label: "Online"
    },
    active: {
      color: "text-green-700 bg-green-50 border-green-200",
      icon: CheckCircle2,
      label: "Active"
    },
    warning: {
      color: "text-yellow-700 bg-yellow-50 border-yellow-200",
      icon: AlertTriangle,
      label: "Warning"
    },
    offline: {
      color: "text-red-700 bg-red-50 border-red-200",
      icon: XCircle,
      label: "Offline"
    },
    error: {
      color: "text-red-700 bg-red-50 border-red-200",
      icon: XCircle,
      label: "Error"
    },
    pending: {
      color: "text-blue-700 bg-blue-50 border-blue-200",
      icon: Clock,
      label: "Pending"
    }
  };

  const current = config[normalizedStatus as keyof typeof config] || config.pending;
  const Icon = current.icon;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      current.color,
      className
    )}>
      <Icon className="w-3 h-3 mr-1.5" />
      {current.label}
    </span>
  );
}
