"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/auth-provider";
import type { Department, Role } from "@/types";
import { createClient } from "@/lib/supabase/client";

export function useDashboardSummary() {
  const { profile, isLoading: profileLoading, isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ["dashboard", "summary", profile?.id],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/summary", {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch dashboard");
      }

      return response.json();
    },
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    enabled: isAuthenticated && !profileLoading,
    retry: 2,
  });
}

export function useSLAMetrics(days = 30) {
  const { profile, isLoading: profileLoading, isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ["dashboard", "sla-metrics", days, profile?.id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/sla-metrics?days=${days}`, {
        credentials: "include",
      });

      if (!response.ok) {
        // Return empty data on error instead of throwing
        return { data: { metrics: [], trend: [], overall: {} } };
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    enabled: isAuthenticated && !profileLoading,
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
