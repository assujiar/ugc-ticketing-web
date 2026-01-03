"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthContext } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

// Re-export the main auth hook from provider
export { useAuthContext as useAuth } from "@/providers/auth-provider";

// Re-export useCurrentUser from its own file for backward compatibility
export { useCurrentUser } from "./useCurrentUser";

export function useLogin() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // Invalidate auth queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      // Navigate to dashboard
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Force redirect
      router.push("/login");
      router.refresh();
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Force redirect even on error
      window.location.href = "/login";
    },
  });
}
