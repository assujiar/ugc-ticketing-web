// API Request/Response Types

import type { Ticket, TicketComment, TicketAttachment, RateQuote, DashboardSummary, SLAMetrics } from "./index";

// Generic API Response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error Response
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface RefreshRequest {
  refresh_token: string;
}

// Tickets
export interface TicketListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  department?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  assignedToMe?: boolean;
  createdByMe?: boolean;
}

export interface CreateTicketRequest {
  ticket_type: "RFQ" | "GEN";
  subject: string;
  description?: string;
  department_id: string;
  priority?: "low" | "medium" | "high" | "urgent";
  rfq_data?: Record<string, unknown>;
}

export interface UpdateTicketRequest {
  status?: string;
  priority?: string;
  subject?: string;
  description?: string;
  assigned_to?: string;
  rfq_data?: Record<string, unknown>;
}

export interface AssignTicketRequest {
  assigned_to: string;
  notes?: string;
}

// Comments
export interface CreateCommentRequest {
  content: string;
  is_internal?: boolean;
}

// Attachments
export interface UploadAttachmentRequest {
  file: File;
}

// Quotes
export interface CreateQuoteRequest {
  amount: number;
  currency?: string;
  valid_until: string;
  terms?: string;
}

export interface UpdateQuoteRequest {
  amount?: number;
  currency?: string;
  valid_until?: string;
  terms?: string;
  status?: "draft" | "sent" | "accepted" | "rejected";
}

// Dashboard
export interface DashboardSummaryResponse extends DashboardSummary {}

export interface SLAMetricsResponse {
  metrics: SLAMetrics[];
}

// User Management (Admin)
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  department_id?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role_id?: string;
  department_id?: string;
  is_active?: boolean;
}

// Response types for API endpoints
export type TicketListResponse = PaginatedResponse<Ticket>;
export type TicketDetailResponse = ApiResponse<Ticket>;
export type CommentListResponse = ApiResponse<TicketComment[]>;
export type AttachmentListResponse = ApiResponse<TicketAttachment[]>;
export type QuoteListResponse = ApiResponse<RateQuote[]>;