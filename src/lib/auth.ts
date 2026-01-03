import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { Database, UserProfileComplete } from "@/types/database";
import type { UserProfile } from "@/types";

export interface AuthResult {
  user: { id: string; email: string };
  profile: UserProfile;
}

export interface AuthError {
  error: NextResponse;
}

export async function requireAuth(): Promise<AuthResult | AuthError> {
  const supabase = (await createServerClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      full_name,
      role_id,
      department_id,
      is_active,
      created_at,
      updated_at,
      roles (
        id,
        name,
        display_name
      ),
      departments (
        id,
        code,
        name
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      error: NextResponse.json({ message: "User profile not found", success: false }, { status: 401 }),
    };
  }

  const typedProfile = profile as unknown as UserProfileComplete;

  if (!typedProfile.is_active) {
    return {
      error: NextResponse.json({ message: "Account deactivated", success: false }, { status: 403 }),
    };
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: typedProfile as unknown as UserProfile,
  };
}

export function isSuperAdmin(profile: UserProfile): boolean {
  return profile.roles?.name === "super_admin";
}

export function isManager(profile: UserProfile): boolean {
  const managerRoles = [
    "marketing_manager",
    "sales_manager",
    "domestics_ops_manager",
    "exim_ops_manager",
    "import_dtd_ops_manager",
    "warehouse_traffic_ops_manager",
  ];
  return managerRoles.includes(profile.roles?.name || "");
}

export function isStaff(profile: UserProfile): boolean {
  const staffRoles = ["marketing_staff", "salesperson"];
  return staffRoles.includes(profile.roles?.name || "");
}

export function getUserDepartmentId(profile: UserProfile): string | null {
  return profile.department_id || null;
}

export function canAccessDepartment(profile: UserProfile, departmentId: string): boolean {
  if (isSuperAdmin(profile)) return true;
  return profile.department_id === departmentId;
}

export function getRoleName(profile: UserProfile): string {
  return profile.roles?.name || "unknown";
}

// compatibility export
export function getUserRole(profile: UserProfile): string {
  return profile.roles?.name || "unknown";
}

export function getRoleDisplayName(profile: UserProfile): string {
  return profile.roles?.display_name || "Unknown";
}
