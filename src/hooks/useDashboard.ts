"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Department, Role } from "@/types";

export function useDashboardSummary() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("status");
      
      if (error) throw error;
      
      const tickets = data || [];
      return {
        total: tickets.length,
        open: tickets.filter(t => t.status === "open").length,
        inProgress: tickets.filter(t => t.status === "in_progress").length,
        resolved: tickets.filter(t => t.status === "resolved").length,
        pending: tickets.filter(t => t.status === "pending").length,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useSLAMetrics(days = 30) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["dashboard", "sla-metrics", days],
    queryFn: async () => {
      // Get tickets from last N days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          status,
          created_at,
          resolved_at,
          department_id,
          departments (
            id,
            code,
            name
          )
        `)
        .gte("created_at", fromDate.toISOString());

      if (error) throw error;

      // Calculate SLA metrics per department
      const departmentMetrics: Record<string, {
        department: string;
        total: number;
        resolved: number;
        avgResponseTime: number;
        slaCompliance: number;
      }> = {};

      (data || []).forEach((ticket: any) => {
        const deptName = ticket.departments?.name || "Unknown";
        
        if (!departmentMetrics[deptName]) {
          departmentMetrics[deptName] = {
            department: deptName,
            total: 0,
            resolved: 0,
            avgResponseTime: 0,
            slaCompliance: 0,
          };
        }

        departmentMetrics[deptName].total++;
        
        if (ticket.status === "resolved" || ticket.status === "closed") {
          departmentMetrics[deptName].resolved++;
        }
      });

      // Calculate compliance percentage
      Object.values(departmentMetrics).forEach((metric) => {
        metric.slaCompliance = metric.total > 0 
          ? Math.round((metric.resolved / metric.total) * 100) 
          : 0;
      });

      return Object.values(departmentMetrics);
    },
    staleTime: 60 * 1000,
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

      if (error) {
        console.error("Error fetching departments:", error);
        throw error;
      }
      
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
