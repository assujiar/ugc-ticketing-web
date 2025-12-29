import { NextResponse } from "next/server";
import type { UserProfileComplete } from "@/types/database";

export function isSuperAdmin(profile: UserProfileComplete | null): boolean {
  return profile?.roles?.name === "super_admin" || false;
}

export function isManager(profile: UserProfileComplete | null): boolean {
  const managerRoles = [
    "super_admin",
    "marketing_manager",
    "sales_manager",
    "domestics_ops_manager",
    "exim_ops_manager",
    "import_dtd_ops_manager",
    "warehouse_traffic_ops_manager",
  ];
  return managerRoles.includes(profile?.roles?.name || "") || false;
}

export function isStaff(profile: UserProfileComplete | null): boolean {
  const staffRoles = ["marketing_staff", "salesperson"];
  return staffRoles.includes(profile?.roles?.name || "") || false;
}

export function canAccessTicket(
  profile: UserProfileComplete | null,
  ticketCreatorId: string,
  ticketAssigneeId: string | null,
  ticketDepartmentId: string,
): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (isManager(profile) && profile.departments?.id === ticketDepartmentId) {
    return true;
  }
  return profile.id === ticketCreatorId || profile.id === ticketAssigneeId;
}

export function canAssignTicket(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

export function canCreateQuote(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

export function canManageUsers(profile: UserProfileComplete | null): boolean {
  return isSuperAdmin(profile) || false;
}

export function canViewAuditLog(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

export function forbiddenResponse(message = "Access denied") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 403 },
  );
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse. json(
    { success: false, message, errors: [] },
    { status: 401 },
  );
}

export function notFoundResponse(message = "Resource not found") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 404 },
  );
}

export function badRequestResponse(
  message = "Bad request",
  errors: Array<{ field: string; message:  string }> = [],
) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 400 },
  );
}

export function conflictResponse(message = "Resource already exists") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 409 },
  );
}

export function internalErrorResponse(message = "Internal server error") {
  console.error("[API Error]", message);
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 500 },
  );
}

export function successResponse<T>(data: T, message = "Success") {
  return NextResponse.json(
    { success: true, message, data },
    { status:  200 },
  );
}

export function createdResponse<T>(data: T, message = "Created successfully") {
  return NextResponse. json(
    { success: true, message, data },
    { status: 201 },
  );
}
