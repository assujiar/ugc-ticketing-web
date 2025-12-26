"use client";

import { TicketCard } from "./ticket-card";
import { TicketFilters } from "./ticket-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useTickets } from "@/hooks/useTickets";
import { useTicketStore } from "@/store/ticketStore";
import { FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import type { Ticket } from "@/types";

interface TicketListProps {
  initialData?: Ticket[];
}

export function TicketList({ initialData }: TicketListProps) {
  const { filters, pagination, setPage } = useTicketStore();

  const { data, isLoading, isError, error } = useTickets({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
    department: filters.department !== "all" ? filters.department : undefined,
    search: filters.search || undefined,
    assignedToMe: filters.assignedToMe || undefined,
    createdByMe: filters.createdByMe || undefined,
  });

  const tickets = data?.data || initialData || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading tickets: {error?.message || "Unknown error"}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TicketFilters />

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {tickets.length} of {total} ticket{total !== 1 ? "s" : ""}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No tickets found"
          description="Try adjusting your filters or create a new ticket."
          action={{
            label: "Create Ticket",
            href: "/tickets/new",
          }}
        />
      ) : (
        <>
          {/* Ticket grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket: Ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
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
        </>
      )}
    </div>
  );
}