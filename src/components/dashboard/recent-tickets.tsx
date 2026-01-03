"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, ArrowRight, Ticket } from "lucide-react";

interface RecentTicket {
  id: string;
  ticket_code?: string;
  subject?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  department?: string;
  creator?: { full_name?: string } | null;
  departments?: { code?: string; name?: string } | null;
}

interface RecentTicketsProps {
  tickets: RecentTicket[];
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  need_response: "bg-orange-500/20 text-orange-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  waiting_customer: "bg-yellow-500/20 text-yellow-400",
  closed: "bg-green-500/20 text-green-400",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

export function RecentTickets({ tickets }: RecentTicketsProps) {
  if (!tickets || tickets.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-white/40">
          <Ticket className="h-12 w-12 mb-4 opacity-50" />
          <p>No recent tickets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Tickets
        </CardTitle>
        <Link href="/tickets">
          <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/10">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.slice(0, 5).map((ticket) => (
            <Link
              key={ticket.id}
              href={"/tickets/" + ticket.id}
              className="block p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-orange-400">
                  {ticket.ticket_code || "N/A"}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/60">
                  {ticket.department || ticket.departments?.name || "Unknown"}
                </span>
              </div>
              <p className="font-medium text-sm truncate mb-2">
                {ticket.subject || "No subject"}
              </p>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[ticket.status || "open"] || statusColors.open}>
                  {ticket.status || "open"}
                </Badge>
                <Badge className={priorityColors[ticket.priority || "medium"] || priorityColors.medium}>
                  {ticket.priority || "medium"}
                </Badge>
                <span className="text-xs text-white/40 ml-auto">
                  {ticket.created_at ? formatRelativeTime(ticket.created_at) : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
