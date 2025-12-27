"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/api";
import type { UserProfile } from "@/types";

export function useCurrentUser() {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(`
          *,
          roles (id, name, display_name),
          departments (id, code, name)
        `)
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return null;
      }

      return {
        user,
        profile: profile as unknown as UserProfile,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    user: data?.user || null,
    profile: data?.profile || null,
    isLoading,
    error,
    isAuthenticated: !!data?.user,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });
}
