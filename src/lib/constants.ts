// Role Names
export const ROLE_NAMES = {
  SUPER_ADMIN: "super_admin",
  MARKETING_MANAGER: "marketing_manager",
  MARKETING_STAFF: "marketing_staff",
  SALES_MANAGER: "sales_manager",
  SALESPERSON: "salesperson",
  DOMESTICS_OPS_MANAGER: "domestics_ops_manager",
  EXIM_OPS_MANAGER: "exim_ops_manager",
  IMPORT_DTD_OPS_MANAGER: "import_dtd_ops_manager",
  WAREHOUSE_TRAFFIC_OPS_MANAGER: "warehouse_traffic_ops_manager",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

// Department Codes
export const DEPARTMENT_CODES = {
  MKT: "MKT",
  SAL: "SAL",
  DOM: "DOM",
  EXI: "EXI",
  DTD: "DTD",
  TRF: "TRF",
} as const;

export type DepartmentCode = (typeof DEPARTMENT_CODES)[keyof typeof DEPARTMENT_CODES];

// Ticket Types
export const TICKET_TYPES = {
  RFQ: "RFQ",
  GEN: "GEN",
} as const;

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES];

// Ticket Status - Updated with new workflow statuses
export const TICKET_STATUS = {
  OPEN: "open",
  NEED_RESPONSE: "need_response",
  IN_PROGRESS: "in_progress",
  WAITING_CUSTOMER: "waiting_customer",
  NEED_ADJUSTMENT: "need_adjustment",
  PENDING: "pending",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const TICKET_STATUSES = TICKET_STATUS;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// Ticket Close Outcome
export const CLOSE_OUTCOME = {
  WON: "won",
  LOST: "lost",
} as const;

export type CloseOutcome = (typeof CLOSE_OUTCOME)[keyof typeof CLOSE_OUTCOME];

// Lost Reasons
export const LOST_REASONS = [
  { value: "price_not_competitive", label: "Harga tidak kompetitif" },
  { value: "competitor_won", label: "Kompetitor menang" },
  { value: "customer_cancelled", label: "Customer membatalkan" },
  { value: "no_response", label: "Tidak ada respon dari customer" },
  { value: "requirement_changed", label: "Requirement berubah" },
  { value: "budget_issue", label: "Masalah budget customer" },
  { value: "timeline_issue", label: "Timeline tidak sesuai" },
  { value: "other", label: "Lainnya" },
] as const;

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

// Service Types for RFQ
export const SERVICE_TYPES = [
  { value: "DOM_FTL", label: "Domestics FTL (Charter)" },
  { value: "DOM_LTL", label: "Domestics LTL" },
  { value: "DOM_LCL", label: "Domestics LCL" },
  { value: "DOM_FCL", label: "Domestics FCL" },
  { value: "DOM_AF", label: "Domestics AF" },
  { value: "WAREHOUSING", label: "Warehousing" },
  { value: "FULFILLMENT", label: "Fulfillment" },
  { value: "EXP_LCL", label: "Export LCL" },
  { value: "EXP_FCL", label: "Export FCL" },
  { value: "EXP_AF", label: "Export AF" },
  { value: "IMP_LCL", label: "Import LCL" },
  { value: "IMP_FCL", label: "Import FCL" },
  { value: "IMP_AF", label: "Import AF" },
  { value: "CUSTOMS", label: "Customs Clearance" },
  { value: "IMP_DTD", label: "Import DTD" },
  { value: "PROJECT", label: "Project Cargo" },
  { value: "HEAVY", label: "Heavy Duty Cargo" },
  { value: "OTHER", label: "Other" },
] as const;

// Units of Measure
export const UNITS_OF_MEASURE = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "boxes", label: "Boxes" },
  { value: "cartons", label: "Cartons" },
  { value: "pallets", label: "Pallets" },
  { value: "drums", label: "Drums" },
  { value: "bags", label: "Bags" },
  { value: "rolls", label: "Rolls" },
  { value: "containers", label: "Containers" },
  { value: "units", label: "Units" },
] as const;

// Packaging Types
export const PACKAGING_TYPES = [
  { value: "cardboard", label: "Cardboard Box" },
  { value: "wooden_crate", label: "Wooden Crate" },
  { value: "pallet", label: "Pallet" },
  { value: "drum", label: "Drum/Barrel" },
  { value: "bag", label: "Bag" },
  { value: "shrink_wrap", label: "Shrink Wrap" },
  { value: "bubble_wrap", label: "Bubble Wrap" },
  { value: "none", label: "No Packaging" },
  { value: "other", label: "Other" },
] as const;

// Quote Status
export const QUOTE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

// Cargo Categories
export const CARGO_CATEGORIES = {
  DG: "DG",
  GENCO: "Genco",
} as const;

export type CargoCategory = (typeof CARGO_CATEGORIES)[keyof typeof CARGO_CATEGORIES];

// Status labels for UI
export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  need_response: "Need Response",
  in_progress: "In Progress",
  waiting_customer: "Waiting Customer",
  need_adjustment: "Need Adjustment",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

// Color mappings for UI
export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "info",
  need_response: "warning",
  in_progress: "default",
  waiting_customer: "secondary",
  need_adjustment: "warning",
  pending: "secondary",
  resolved: "success",
  closed: "default",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "destructive",
};

export const OUTCOME_COLORS: Record<string, string> = {
  won: "success",
  lost: "destructive",
};

// Default SLA hours
export const DEFAULT_SLA = {
  FIRST_RESPONSE_HOURS: 4,
  RESOLUTION_HOURS: 48,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
  ],
  ALLOWED_EXTENSIONS: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
  ],
} as const;

export const FILE_UPLOAD = UPLOAD_LIMITS;
