"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchAssignmentHistory(ticketId: string) {
  const res = await fetch(\/api/tickets/\/assignments\);
  if (!res.ok) {
    let message = "Failed to fetch assignment history";
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function useAssignmentHistory(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "assignments"],
    queryFn: () => fetchAssignmentHistory(ticketId),
    enabled: !!ticketId,
  });
}