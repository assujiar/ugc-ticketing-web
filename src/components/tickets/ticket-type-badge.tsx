import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileQuestion, FileText } from "lucide-react";

interface TicketTypeBadgeProps {
  type: string;
  showIcon?: boolean;
  className?: string;
}

const typeConfig: Record
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  RFQ: {
    label: "Rate Inquiry",
    variant: "outline",
    icon: FileQuestion,
    color: "border-primary text-primary",
  },
  GEN: {
    label: "General",
    variant: "outline",
    icon: FileText,
    color: "border-secondary text-secondary-foreground",
  },
};

export function TicketTypeBadge({
  type,
  showIcon = true,
  className,
}: TicketTypeBadgeProps) {
  const config = typeConfig[type] || {
    label: type,
    variant: "outline" as const,
    icon: FileText,
    color: "",
  };
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1", config.color, className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}