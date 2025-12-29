"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/api";
import type { UserProfile } from "@/types";

interface UseUsersOptions {
  department?: string | null;
  role?: string;
  active?: boolean;
}

export function useUsers(options: UseUsersOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["users", options],
    queryFn: async () => {
      let query = supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          role_id,
          department_id,
          is_active,
          roles (id, name, display_name)
        `)
        .eq("is_active", options.active !== false);

      if (options.department) {
        query = query.eq("department_id", options.department);
      }
      if (options.role) {
        query = query.eq("role_id", options.role);
      }

      const { data, error } = await query.order("full_name");

      if (error) throw error;
      return data as unknown as Pick<UserProfile, "id" | "email" | "full_name" | "role_id" | "department_id" | "is_active" | "roles">[];
    },
    staleTime: 60 * 1000,
  });
}
