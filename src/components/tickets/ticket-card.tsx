"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { Clock, User, Building2 } from "lucide-react";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const creatorInitials = ticket.creator?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="glass-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm text-muted-foreground">
                {ticket.ticket_code}
              </span>
              <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>

          {/* Subject */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
            {ticket.subject}
          </h3>

          {/* Description preview */}
          {ticket.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {ticket.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{ticket.departments?.name || ticket.departments?.code}</span>
            </div>

            <TicketPriorityBadge priority={ticket.priority} showIcon={true} />

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(ticket.created_at)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {creatorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {ticket.creator?.full_name}
              </span>
            </div>

            {ticket.assignee && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{ticket.assignee.full_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}