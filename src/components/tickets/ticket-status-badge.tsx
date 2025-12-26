import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TicketStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" }
> = {
  open: { label: "Open", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  pending: { label: "Pending", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "default" },
};

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "default" as const };

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "bg-blue-500",
    in_progress: "bg-amber-500",
    pending: "bg-gray-500",
    resolved: "bg-green-500",
    closed: "bg-slate-700",
  };
  return colors[status] || "bg-gray-500";
}