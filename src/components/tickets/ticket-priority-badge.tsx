import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { TicketPriority } from "@/types";
import type { LucideIcon } from "lucide-react";

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  showIcon?: boolean;
}

interface PriorityConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  icon: LucideIcon;
}

const priorityConfig: Record<TicketPriority, PriorityConfig> = {
  urgent: { label: "Urgent", variant: "destructive", icon: AlertTriangle },
  high: { label: "High", variant: "warning", icon: ArrowUp },
  medium: { label: "Medium", variant: "default", icon: Minus },
  low: { label: "Low", variant: "secondary", icon: ArrowDown },
};

export function TicketPriorityBadge({ priority, showIcon = true }: TicketPriorityBadgeProps) {
  const config = priorityConfig[priority] || { 
    label: priority, 
    variant: "default" as const, 
    icon: Minus 
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
