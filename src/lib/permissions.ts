import type { UserProfile, Ticket } from "@/types";
import type { RoleName } from "@/lib/constants";

// Permission types
export type Permission =
  | "view_all_tickets"
  | "view_department_tickets"
  | "view_own_tickets"
  | "create_ticket"
  | "update_own_ticket"
  | "update_department_ticket"
  | "update_any_ticket"
  | "delete_own_ticket"
  | "delete_department_ticket"
  | "delete_any_ticket"
  | "assign_ticket"
  | "create_quote"
  | "view_dashboard_all"
  | "view_dashboard_department"
  | "view_dashboard_own"
  | "manage_users"
  | "manage_departments"
  | "view_audit_logs"
  | "manage_sla";

// Role-based permissions
const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  super_admin: [
    "view_all_tickets",
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "update_any_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "delete_any_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_all",
    "view_dashboard_department",
    "view_dashboard_own",
    "manage_users",
    "manage_departments",
    "view_audit_logs",
    "manage_sla",
  ],
  marketing_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
  marketing_staff: [
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "delete_own_ticket",
    "view_dashboard_own",
  ],
  sales_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
  salesperson: [
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "delete_own_ticket",
    "view_dashboard_own",
  ],
  domestics_ops_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
  exim_ops_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
  import_dtd_ops_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
  warehouse_traffic_ops_manager: [
    "view_department_tickets",
    "view_own_tickets",
    "create_ticket",
    "update_own_ticket",
    "update_department_ticket",
    "delete_own_ticket",
    "delete_department_ticket",
    "assign_ticket",
    "create_quote",
    "view_dashboard_department",
    "view_dashboard_own",
  ],
};

// Check if user has a specific permission
export function hasPermission(
  profile: UserProfile,
  permission: Permission
): boolean {
  const roleName = profile.roles?.name as RoleName | undefined;
  if (!roleName) return false;
  
  const permissions = ROLE_PERMISSIONS[roleName];
  return permissions?.includes(permission) || false;
}

// Check if user can view a specific ticket
export function canViewTicket(profile: UserProfile, ticket: Ticket): boolean {
  // Super admin can view all
  if (hasPermission(profile, "view_all_tickets")) return true;

  // Can view department tickets
  if (
    hasPermission(profile, "view_department_tickets") &&
    profile.department_id === ticket.department_id
  ) {
    return true;
  }

  // Can view own tickets
  if (hasPermission(profile, "view_own_tickets")) {
    return (
      ticket.created_by === profile.id || ticket.assigned_to === profile.id
    );
  }

  return false;
}

// Check if user can update a specific ticket
export function canUpdateTicket(profile: UserProfile, ticket: Ticket): boolean {
  // Can update any ticket
  if (hasPermission(profile, "update_any_ticket")) return true;

  // Can update department tickets
  if (
    hasPermission(profile, "update_department_ticket") &&
    profile.department_id === ticket.department_id
  ) {
    return true;
  }

  // Can update own tickets
  if (hasPermission(profile, "update_own_ticket")) {
    return (
      ticket.created_by === profile.id || ticket.assigned_to === profile.id
    );
  }

  return false;
}

// Check if user can delete a specific ticket
export function canDeleteTicket(profile: UserProfile, ticket: Ticket): boolean {
  // Can delete any ticket
  if (hasPermission(profile, "delete_any_ticket")) return true;

  // Can delete department tickets
  if (
    hasPermission(profile, "delete_department_ticket") &&
    profile.department_id === ticket.department_id
  ) {
    return true;
  }

  // Can delete own tickets
  if (hasPermission(profile, "delete_own_ticket")) {
    return ticket.created_by === profile.id;
  }

  return false;
}

// Check if user can assign tickets
export function canAssignTicket(profile: UserProfile): boolean {
  return hasPermission(profile, "assign_ticket");
}

// Check if user can create quotes
export function canCreateQuote(profile: UserProfile): boolean {
  return hasPermission(profile, "create_quote");
}

// Check dashboard access level
export function canViewDashboard(
  profile: UserProfile
): "all" | "department" | "own" | null {
  if (hasPermission(profile, "view_dashboard_all")) return "all";
  if (hasPermission(profile, "view_dashboard_department")) return "department";
  if (hasPermission(profile, "view_dashboard_own")) return "own";
  return null;
}

// Check if user can manage users
export function canManageUsers(profile: UserProfile): boolean {
  return hasPermission(profile, "manage_users");
}

// Check if user can manage departments
export function canManageDepartments(profile: UserProfile): boolean {
  return hasPermission(profile, "manage_departments");
}

// Check if user can view audit logs
export function canViewAuditLogs(profile: UserProfile): boolean {
  return hasPermission(profile, "view_audit_logs");
}

// Check if user can manage SLA settings
export function canManageSLA(profile: UserProfile): boolean {
  return hasPermission(profile, "manage_sla");
}

// Get all permissions for a user
export function getUserPermissions(profile: UserProfile): Permission[] {
  const roleName = profile.roles?.name as RoleName | undefined;
  if (!roleName) return [];
  return ROLE_PERMISSIONS[roleName] || [];
}

// Check if user is super admin
export function isSuperAdmin(profile: UserProfile): boolean {
  return profile.roles?.name === "super_admin";
}

// Check if user is a manager
export function isManager(profile: UserProfile): boolean {
  const managerRoles = [
    "super_admin",
    "marketing_manager",
    "sales_manager",
    "domestics_ops_manager",
    "exim_ops_manager",
    "import_dtd_ops_manager",
    "warehouse_traffic_ops_manager",
  ];
  return managerRoles.includes(profile.roles?.name || "");
}

// Check if user is staff
export function isStaff(profile: UserProfile): boolean {
  const staffRoles = ["marketing_staff", "salesperson"];
  return staffRoles.includes(profile.roles?.name || "");
}
