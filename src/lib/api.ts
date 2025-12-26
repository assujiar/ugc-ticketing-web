import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";
import type { RoleName, DepartmentCode } from "@/lib/constants";

export interface AuthUser extends User {
  profile?: UserProfile;
}

export interface AuthResult {
  user: AuthUser | null;
  profile: UserProfile | null;
  error: string | null;
}

// Get authenticated user from request
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        user: null,
        profile: null,
        error: authError?.message || "Not authenticated",
      };
    }

    // Fetch user profile with role and department
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
      `)
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        user,
        profile: null,
        error: profileError?.message || "Profile not found",
      };
    }

    if (!profile.is_active) {
      return {
        user: null,
        profile: null,
        error: "Account is deactivated",
      };
    }

    return {
      user: { ...user, profile: profile as unknown as UserProfile },
      profile: profile as unknown as UserProfile,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      profile: null,
      error: error instanceof Error ? error.message : "Authentication error",
    };
  }
}

// Get user role name
export function getUserRole(profile: UserProfile | null): RoleName | null {
  if (!profile?.roles) return null;
  return profile.roles.name as RoleName;
}

// Get user department code
export function getUserDepartment(profile: UserProfile | null): DepartmentCode | null {
  if (!profile?.departments) return null;
  return profile.departments.code as DepartmentCode;
}

// Check if user is super admin
export function isSuperAdmin(profile: UserProfile | null): boolean {
  return getUserRole(profile) === "super_admin";
}

// Check if user is a manager
export function isManager(profile: UserProfile | null): boolean {
  const role = getUserRole(profile);
  if (!role) return false;
  
  return [
    "super_admin",
    "marketing_manager",
    "sales_manager",
    "domestics_ops_manager",
    "exim_ops_manager",
    "import_dtd_ops_manager",
    "warehouse_traffic_ops_manager",
  ].includes(role);
}

// Check if user is staff
export function isStaff(profile: UserProfile | null): boolean {
  const role = getUserRole(profile);
  if (!role) return false;
  
  return ["marketing_staff", "salesperson"].includes(role);
}

// Get user by ID (admin function)
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const adminClient = createAdminClient();
    
    const { data, error } = await adminClient
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
      `)
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as UserProfile;
  } catch {
    return null;
  }
}

// Get users by department (for assignment)
export async function getUsersByDepartment(departmentId: string): Promise<UserProfile[]> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
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
      `)
      .eq("department_id", departmentId)
      .eq("is_active", true)
      .order("full_name");

    if (error || !data) {
      return [];
    }

    return data as unknown as UserProfile[];
  } catch {
    return [];
  }
}

// Validate session and return error response if invalid
export async function requireAuth(): Promise<{ profile: UserProfile; error?: never } | { profile?: never; error: Response }> {
  const { profile, error } = await getAuthUser();

  if (error || !profile) {
    return {
      error: new Response(
        JSON.stringify({ message: error || "Unauthorized", success: false }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { profile };
}