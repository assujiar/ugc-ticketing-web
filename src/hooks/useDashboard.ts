"use client";

import { useQuery } from "@tanstack/react-query";
import type { Department, Role } from "@/types";
import { createClient } from "@/lib/supabase/client";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/summary", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch" }));
        console.error("Dashboard API error:", error);
        throw new Error(error.message || "Failed to fetch dashboard");
      }

      const result = await response.json();
      console.log("Dashboard data:", result);
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
        // Return empty data on error instead of throwing
        return { data: { metrics: [], trend: [], overall: {} } };
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useDepartments() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Department[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoles() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Role[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
