"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  ApiResponse
} from "@/types/api";
import type { Ticket } from "@/types";

// Re-export useTickets and useTicket from useTickets.ts
export { useTickets, useTicket } from "./useTickets";

// Create ticket mutation
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketRequest) => {
      return apiRequest<ApiResponse<Ticket>>("/api/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Update ticket mutation
export function useUpdateTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTicketRequest) => {
      return apiRequest<ApiResponse<Ticket>>(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

// Delete ticket mutation
export function useDeleteTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiRequest<ApiResponse<null>>(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.removeQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}

// Assign ticket mutation
export function useAssignTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignTicketRequest) => {
      return apiRequest<ApiResponse<Ticket>>(`/api/tickets/${ticketId}/assign`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}
