import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { TicketType, TicketStatus, TicketPriority } from "@/types";
import { DEPARTMENT_CODES } from "@/lib/constants";
import type { DepartmentCode } from "@/lib/constants";

// Generate ticket code via database function
export async function generateTicketCode(
  ticketType: TicketType,
  departmentCode: DepartmentCode
): Promise<string> {
  const supabase = (await createServerClient()) as unknown as SupabaseClient<Database>;

  const { data, error } = await supabase.rpc("generate_ticket_code", {
    p_ticket_type: ticketType,
    p_department_code: departmentCode,
  });

  if (error) {
    // Fallback to local generation if RPC fails
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    return `${ticketType}${departmentCode}${day}${month}${year}${seq}`;
  }

  return data as string;
}

// Parse ticket code to extract information
export function parseTicketCode(ticketCode: string): {
  type: TicketType;
  department: DepartmentCode;
  date: Date;
  sequence: number;
} | null {
  // Format: RFQ/GEN + DEPT(3) + DDMMYY + SEQ(3)
  // Example: RFQDOM010226001
  const match = ticketCode.match(/^(RFQ|GEN)([A-Z]{3})(\d{2})(\d{2})(\d{2})(\d{3})$/);
  if (!match) return null;

  // noUncheckedIndexedAccess => match[i] bisa undefined, jadi harus di-guard
  const type = match[1];
  const dept = match[2];
  const day = match[3];
  const month = match[4];
  const year = match[5];
  const seq = match[6];

  if (!type || !dept || !day || !month || !year || !seq) return null;

  return {
    type: type as TicketType,
    department: dept as DepartmentCode,
    date: new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)),
    sequence: parseInt(seq, 10),
  };
}

// Get ticket type prefix
export function getTicketTypePrefix(type: TicketType): string {
  return type;
}

// Get department code from ID
export async function getDepartmentCode(departmentId: string): Promise<DepartmentCode | null> {
  const supabase = (await createServerClient()) as unknown as SupabaseClient<Database>;

  const { data, error } = await supabase.from("departments").select("code").eq("id", departmentId).single();

  if (error || !data) return null;

  return data.code as DepartmentCode;
}

// Validate department code
export function isValidDepartmentCode(code: string): code is DepartmentCode {
  return Object.values(DEPARTMENT_CODES).includes(code as DepartmentCode);
}

// Get status transitions
export function getStatusTransitions(currentStatus: TicketStatus): TicketStatus[] {
  const transitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["in_progress", "pending", "closed"],
    in_progress: ["pending", "resolved", "closed"],
    pending: ["in_progress", "resolved", "closed"],
    resolved: ["closed", "in_progress"],
    closed: ["in_progress"],
  };

  return transitions[currentStatus] || [];
}

// Check if status transition is valid
export function canTransitionTo(currentStatus: TicketStatus, targetStatus: TicketStatus): boolean {
  const validTransitions = getStatusTransitions(currentStatus);
  return validTransitions.includes(targetStatus);
}

// Get priority weight for sorting
export function getPriorityWeight(priority: TicketPriority): number {
  const weights: Record<TicketPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return weights[priority] || 0;
}

// Sort tickets by priority
export function sortByPriority<T extends { priority: TicketPriority }>(
  tickets: T[],
  order: "asc" | "desc" = "desc"
): T[] {
  return [...tickets].sort((a, b) => {
    const weightA = getPriorityWeight(a.priority);
    const weightB = getPriorityWeight(b.priority);
    return order === "desc" ? weightB - weightA : weightA - weightB;
  });
}

// Get status label
export function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status] || status;
}

// Get priority label
export function getPriorityLabel(priority: TicketPriority): string {
  const labels: Record<TicketPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };
  return labels[priority] || priority;
}

// Check if ticket is open
export function isTicketOpen(status: TicketStatus): boolean {
  return status !== "closed" && status !== "resolved";
}

// Calculate SLA deadline
export function calculateSLADeadline(createdAt: Date | string, slaHours: number): Date {
  const created = new Date(createdAt);
  return new Date(created.getTime() + slaHours * 60 * 60 * 1000);
}

// Check if SLA is breached
export function isSLABreached(
  createdAt: Date | string,
  slaHours: number,
  resolvedAt?: Date | string | null
): boolean {
  const deadline = calculateSLADeadline(createdAt, slaHours);
  const checkTime = resolvedAt ? new Date(resolvedAt) : new Date();
  return checkTime > deadline;
}

// Get SLA status
export function getSLAStatus(
  createdAt: Date | string,
  slaHours: number,
  resolvedAt?: Date | string | null
): "on_track" | "at_risk" | "breached" {
  const deadline = calculateSLADeadline(createdAt, slaHours);
  const now = resolvedAt ? new Date(resolvedAt) : new Date();

  if (now > deadline) return "breached";

  // At risk if less than 25% time remaining
  const total = slaHours * 60 * 60 * 1000;
  const elapsed = now.getTime() - new Date(createdAt).getTime();
  const remaining = total - elapsed;

  if (remaining < total * 0.25) return "at_risk";

  return "on_track";
}
