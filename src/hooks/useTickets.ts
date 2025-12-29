"use client";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Ticket, TicketFilters, PaginatedResponse } from "@/types";

interface UseTicketsOptions extends Partial<TicketFilters> {
  enabled?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { enabled = true, ...filters } = options;
  
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== "all") {
        params.set("status", filters.status);
      }
      if (filters.priority && filters.priority !== "all") {
        params.set("priority", filters.priority);
      }
      if (filters.type && filters.type !== "all") {
        params.set("type", filters.type);
      }
      if (filters.department && filters.department !== "all") {
        params.set("department", filters.department);
      }
      if (filters.search) {
        params.set("search", filters.search);
      }
      if (filters.page) {
        params.set("page", String(filters.page));
      }
      if (filters.pageSize) {
        params.set("pageSize", String(filters.pageSize));
      }
      
      const queryString = params.toString();
      const url = "/api/tickets" + (queryString ? "?" + queryString : "");
      return apiRequest<PaginatedResponse<Ticket>>(url);
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useTicket(id: string, enabled = true) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: Ticket }>(
        "/api/tickets/" + id
      );
      return response;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}
