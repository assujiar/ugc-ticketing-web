"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import type { CreateUserRequest, UpdateUserRequest, ApiResponse } from "@/types/api";

interface UseUsersOptions {
  page?: number;
  search?: string;
  role?: string;
  department?: string;
  status?: string;
}

export function useUsers(options: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ["admin", "users", options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.role) params.set("role", options.role);
      if (options.department) params.set("department", options.department);
      if (options.status) params.set("status", options.status);
      if (options.page) params.set("page", String(options.page));

      const queryString = params.toString();
      const url = "/api/admin/users" + (queryString ? "?" + queryString : "");
      const response = await apiRequest<{ success: boolean; data: UserProfile[] }>(url);
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export const useAdminUsers = useUsers;

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: UserProfile }>(
        "/api/admin/users/" + id
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      return apiRequest<ApiResponse<UserProfile>>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      return apiRequest<ApiResponse<UserProfile>>("/api/admin/users/" + userId, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest<ApiResponse<null>>("/api/admin/users/" + userId, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// Audit Logs
interface UseAuditLogsOptions {
  page?: number;
  pageSize?: number;
  table_name?: string;
  action?: string;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const supabase = createClient();
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;

  return useQuery({
    queryKey: ["admin", "audit-logs", options],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          users (id, full_name, email)
        `, { count: "exact" })
        .order("created_at", { ascending: false });

      if (options.table_name) {
        query = query.eq("table_name", options.table_name);
      }
      if (options.action) {
        query = query.eq("action", options.action);
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        page,
        pageSize,
      };
    },
    staleTime: 30 * 1000,
  });
}
