"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Building2, Trophy, XCircle } from "lucide-react";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
  hideCustomer?: boolean;
}

export function TicketCard({ ticket, hideCustomer = false }: TicketCardProps) {
  const ticketData = ticket as any; // Cast untuk akses metadata
  
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="group hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer h-full hover:border-white/20 hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-mono text-orange-400 group-hover:text-orange-300 transition-colors">
                {ticket.ticket_code}
              </p>
              <CardTitle className="text-base line-clamp-2 group-hover:text-white transition-colors">
                {ticket.subject}
              </CardTitle>
              {/* Customer name - hidden for operation roles */}
              {!hideCustomer && ticketData.metadata?.customer_name && (
                <p className="text-xs text-white/40">
                  {ticketData.metadata.customer_name}
                </p>
              )}
            </div>
            <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
            {ticketData.close_outcome === "won" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Trophy className="h-3 w-3 mr-1" />
                Won
              </Badge>
            )}
            {ticketData.close_outcome === "lost" && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                Lost
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{ticket.departments?.name || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{ticket.creator?.full_name || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(ticket.created_at), "dd MMM yyyy")}</span>
            </div>
          </div>

          {ticket.assignee && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                Assigned to: <span className="font-medium text-white/70">{ticket.assignee.full_name}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
