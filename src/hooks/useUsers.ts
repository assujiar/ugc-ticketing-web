"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useDepartments() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, code, name")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRoles() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, display_name")
        .order("display_name");

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsersByDepartment(departmentId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["users", "department", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];

      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, roles(name, display_name)")
        .eq("department_id", departmentId)
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!departmentId,
  });
}

export function useAllUsers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          is_active,
          created_at,
          roles (
            id,
            name,
            display_name
          ),
          departments (
            id,
            code,
            name
          )
        `)
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}