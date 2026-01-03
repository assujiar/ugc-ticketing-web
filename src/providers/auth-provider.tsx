"use client";

import { createContext, useContext, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          role_id,
          department_id,
          is_active,
          created_at,
          updated_at,
          roles (id, name, display_name),
          departments (id, code, name)
        `)
        .eq("id", user.id)
        .single();

      // DEBUG LOG
      console.log("Auth Profile Loaded:", {
        userId: user.id,
        profile: profile,
        department_id: profile?.department_id,
        departments: profile?.departments,
        error: profileError
      });

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        return { user, profile: null };
      }

      return { user, profile: profile as unknown as UserProfile };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await queryClient.invalidateQueries({ queryKey: ["auth"] });
        } else if (event === "SIGNED_OUT") {
          queryClient.clear();
          router.push("/login");
          router.refresh();
        }
      }
    );
    return () => { subscription.unsubscribe(); };
  }, [supabase, queryClient, router]);

  const signOut = useCallback(async () => {
    try {
      queryClient.clear();
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Sign out error:", error);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/login";
    }
  }, [supabase, queryClient, router]);

  const user = data?.user ?? null;
  const profile = data?.profile ?? null;
  const roleName = (profile as any)?.roles?.name ?? "";

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    error: error as Error | null,
    isAuthenticated: !!user,
    isSuperAdmin: roleName === "super_admin",
    isManager: roleName.includes("manager"),
    isStaff: roleName.includes("staff") || roleName === "salesperson",
    signOut,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}

export const useAuth = useAuthContext;
