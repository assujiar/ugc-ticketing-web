"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { TicketAttachment } from "@/types";
import type { ApiResponse } from "@/types/api";

export function useAttachments(ticketId: string) {
  return useQuery({
    queryKey: ["attachments", ticketId],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: TicketAttachment[] }>(
        `/api/tickets/${ticketId}/attachments`
      );
      return response.data;
    },
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
}

export function useUploadAttachment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json() as Promise<ApiResponse<TicketAttachment>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", ticketId] });
    },
  });
}

export function useDeleteAttachment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      return apiRequest<ApiResponse>(
        `/api/tickets/${ticketId}/attachments?attachmentId=${attachmentId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", ticketId] });
    },
  });
}
