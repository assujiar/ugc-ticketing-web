import { createServerClient } from "@/lib/supabase/server";
import type { Ticket, RFQData } from "@/types";
import type { DepartmentCode, TicketType } from "@/lib/constants";
import { DEPARTMENT_CODES, TICKET_TYPES, TICKET_STATUSES } from "@/lib/constants";

// ============================================
// TICKET CODE GENERATION
// Format: [TYPE][DEPT]ddmmyyxxx
// Example: RFQDOM010226001
// ============================================

export async function generateTicketCode(
  ticketType: TicketType,
  departmentCode: DepartmentCode
): Promise<string> {
  const supabase = await createServerClient();

  // Call database function for atomic sequence generation
  const { data, error } = await supabase.rpc("generate_ticket_code", {
    p_ticket_type: ticketType,
    p_department_code: departmentCode,
  });

  if (error) {
    throw new Error(`Failed to generate ticket code: ${error.message}`);
  }

  return data as string;
}

// ============================================
// TICKET HELPERS
// ============================================

// Parse ticket code to extract components
export function parseTicketCode(ticketCode: string): {
  type: string;
  department: string;
  date: string;
  sequence: string;
} | null {
  // Format: RFQDOM010226001 (TYPE[3] + DEPT[3] + DATE[6] + SEQ[3])
  if (ticketCode.length < 15) return null;

  const type = ticketCode.substring(0, 3);
  const department = ticketCode.substring(3, 6);
  const date = ticketCode.substring(6, 12);
  const sequence = ticketCode.substring(12);

  return { type, department, date, sequence };
}

// Format ticket code for display
export function formatTicketCode(ticketCode: string): string {
  const parsed = parseTicketCode(ticketCode);
  if (!parsed) return ticketCode;

  const { type, department, date, sequence } = parsed;
  return `${type}-${department}-${date}-${sequence}`;
}

// Get ticket type label
export function getTicketTypeLabel(type: string): string {
  return TICKET_TYPES[type as TicketType] || type;
}

// Get ticket status label
export function getTicketStatusLabel(status: string): string {
  return TICKET_STATUSES[status as keyof typeof TICKET_STATUSES] || status;
}

// Get department name from code
export function getDepartmentName(code: string): string {
  return DEPARTMENT_CODES[code as DepartmentCode] || code;
}

// ============================================
// TICKET STATUS TRANSITIONS
// ============================================

const validTransitions: Record<string, string[]> = {
  open: ["in_progress", "pending", "resolved", "closed"],
  in_progress: ["open", "pending", "resolved", "closed"],
  pending: ["open", "in_progress", "resolved", "closed"],
  resolved: ["open", "in_progress", "closed"],
  closed: ["open"], // Can reopen
};

export function canTransitionTo(currentStatus: string, newStatus: string): boolean {
  const allowed = validTransitions[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

export function getValidTransitions(currentStatus: string): string[] {
  return validTransitions[currentStatus] || [];
}

// ============================================
// TICKET PRIORITY HELPERS
// ============================================

export const priorityOrder = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function comparePriority(a: string, b: string): number {
  const orderA = priorityOrder[a as keyof typeof priorityOrder] ?? 99;
  const orderB = priorityOrder[b as keyof typeof priorityOrder] ?? 99;
  return orderA - orderB;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: "red",
    high: "orange",
    medium: "yellow",
    low: "green",
  };
  return colors[priority] || "gray";
}

// ============================================
// RFQ DATA HELPERS
// ============================================

export function extractRFQSummary(rfqData: RFQData | null): string {
  if (!rfqData) return "";

  const parts: string[] = [];

  if (rfqData.customer_name) {
    parts.push(`Customer: ${rfqData.customer_name}`);
  }

  if (rfqData.service_type) {
    parts.push(`Service: ${rfqData.service_type}`);
  }

  if (rfqData.origin_city && rfqData.destination_city) {
    parts.push(`Route: ${rfqData.origin_city} → ${rfqData.destination_city}`);
  }

  if (rfqData.total_volume) {
    parts.push(`Volume: ${rfqData.total_volume} CBM`);
  }

  return parts.join(" | ");
}

export function formatRFQRoute(rfqData: RFQData | null): string {
  if (!rfqData) return "-";

  const origin = [rfqData.origin_city, rfqData.origin_country].filter(Boolean).join(", ");
  const destination = [rfqData.destination_city, rfqData.destination_country].filter(Boolean).join(", ");

  if (!origin && !destination) return "-";
  if (!origin) return `→ ${destination}`;
  if (!destination) return `${origin} →`;

  return `${origin} → ${destination}`;
}

// ============================================
// TICKET FILTERING
// ============================================

export interface TicketFilterOptions {
  status?: string;
  type?: string;
  department?: string;
  priority?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function filterTickets(tickets: Ticket[], options: TicketFilterOptions): Ticket[] {
  return tickets.filter((ticket) => {
    // Status filter
    if (options.status && options.status !== "all" && ticket.status !== options.status) {
      return false;
    }

    // Type filter
    if (options.type && options.type !== "all" && ticket.ticket_type !== options.type) {
      return false;
    }

    // Department filter
    if (options.department && options.department !== "all" && ticket.departments?.code !== options.department) {
      return false;
    }

    // Priority filter
    if (options.priority && options.priority !== "all" && ticket.priority !== options.priority) {
      return false;
    }

    // Search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const matchesCode = ticket.ticket_code.toLowerCase().includes(searchLower);
      const matchesSubject = ticket.subject.toLowerCase().includes(searchLower);
      const matchesDescription = ticket.description?.toLowerCase().includes(searchLower);

      if (!matchesCode && !matchesSubject && !matchesDescription) {
        return false;
      }
    }

    // Date range filter
    if (options.dateFrom) {
      const ticketDate = new Date(ticket.created_at);
      if (ticketDate < options.dateFrom) {
        return false;
      }
    }

    if (options.dateTo) {
      const ticketDate = new Date(ticket.created_at);
      if (ticketDate > options.dateTo) {
        return false;
      }
    }

    return true;
  });
}

// ============================================
// TICKET SORTING
// ============================================

type SortDirection = "asc" | "desc";

export function sortTickets(
  tickets: Ticket[],
  sortBy: string,
  direction: SortDirection = "desc"
): Ticket[] {
  return [...tickets].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "created_at":
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "updated_at":
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case "priority":
        comparison = comparePriority(a.priority, b.priority);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "ticket_code":
        comparison = a.ticket_code.localeCompare(b.ticket_code);
        break;
      case "subject":
        comparison = a.subject.localeCompare(b.subject);
        break;
      default:
        comparison = 0;
    }

    return direction === "desc" ? -comparison : comparison;
  });
}