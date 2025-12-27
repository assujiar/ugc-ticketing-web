"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { Clock, User, Building2 } from "lucide-react";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-mono text-muted-foreground">
                {ticket.ticket_code}
              </p>
              <CardTitle className="text-base line-clamp-2">
                {ticket.subject}
              </CardTitle>
            </div>
            <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{ticket.departments?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{ticket.creator?.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(ticket.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>

          {ticket.assignee && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Assigned to: <span className="font-medium">{ticket.assignee.full_name}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
