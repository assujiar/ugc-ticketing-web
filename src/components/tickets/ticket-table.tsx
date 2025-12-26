"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { useTickets } from "@/hooks/useTickets";
import { useTicketStore } from "@/store/ticketStore";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Ticket } from "@/types";

export function TicketTable() {
  const { filters, pagination, setPage } = useTicketStore();

  const { data, isLoading } = useTickets({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
    department: filters.department !== "all" ? filters.department : undefined,
    search: filters.search || undefined,
    assignedToMe: filters.assignedToMe || undefined,
    createdByMe: filters.createdByMe || undefined,
  });

  const tickets = data?.data || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[140px]">Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[100px]">Department</TableHead>
              <TableHead className="w-[120px]">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket: Ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">
                    {ticket.ticket_code}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate font-medium">
                      {ticket.subject}
                    </div>
                    {ticket.assignee && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        → {ticket.assignee.full_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
                  </TableCell>
                  <TableCell>
                    <TicketStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <TicketPriorityBadge priority={ticket.priority} showIcon={true} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ticket.departments?.code}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(ticket.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}