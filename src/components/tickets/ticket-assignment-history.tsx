"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignTicket } from "@/hooks/useTicket";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import { Users, ArrowRight } from "lucide-react";

interface TicketAssignmentHistoryProps {
  ticketId: string;
}

interface Assignment {
  id: string;
  assigned_at: string;
  notes?: string;
  assignee: {
    id: string;
    full_name: string;
    email: string;
  };
  assigner: {
    id: string;
    full_name: string;
  };
}

export function TicketAssignmentHistory({ ticketId }: TicketAssignmentHistoryProps) {
  const { data, isLoading } = useAssignmentHistory(ticketId);

  const assignments: Assignment[] = data?.data || [];

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assignment History
          <Badge variant="secondary" className="ml-2">
            {assignments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className="flex items-start gap-3 relative"
            >
              {/* Timeline line */}
              {index < assignments.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-full bg-muted" />
              )}

              {/* Avatar */}
              <Avatar className="h-8 w-8 flex-shrink-0 z-10 bg-background">
                <AvatarFallback className="text-xs">
                  {getInitials(assignment.assignee?.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {assignment.assignee?.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    assigned by {assignment.assigner?.full_name}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDateTime(assignment.assigned_at)}
                  <span className="mx-1">•</span>
                  {formatRelativeTime(assignment.assigned_at)}
                </div>

                {assignment.notes && (
                  <p className="text-sm text-muted-foreground mt-1 border-l-2 border-muted-foreground/30 pl-2">
                    {assignment.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}