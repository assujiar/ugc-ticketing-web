"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/api";
import type { UserProfileComplete } from "@/types/database";

type AuthPayload =
  | {
      user: User;
      profile: UserProfileComplete;
    }
  | null;

export function useAuth() {
  const supabase = createClient();

  const { data, isLoading, error, refetch } = useQuery<AuthPayload>({
    queryKey: ["auth", "currentUser"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(
          `
          *,
          roles (id, name, display_name),
          departments (id, code, name)
        `
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profile) return null;

      const typedProfile = profile as unknown as UserProfileComplete;
      return { user, profile: typedProfile };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const profile = data?.profile ?? null;
  const roleName = profile?.roles?.name ?? "";

  return {
    user: data?.user ?? null,
    profile,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!data?.user,
    isSuperAdmin: roleName === "super_admin",
    isManager: roleName.includes("manager"),
    isStaff: roleName.includes("staff") || roleName === "salesperson",
  };
}

// Backward-compatible alias (dipakai oleh useProfile.ts kamu)
export const useCurrentUser = useAuth;

export function useLogin() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
