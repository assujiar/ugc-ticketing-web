"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { UserProfile } from "@/types";
import type { CreateUserRequest, UpdateUserRequest, ApiResponse } from "@/types/api";

interface UseUsersOptions {
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

      const queryString = params.toString();
      const url = `/api/admin/users${queryString ? `?${queryString}` : ""}`;

      const response = await apiRequest<{ success: boolean; data: UserProfile[] }>(url);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: UserProfile }>(
        `/api/admin/users/${id}`
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
      return apiRequest<ApiResponse<UserProfile>>(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiRequest<ApiResponse>(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
