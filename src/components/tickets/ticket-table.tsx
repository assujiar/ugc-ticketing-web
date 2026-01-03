"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useTickets } from "@/hooks/useTickets";
import { useTicketStore } from "@/store/ticketStore";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
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
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Ticket } from "@/types";

export function TicketTable() {
  const { filters, search, pagination, setPage } = useTicketStore();
  const { data, isLoading, error } = useTickets({
    ...filters,
    search,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load tickets</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((ticket: Ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-sm">
                  {ticket.ticket_code}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {ticket.subject}
                </TableCell>
                <TableCell>
                  <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
                </TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
                </TableCell>
                <TableCell>{ticket.departments?.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(ticket.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/tickets/${ticket.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1} to{" "}
            {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of{" "}
            {data.pagination.total} tickets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(data.pagination.page - 1)}
              disabled={data.pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(data.pagination.page + 1)}
              disabled={data.pagination.page >= data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
