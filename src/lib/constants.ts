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

export type DepartmentCode =
  (typeof DEPARTMENT_CODES)[keyof typeof DEPARTMENT_CODES];

// Ticket Types
export const TICKET_TYPES = {
  RFQ: "RFQ",
  GEN: "GEN",
} as const;

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES];

// Ticket Status
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  PENDING: "pending",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

// Alias for compatibility
export const TICKET_STATUSES = TICKET_STATUS;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

// Service Types for RFQ
export const SERVICE_TYPES = [
  { value: "LTL", label: "Less Than Truckload (LTL)" },
  { value: "FTL", label: "Full Truckload (FTL)" },
  { value: "LCL", label: "Less Than Container Load (LCL)" },
  { value: "FCL", label: "Full Container Load (FCL)" },
  { value: "AF", label: "Air Freight (AF)" },
  { value: "SF", label: "Sea Freight (SF)" },
  { value: "RAIL", label: "Rail Freight" },
  { value: "MULTIMODAL", label: "Multimodal" },
  { value: "EXPRESS", label: "Express Courier" },
  { value: "WAREHOUSING", label: "Warehousing" },
  { value: "CUSTOMS", label: "Customs Clearance" },
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

export type CargoCategory =
  (typeof CARGO_CATEGORIES)[keyof typeof CARGO_CATEGORIES];

// Color mappings for UI
export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "info",
  in_progress: "warning",
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

// File upload limits - ADDED UPLOAD_LIMITS export
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

// Alias for compatibility
export const FILE_UPLOAD = UPLOAD_LIMITS;