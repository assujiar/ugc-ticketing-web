"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTickets } from "@/hooks/useTickets";
import { useTicketStore } from "@/store/ticketStore";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ExternalLink, Clock, Trophy, XCircle } from "lucide-react";

export function TicketTable() {
  const router = useRouter();
  const { filters, search, pagination, setPage } = useTicketStore();
  const { data, isLoading, error } = useTickets({
    ...filters,
    search,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const handleRowClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load tickets</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-table">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="glass-table text-center py-16">
        <p className="text-white/40 text-lg">No tickets found</p>
        <p className="text-white/30 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="glass-table overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Ticket</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Subject</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Type</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Priority</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Department</th>
              <th className="text-left py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Created</th>
              <th className="text-center py-4 px-4 text-xs font-semibold text-white/60 uppercase tracking-wider w-[60px]">
                <ExternalLink className="h-4 w-4 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((ticket: any) => (
              <tr
                key={ticket.id}
                onClick={() => handleRowClick(ticket.id)}
                className="group border-b border-white/5 cursor-pointer transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-white/[0.08] hover:via-white/[0.05] hover:to-transparent hover:backdrop-blur-md hover:border-white/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.15)] active:bg-gradient-to-r active:from-orange-500/20 active:via-orange-500/10 active:to-transparent"
              >
                <td className="py-4 px-4">
                  <span className="font-mono text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                    {ticket.ticket_code}
                  </span>
                </td>
                <td className="py-4 px-4 max-w-[250px]">
                  <p className="truncate text-white/90 group-hover:text-white font-medium transition-colors">
                    {ticket.subject}
                  </p>
                  {ticket.metadata?.customer_name && (
                    <p className="text-xs text-white/40 truncate mt-0.5">
                      {ticket.metadata.customer_name}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <TicketTypeBadge type={ticket.ticket_type} showIcon={false} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <TicketStatusBadge status={ticket.status} />
                    {ticket.close_outcome === "won" && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Trophy className="h-3 w-3 mr-1" />Won
                      </Badge>
                    )}
                    {ticket.close_outcome === "lost" && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />Lost
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                    {ticket.departments?.name || "-"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-white/50 group-hover:text-white/70 transition-colors">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-sm">{format(new Date(ticket.created_at), "dd MMM yyyy")}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:shadow-lg group-hover:shadow-orange-500/10 transition-all duration-300">
                    <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-orange-400 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-white/50">
            Showing <span className="text-white/80 font-medium">{(data.pagination.page - 1) * data.pagination.pageSize + 1}</span> to{" "}
            <span className="text-white/80 font-medium">{Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)}</span> of{" "}
            <span className="text-white/80 font-medium">{data.pagination.total}</span> tickets
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(data.pagination.page - 1)} disabled={data.pagination.page <= 1} className="border-white/10 hover:bg-white/10 hover:border-white/20">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (data.pagination.totalPages <= 5) pageNum = i + 1;
                else if (data.pagination.page <= 3) pageNum = i + 1;
                else if (data.pagination.page >= data.pagination.totalPages - 2) pageNum = data.pagination.totalPages - 4 + i;
                else pageNum = data.pagination.page - 2 + i;
                return (
                  <Button key={pageNum} variant={pageNum === data.pagination.page ? "default" : "outline"} size="sm" onClick={() => setPage(pageNum)}
                    className={pageNum === data.pagination.page ? "bg-orange-500 hover:bg-orange-600 border-orange-500" : "border-white/10 hover:bg-white/10 hover:border-white/20"}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage(data.pagination.page + 1)} disabled={data.pagination.page >= data.pagination.totalPages} className="border-white/10 hover:bg-white/10 hover:border-white/20">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
