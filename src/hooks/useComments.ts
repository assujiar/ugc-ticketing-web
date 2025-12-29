"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateCommentRequest } from "@/types/api";

async function fetchComments(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/comments`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch comments");
  }

  return response.json();
}

async function createComment({
  ticketId,
  data,
}: {
  ticketId: string;
  data: CreateCommentRequest;
}) {
  const response = await fetch(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create comment");
  }

  return response.json();
}

export function useComments(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "comments"],
    queryFn: () => fetchComments(ticketId),
    enabled: !!ticketId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "comments"],
      });
      toast.success("Comment added", { description: "Your comment has been added successfully.",
       });
    },
    onError: (error: Error) => {
      toast.success("Error", { description: error.message,
        variant: "destructive",
       });
    },
  });
}