"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchDashboardSummary() {
  const response = await fetch("/api/dashboard/summary");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch dashboard summary");
  }

  return response.json();
}

async function fetchSLAMetrics(days: number = 30) {
  const response = await fetch(`/api/dashboard/sla-metrics?days=${days}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch SLA metrics");
  }

  return response.json();
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useSLAMetrics(days: number = 30) {
  return useQuery({
    queryKey: ["dashboard", "sla-metrics", days],
    queryFn: () => fetchSLAMetrics(days),
    staleTime: 60 * 1000,
  });
}