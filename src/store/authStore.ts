import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

interface AuthState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setAuthenticated: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      isAuthenticated: false,
      setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      clearAuth: () => set({ profile: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);