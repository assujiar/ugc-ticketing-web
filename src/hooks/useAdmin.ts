"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { CreateUserRequest, UpdateUserRequest } from "@/types/api";

// ============ USERS ============

async function fetchUsers(params?: { page?: number; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.search) searchParams.append("search", params.search);

  const response = await fetch(`/api/admin/users?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch users");
  }
  return response.json();
}

async function createUser(data: CreateUserRequest) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create user");
  }
  return response.json();
}

async function updateUser({ id, data }: { id: string; data: UpdateUserRequest }) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }
  return response.json();
}

async function deleteUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }
  return response.json();
}

export function useAdminUsers(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => fetchUsers(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User created", description: "The user has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User updated", description: "The user has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User deactivated", description: "The user has been deactivated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ AUDIT LOGS ============

async function fetchAuditLogs(params?: {
  page?: number;
  table_name?: string;
  action?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.table_name) searchParams.append("table_name", params.table_name);
  if (params?.action) searchParams.append("action", params.action);

  const response = await fetch(`/api/admin/audit?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch audit logs");
  }
  return response.json();
}

export function useAuditLogs(params?: {
  page?: number;
  table_name?: string;
  action?: string;
}) {
  return useQuery({
    queryKey: ["admin", "audit", params],
    queryFn: () => fetchAuditLogs(params),
  });
}