"use client";

import { useAuth } from "./useAuth";
import { isSuperAdmin, isManager, isStaff } from "@/lib/permissions";
import type { UserProfileComplete } from "@/types/database";

export function useCurrentUser() {
  const { user, profile, isLoading, error, isAuthenticated } = useAuth();

  const typedProfile = (profile as unknown as UserProfileComplete | null) ?? null;

  return {
    user,
    profile: typedProfile,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin: isSuperAdmin(typedProfile),
    isManager: isManager(typedProfile),
    isStaff: isStaff(typedProfile),
    isActive: typedProfile?.is_active ?? false,
    departmentId: typedProfile?.department_id ?? null,
    roleId: typedProfile?.role_id ?? null,
    roleName: typedProfile?.roles?.name ?? null,
  };
}
