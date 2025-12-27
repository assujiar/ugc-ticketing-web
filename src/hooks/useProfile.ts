"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/api";
import { useCurrentUser } from "./useAuth";

interface UpdateProfileData {
  full_name?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
