import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle } from "lucide-react";
import type { TicketType } from "@/types";
import type { LucideIcon } from "lucide-react";

interface TicketTypeBadgeProps {
  type: TicketType;
  showIcon?: boolean;
}

interface TypeConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  icon: LucideIcon;
  color: string;
}

const typeConfig: Record<TicketType, TypeConfig> = {
  RFQ: {
    label: "Rate Inquiry",
    variant: "info",
    icon: FileText,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  GEN: {
    label: "General Request",
    variant: "secondary",
    icon: HelpCircle,
    color: "text-gray-600 bg-gray-100 dark:bg-gray-800",
  },
};

export function TicketTypeBadge({ type, showIcon = true }: TicketTypeBadgeProps) {
  const config = typeConfig[type] || {
    label: type,
    variant: "default" as const,
    icon: HelpCircle,
    color: "",
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.color}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
