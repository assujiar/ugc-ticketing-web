export * from "./enums";
export * from "./api";
export * from "./forms";

import type { RoleName, DepartmentCode, CloseOutcome } from "@/lib/constants";

// Re-export for convenience
export type { RoleName, DepartmentCode, CloseOutcome };

// Ticket Status type - Updated
export type TicketStatus = "open" | "need_response" | "in_progress" | "waiting_customer" | "need_adjustment" | "pending" | "resolved" | "closed";

// Ticket Priority type
export type TicketPriority = "low" | "medium" | "high" | "urgent";

// Ticket Type type
export type TicketType = "RFQ" | "GEN";

// Quote Status type
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: {
    id: string;
    name: RoleName;
    display_name: string;
  } | null;
  departments: {
    id: string;
    code: DepartmentCode;
    name: string;
  } | null;
}

// Ticket - Updated with closure fields
export interface Ticket {
  id: string;
  ticket_code: string;
  ticket_type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string | null;
  department_id: string;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  rfq_data: RFQData | null;
  // New closure fields
  close_outcome: "won" | "lost" | null;
  close_reason: string | null;
  competitor_name: string | null;
  competitor_cost: number | null;
  // Relations
  departments: {
    id: string;
    code: DepartmentCode;
    name: string;
  };
  creator: {
    id: string;
    full_name: string;
    email: string;
  };
  assignee: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

// RFQ Data
export interface RFQData {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service_type: string;
  cargo_category: "DG" | "Genco";
  cargo_description: string;
  origin_address: string;
  origin_city: string;
  origin_country: string;
  destination_address: string;
  destination_city: string;
  destination_country: string;
  quantity: number;
  unit_of_measure: string;
  weight_per_unit: number;
  packaging_type: string | null;
  weight_with_packaging: number | null;
  hs_code: string | null;
  length: number;
  width: number;
  height: number;
  volume_per_unit: number;
  total_volume: number;
  fleet_requirement: string | null;
  scope_of_work: string;
  additional_notes: string | null;
  estimated_project_date: string | null;
}

// Ticket Comment
export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Ticket Attachment
export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  uploader: {
    id: string;
    full_name: string;
  };
}

// Rate Quote
export interface RateQuote {
  id: string;
  ticket_id: string;
  quote_number: string;
  amount: number;
  currency: string;
  valid_until: string;
  terms: string | null;
  status: QuoteStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    full_name: string;
  };
}

// Ticket Assignment
export interface TicketAssignment {
  id: string;
  ticket_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
  assignee: {
    id: string;
    full_name: string;
    email: string;
  };
  assigner: {
    id: string;
    full_name: string;
  };
}

// SLA Tracking
export interface SLATracking {
  id: string;
  ticket_id: string;
  first_response_at: string | null;
  first_response_sla_hours: number;
  first_response_met: boolean | null;
  resolution_at: string | null;
  resolution_sla_hours: number;
  resolution_met: boolean | null;
}

// Audit Log
export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "create" | "update" | "delete";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_id: string;
  ip_address: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
  };
}

// Dashboard Summary - Updated with outcome stats
export interface DashboardSummary {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  need_response_tickets: number;
  waiting_customer_tickets: number;
  resolved_tickets: number;
  closed_won: number;
  closed_lost: number;
  tickets_by_department: {
    department: string;
    count: number;
  }[];
  tickets_by_status: {
    status: string;
    count: number;
  }[];
  tickets_by_outcome: {
    outcome: string;
    count: number;
  }[];
  recent_tickets: Ticket[];
}

// SLA Metrics
export interface SLAMetrics {
  department: string;
  total_tickets: number;
  first_response_avg_hours: number;
  first_response_compliance: number;
  resolution_avg_hours: number;
  resolution_compliance: number;
}

// Role type
export interface Role {
  id: string;
  name: RoleName;
  display_name: string;
  description: string | null;
}

// Department type
export interface Department {
  id: string;
  code: DepartmentCode;
  name: string;
  description: string | null;
  default_sla_hours: number;
}

// Close Ticket Request
export interface CloseTicketRequest {
  outcome: "won" | "lost";
  reason?: string;
  competitor_name?: string;
  competitor_cost?: number;
}
