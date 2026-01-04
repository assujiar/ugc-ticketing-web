"use client";
import { useQuery } from "@tanstack/react-query";

export interface UserPerformance {
  user_id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  department_name: string | null;
  department_code: string | null;
  role_name: string | null;
  role_display_name: string | null;
  total_tickets_involved: number;
  total_responses: number;
  responses_to_creator: number;
  responses_to_department: number;
  avg_response_hours: number | null;
  median_response_hours: number | null;
  p90_response_hours: number | null;
  avg_response_to_creator_hours: number | null;
  median_response_to_creator_hours: number | null;
  avg_response_to_dept_hours: number | null;
  median_response_to_dept_hours: number | null;
  first_responses_count: number;
  avg_first_response_hours: number | null;
  median_first_response_hours: number | null;
  total_quotes_submitted: number;
  avg_quote_time_hours: number | null;
}

export interface DepartmentPerformance {
  department_id: string;
  department_code: string;
  department_name: string;
  total_tickets: number;
  closed_tickets: number;
  won_tickets: number;
  lost_tickets: number;
  avg_first_response_hours: number | null;
  median_first_response_hours: number | null;
  p90_first_response_hours: number | null;
  avg_first_quote_hours: number | null;
  median_first_quote_hours: number | null;
  p90_first_quote_hours: number | null;
  avg_resolution_hours: number | null;
  median_resolution_hours: number | null;
  avg_dept_stage_response_hours: number | null;
  first_response_sla_pct: number | null;
  first_quote_sla_pct: number | null;
}

export interface TicketPerformance {
  ticket_id: string;
  ticket_code: string;
  status: string;
  ticket_type: string;
  created_at: string;
  closed_at: string | null;
  close_outcome: string | null;
  creator_id: string;
  creator_name: string;
  department_id: string;
  department_name: string;
  department_code: string;
  first_response_hours: number | null;
  first_response_at: string | null;
  first_quote_hours: number | null;
  first_quote_at: string | null;
  resolution_hours: number | null;
  total_activities: number;
  dept_responses: number;
  creator_responses: number;
  avg_dept_response_hours: number | null;
  avg_creator_response_hours: number | null;
}

export function useUserPerformance(departmentId?: string, userId?: string) {
  return useQuery({
    queryKey: ["performance", "users", departmentId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set("department_id", departmentId);
      if (userId) params.set("user_id", userId);
      
      const response = await fetch(`/api/performance/users?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      return result.data as UserPerformance[];
    },
    staleTime: 30 * 1000,
  });
}

export function useDepartmentPerformance(departmentId?: string) {
  return useQuery({
    queryKey: ["performance", "departments", departmentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set("department_id", departmentId);
      
      const response = await fetch(`/api/performance/departments?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      return result.data as DepartmentPerformance[];
    },
    staleTime: 30 * 1000,
  });
}

export function useTicketPerformance(departmentId?: string, status?: string, limit = 50) {
  return useQuery({
    queryKey: ["performance", "tickets", departmentId, status, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set("department_id", departmentId);
      if (status) params.set("status", status);
      params.set("limit", limit.toString());
      
      const response = await fetch(`/api/performance/tickets?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      return result.data as TicketPerformance[];
    },
    staleTime: 30 * 1000,
  });
}
