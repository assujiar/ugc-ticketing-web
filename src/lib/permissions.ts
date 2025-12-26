import type { UserProfile } from "@/types";
import type { RoleName } from "@/lib/constants";
import { getUserRole, isSuperAdmin, isManager, isStaff } from "@/lib/auth";

// Permission types
export type Permission =
  | "tickets:view_all"
  | "tickets:view_dept"
  | "tickets:view_own"
  | "tickets:create"
  | "tickets:update_own"
  | "tickets:update_dept"
  | "tickets:update_all"
  | "tickets:delete_own"
  | "tickets:delete_dept"
  | "tickets:delete_all"
  | "tickets:assign"
  | "quotes:create"
  | "quotes:view"
  | "comments:create"
  | "comments:create_internal"
  | "comments:view_internal"
  | "attachments:upload"
  | "attachments:delete_own"
  | "attachments:delete_all"
  | "dashboard:view_all"
  | "dashboard:view_dept"
  | "dashboard:view_own"
  | "users:manage"
  | "settings:manage";

// Role-based permission mapping
const rolePermissions: Record<RoleName, Permission[]> = {
  super_admin: [
    "tickets:view_all",
    "tickets:create",
    "tickets:update_all",
    "tickets:delete_all",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_all",
    "dashboard:view_all",
    "users:manage",
    "settings:manage",
  ],
  marketing_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
  marketing_staff: [
    "tickets:view_own",
    "tickets:create",
    "tickets:update_own",
    "tickets:delete_own",
    "quotes:view",
    "comments:create",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_own",
  ],
  sales_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
  salesperson: [
    "tickets:view_own",
    "tickets:create",
    "tickets:update_own",
    "tickets:delete_own",
    "quotes:view",
    "comments:create",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_own",
  ],
  domestics_ops_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
  exim_ops_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
  import_dtd_ops_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
  warehouse_traffic_ops_manager: [
    "tickets:view_dept",
    "tickets:create",
    "tickets:update_own",
    "tickets:update_dept",
    "tickets:delete_own",
    "tickets:delete_dept",
    "tickets:assign",
    "quotes:create",
    "quotes:view",
    "comments:create",
    "comments:create_internal",
    "comments:view_internal",
    "attachments:upload",
    "attachments:delete_own",
    "dashboard:view_dept",
  ],
};

// Check if user has a specific permission
export function hasPermission(profile: UserProfile | null, permission: Permission): boolean {
  if (!profile) return false;
  
  const role = getUserRole(profile);
  if (!role) return false;
  
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(profile: UserProfile | null, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(profile, permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(profile: UserProfile | null, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(profile, permission));
}

// Get all permissions for a user
export function getUserPermissions(profile: UserProfile | null): Permission[] {
  if (!profile) return [];
  
  const role = getUserRole(profile);
  if (!role) return [];
  
  return rolePermissions[role] ?? [];
}

// ============================================
// TICKET-SPECIFIC PERMISSION CHECKS
// ============================================

interface TicketContext {
  createdBy: string;
  assignedTo: string | null;
  departmentId: string;
}

// Check if user can view a specific ticket
export function canViewTicket(profile: UserProfile | null, ticket: TicketContext): boolean {
  if (!profile) return false;
  
  // Super admin can view all
  if (isSuperAdmin(profile)) return true;
  
  // Manager can view department tickets
  if (isManager(profile) && profile.department_id === ticket.departmentId) return true;
  
  // Staff can view own tickets (created or assigned)
  if (ticket.createdBy === profile.id || ticket.assignedTo === profile.id) return true;
  
  return false;
}

// Check if user can update a specific ticket
export function canUpdateTicket(profile: UserProfile | null, ticket: TicketContext): boolean {
  if (!profile) return false;
  
  // Super admin can update all
  if (isSuperAdmin(profile)) return true;
  
  // Manager can update department tickets
  if (isManager(profile) && profile.department_id === ticket.departmentId) return true;
  
  // Creator can update own ticket
  if (ticket.createdBy === profile.id) return true;
  
  return false;
}

// Check if user can delete a specific ticket
export function canDeleteTicket(profile: UserProfile | null, ticket: TicketContext): boolean {
  if (!profile) return false;
  
  // Super admin can delete all
  if (isSuperAdmin(profile)) return true;
  
  // Manager can delete department tickets
  if (isManager(profile) && profile.department_id === ticket.departmentId) return true;
  
  // Creator can delete own ticket
  if (ticket.createdBy === profile.id) return true;
  
  return false;
}

// Check if user can assign tickets
export function canAssignTicket(profile: UserProfile | null, ticket: TicketContext): boolean {
  if (!profile) return false;
  
  // Super admin can assign all
  if (isSuperAdmin(profile)) return true;
  
  // Manager can assign department tickets
  if (isManager(profile) && profile.department_id === ticket.departmentId) return true;
  
  return false;
}

// Check if user can create quotes
export function canCreateQuote(profile: UserProfile | null, ticket: TicketContext): boolean {
  if (!profile) return false;
  
  // Super admin can create quotes
  if (isSuperAdmin(profile)) return true;
  
  // Manager can create quotes for department tickets
  if (isManager(profile) && profile.department_id === ticket.departmentId) return true;
  
  return false;
}

// ============================================
// COMMENT-SPECIFIC PERMISSION CHECKS
// ============================================

// Check if user can view internal comments
export function canViewInternalComments(profile: UserProfile | null): boolean {
  return hasPermission(profile, "comments:view_internal");
}

// Check if user can create internal comments
export function canCreateInternalComment(profile: UserProfile | null): boolean {
  return hasPermission(profile, "comments:create_internal");
}

// ============================================
// ATTACHMENT-SPECIFIC PERMISSION CHECKS
// ============================================

interface AttachmentContext {
  uploadedBy: string;
}

// Check if user can delete an attachment
export function canDeleteAttachment(profile: UserProfile | null, attachment: AttachmentContext): boolean {
  if (!profile) return false;
  
  // Super admin can delete all
  if (hasPermission(profile, "attachments:delete_all")) return true;
  
  // User can delete own attachments
  if (hasPermission(profile, "attachments:delete_own") && attachment.uploadedBy === profile.id) return true;
  
  return false;
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function forbiddenResponse(message = "You do not have permission to perform this action"): Response {
  return new Response(
    JSON.stringify({ message, success: false }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}

export function unauthorizedResponse(message = "Authentication required"): Response {
  return new Response(
    JSON.stringify({ message, success: false }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}