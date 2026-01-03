import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types";

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  open: { label: "Open", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  pending: { label: "Pending", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "default" },
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "default" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
