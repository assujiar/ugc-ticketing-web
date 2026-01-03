import type { TicketStatus, TicketPriority, TicketType, QuoteStatus } from "./index";

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Create Ticket Request
export interface CreateTicketRequest {
  ticket_type: TicketType;
  subject: string;
  description?: string | null;
  department_id: string;
  priority?: TicketPriority;
  rfq_data?: Record<string, unknown> | null;
}

// Update Ticket Request
export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  subject?: string;
  description?: string | null;
  assigned_to?: string | null;
}

// Assign Ticket Request
export interface AssignTicketRequest {
  assigned_to: string;
  notes?: string;
}

// Create Comment Request
export interface CreateCommentRequest {
  content: string;
  is_internal?: boolean;
}

// Create Quote Request
export interface CreateQuoteRequest {
  amount: number;
  currency?: string;
  valid_until: string;
  terms?: string;
}

// Update Quote Request
export interface UpdateQuoteRequest {
  status?: QuoteStatus;
  amount?: number;
  currency?: string;
  valid_until?: string;
  terms?: string;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// Create User Request
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  department_id?: string | null;
}

// Update User Request
export interface UpdateUserRequest {
  full_name?: string;
  role_id?: string;
  department_id?: string | null;
  is_active?: boolean;
}

// Ticket Filters
export interface TicketFilters {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  type?: TicketType | "all";
  department?: string | "all";
  assigned_to?: string | "all";
  created_by?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Dashboard Filters
export interface DashboardFilters {
  department_id?: string;
  days?: number;
}

// Error Response
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
