import { z } from "zod";

// ============================================
// TICKET VALIDATIONS
// ============================================

export const createTicketSchema = z.object({
  ticket_type: z.enum(["RFQ", "GEN"], {
    required_error: "Ticket type is required",
  }),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject must be less than 255 characters"),
  description: z.string().optional(),
  department_id: z.string().uuid("Invalid department ID"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  rfq_data: z.record(z.unknown()).optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "pending", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  subject: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  rfq_data: z.record(z.unknown()).optional(),
});

export const assignTicketSchema = z.object({
  assigned_to: z.string().uuid("Invalid user ID"),
  notes: z.string().optional(),
});

// ============================================
// COMMENT VALIDATIONS
// ============================================

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  is_internal: z.boolean().optional().default(false),
});

// ============================================
// QUOTE VALIDATIONS
// ============================================

export const createQuoteSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3).optional().default("USD"),
  valid_until: z.string().min(1, "Valid until date is required"),
  terms: z.string().optional(),
});

export const updateQuoteSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  valid_until: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
});

// ============================================
// USER VALIDATIONS
// ============================================

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  role_id: z.string().uuid("Invalid role ID"),
  department_id: z.string().uuid("Invalid department ID").optional(),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  role_id: z.string().uuid().optional(),
  department_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

// ============================================
// RFQ DATA VALIDATIONS
// ============================================

export const rfqDataSchema = z.object({
  // Step 1: Basic Information
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email().optional().or(z.literal("")),
  customer_phone: z.string().optional(),

  // Step 2: Service Information
  service_type: z.string().min(1, "Service type is required"),
  cargo_category: z.enum(["DG", "Genco"], {
    required_error: "Cargo category is required",
  }),
  cargo_description: z.string().min(1, "Cargo description is required"),

  // Step 3: Location Details
  origin_address: z.string().min(1, "Origin address is required"),
  origin_city: z.string().min(1, "Origin city is required"),
  origin_country: z.string().min(1, "Origin country is required"),
  destination_address: z.string().min(1, "Destination address is required"),
  destination_city: z.string().min(1, "Destination city is required"),
  destination_country: z.string().min(1, "Destination country is required"),

  // Step 4: Cargo Specifications
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  weight_per_unit: z.number().min(0.01, "Weight per unit is required"),
  packaging_type: z.string().optional(),
  weight_with_packaging: z.number().optional(),
  hs_code: z.string().optional(),

  // Step 5: Dimensions
  length: z.number().min(0.01, "Length is required"),
  width: z.number().min(0.01, "Width is required"),
  height: z.number().min(0.01, "Height is required"),
  volume_per_unit: z.number().optional(),
  total_volume: z.number().optional(),

  // Step 6: Additional Info
  fleet_requirement: z.string().optional(),
  scope_of_work: z.string().min(1, "Scope of work is required"),
  additional_notes: z.string().optional(),
  estimated_project_date: z.string().optional(),
});

// ============================================
// QUERY PARAMS VALIDATIONS
// ============================================

export const ticketListParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
  status: z.enum(["all", "open", "in_progress", "pending", "resolved", "closed"]).optional(),
  department: z.string().optional(),
  type: z.enum(["all", "RFQ", "GEN"]).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  assignedToMe: z.coerce.boolean().optional(),
  createdByMe: z.coerce.boolean().optional(),
});

// ============================================
// VALIDATION HELPERS
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> };

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const details: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(err.message);
  });

  return {
    success: false,
    error: "Validation failed",
    details,
  };
}

export function validationErrorResponse(result: ValidationResult<unknown>): Response {
  if (result.success) {
    throw new Error("Cannot create error response for successful validation");
  }

  return new Response(
    JSON.stringify({
      message: result.error,
      success: false,
      details: result.details,
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}