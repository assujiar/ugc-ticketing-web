"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchTicket(id: string) {
  const response = await fetch(`/api/tickets/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch ticket");
  }

  return response.json();
}

async function fetchAssignmentHistory(id: string) {
  const response = await fetch(`/api/tickets/${id}/assign`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch assignment history");
  }

  return response.json();
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useAssignmentHistory(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "assignments"],
    queryFn: () => fetchAssignmentHistory(ticketId),
    enabled: !!ticketId,
  });
}