"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export function useCurrentUser() {
  const supabase = createClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log("No authenticated user");
        return null;
      }

      console.log("User authenticated:", user.id);

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
        console.error("Profile error:", profileError);
        return null;
      }

      console.log("Profile loaded:", profile.full_name, "Role:", profile.roles?.name);

      return {
        user,
        profile: profile as unknown as UserProfile,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const profile = data?.profile;
  const roleName = profile?.roles?.name || "";

  return {
    user: data?.user || null,
    profile: profile || null,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!data?.user,
    isSuperAdmin: roleName === "super_admin",
    isManager: roleName.includes("manager"),
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
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
