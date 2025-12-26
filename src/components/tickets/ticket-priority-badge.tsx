import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";

interface TicketPriorityBadgeProps {
  priority: string;
  showIcon?: boolean;
  className?: string;
}

const priorityConfig: Record
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "warning" | "success";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  urgent: { label: "Urgent", variant: "destructive", icon: AlertTriangle },
  high: { label: "High", variant: "warning", icon: ArrowUp },
  medium: { label: "Medium", variant: "secondary", icon: Minus },
  low: { label: "Low", variant: "default", icon: ArrowDown },
};

export function TicketPriorityBadge({
  priority,
  showIcon = true,
  className,
}: TicketPriorityBadgeProps) {
  const config = priorityConfig[priority] || {
    label: priority,
    variant: "default" as const,
    icon: Minus,
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("capitalize gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: "text-red-500",
    high: "text-orange-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };
  return colors[priority] || "text-gray-500";
}