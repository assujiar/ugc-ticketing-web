"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { RateQuote } from "@/types";
import type { CreateQuoteRequest, UpdateQuoteRequest, ApiResponse } from "@/types/api";

export function useQuotes(ticketId: string) {
  return useQuery({
    queryKey: ["quotes", ticketId],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: RateQuote[] }>(
        `/api/tickets/${ticketId}/quotes`
      );
      return response.data;
    },
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
}

export function useCreateQuote(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuoteRequest) => {
      return apiRequest<ApiResponse<RateQuote>>(`/api/tickets/${ticketId}/quotes`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", ticketId] });
    },
  });
}

export function useUpdateQuote(ticketId: string, quoteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateQuoteRequest) => {
      return apiRequest<ApiResponse<RateQuote>>(
        `/api/tickets/${ticketId}/quotes?quoteId=${quoteId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", ticketId] });
    },
  });
}
