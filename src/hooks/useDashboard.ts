"use client";
import { useQuery } from "@tanstack/react-query";
import type { Department, Role } from "@/types";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/summary", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch" }));
        console.error("Dashboard API error:", error);
        throw new Error(error.message || "Failed to fetch dashboard");
      }
      const result = await response.json();
      return result;
    },
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
}

export function useSLAMetrics(days = 30) {
  return useQuery({
    queryKey: ["dashboard", "sla-metrics", days],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/sla-metrics?days=${days}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        return { data: { metrics: [], trend: [], overall: {} } };
      }
      return response.json();
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useResponseTimeMetrics() {
  return useQuery({
    queryKey: ["dashboard", "response-time"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/response-time", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        return { data: { userMetrics: [], roleMetrics: [], overall: {} } };
      }
      return response.json();
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fetch("/api/departments", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const result = await response.json();
      return result.data as Department[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const result = await response.json();
      return result.data as Role[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
