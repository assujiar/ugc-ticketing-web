"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { CreateQuoteRequest } from "@/types/api";

async function fetchQuotes(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/quotes`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch quotes");
  }

  return response.json();
}

async function createQuote({
  ticketId,
  data,
}: {
  ticketId: string;
  data: CreateQuoteRequest;
}) {
  const response = await fetch(`/api/tickets/${ticketId}/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create quote");
  }

  return response.json();
}

async function updateQuote({
  ticketId,
  quoteId,
  data,
}: {
  ticketId: string;
  quoteId: string;
  data: Partial<CreateQuoteRequest> & { status?: string };
}) {
  const response = await fetch(
    `/api/tickets/${ticketId}/quotes?quote_id=${quoteId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update quote");
  }

  return response.json();
}

async function deleteQuote({
  ticketId,
  quoteId,
}: {
  ticketId: string;
  quoteId: string;
}) {
  const response = await fetch(
    `/api/tickets/${ticketId}/quotes?quote_id=${quoteId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete quote");
  }

  return response.json();
}

export function useQuotes(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "quotes"],
    queryFn: () => fetchQuotes(ticketId),
    enabled: !!ticketId,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createQuote,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "quotes"],
      });
      toast({
        title: "Quote created",
        description: `Quote ${data.data?.quote_number || ""} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "quotes"],
      });
      toast({
        title: "Quote updated",
        description: "The quote has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "quotes"],
      });
      toast({
        title: "Quote deleted",
        description: "The quote has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}