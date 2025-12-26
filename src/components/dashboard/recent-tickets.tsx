"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { TicketPriorityBadge } from "@/components/tickets/ticket-priority-badge";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, ArrowRight, Ticket } from "lucide-react";
import type { Ticket as TicketType } from "@/types";

interface RecentTicketsProps {
  tickets: TicketType[];
}

export function RecentTickets({ tickets }: RecentTicketsProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (tickets.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Ticket className="h-12 w-12 mb-4 opacity-50" />
          <p>No recent tickets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Tickets
        </CardTitle>
        <Link href="/tickets">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.slice(0, 5).map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(ticket.creator?.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">
                    {ticket.ticket_code}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {ticket.departments?.code}
                  </span>
                </div>

                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {ticket.subject}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatRelativeTime(ticket.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}