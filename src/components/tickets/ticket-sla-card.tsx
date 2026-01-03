"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, CheckCircle, AlertTriangle } from "lucide-react";

interface TicketSLACardProps {
  ticket: any;
}

function formatDuration(start: string, end?: string | null): string {
  if (!start) return "-";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getSLAStatus(hours: number): { status: string; color: string } {
  if (hours <= 4) return { status: "On Track", color: "text-green-400 bg-green-500/20" };
  if (hours <= 24) return { status: "Warning", color: "text-yellow-400 bg-yellow-500/20" };
  return { status: "Overdue", color: "text-red-400 bg-red-500/20" };
}

export function TicketSLACard({ ticket }: TicketSLACardProps) {
  if (!ticket?.created_at) return null;

  const createdAt = new Date(ticket.created_at);
  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  const totalDuration = ticket.closed_at || ticket.resolved_at
    ? formatDuration(ticket.created_at, ticket.closed_at || ticket.resolved_at)
    : formatDuration(ticket.created_at);
  
  const slaStatus = ticket.status === "closed" || ticket.status === "resolved"
    ? { status: "Completed", color: "text-blue-400 bg-blue-500/20" }
    : getSLAStatus(ageHours);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="h-5 w-5" />
          SLA Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Status</span>
          <Badge className={slaStatus.color}>
            {slaStatus.status === "On Track" && <CheckCircle className="h-3 w-3 mr-1" />}
            {(slaStatus.status === "Warning" || slaStatus.status === "Overdue") && <AlertTriangle className="h-3 w-3 mr-1" />}
            {slaStatus.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Ticket Age</span>
          <span className="font-mono text-sm">{totalDuration}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">First Response</span>
          <span className="font-mono text-sm text-white/40">
            {ticket.first_response_at 
              ? formatDuration(ticket.created_at, ticket.first_response_at)
              : "Awaiting..."}
          </span>
        </div>

        {(ticket.resolved_at || ticket.closed_at) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Resolution Time</span>
            <span className="font-mono text-sm text-green-400">
              {formatDuration(ticket.created_at, ticket.resolved_at || ticket.closed_at)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Timeline</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Created</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            {ticket.first_response_at && (
              <div className="flex justify-between">
                <span className="text-white/60">First Response</span>
                <span>{new Date(ticket.first_response_at).toLocaleString()}</span>
              </div>
            )}
            {ticket.closed_at && (
              <div className="flex justify-between">
                <span className="text-white/60">Closed</span>
                <span>{new Date(ticket.closed_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
