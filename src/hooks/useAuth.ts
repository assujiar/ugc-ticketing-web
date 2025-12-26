"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth as useAuthContext } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import type { LoginFormData } from "@/types/forms";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: result, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      router.push("/login");
      router.refresh();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCurrentUser() {
  const { user, profile, isLoading, signOut, refreshProfile } = useAuthContext();

  const isSuperAdmin = profile?.roles?.name === "super_admin";
  
  const isManager = profile?.roles?.name
    ? [
        "super_admin",
        "marketing_manager",
        "sales_manager",
        "domestics_ops_manager",
        "exim_ops_manager",
        "import_dtd_ops_manager",
        "warehouse_traffic_ops_manager",
      ].includes(profile.roles.name)
    : false;

  const isStaff = profile?.roles?.name
    ? ["marketing_staff", "salesperson"].includes(profile.roles.name)
    : false;

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin,
    isManager,
    isStaff,
    signOut,
    refreshProfile,
  };
}

export { useAuthContext as useAuth };