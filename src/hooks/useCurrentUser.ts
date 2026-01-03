"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { isSuperAdmin, isManager, isStaff } from "@/lib/permissions";
import type { UserProfileComplete } from "@/types/database";

export function useCurrentUser() {
  const auth = useAuthContext();
  const typedProfile = (auth.profile as unknown as UserProfileComplete | null) ?? null;

  return {
    user: auth.user,
    profile: typedProfile,
    isLoading: auth.isLoading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    isSuperAdmin: isSuperAdmin(typedProfile),
    isManager: isManager(typedProfile),
    isStaff: isStaff(typedProfile),
    isActive: typedProfile?.is_active ?? false,
    departmentId: typedProfile?.department_id ?? null,
    roleId: typedProfile?.role_id ?? null,
    roleName: typedProfile?.roles?.name ?? null,
  };
}
