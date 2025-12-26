// Form types for validation

import { z } from "zod";

// Login Form
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// RFQ Form - Step 1: Basic Information
export const rfqStep1Schema = z.object({
  department_id: z.string().min(1, "Target department is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  customer_phone: z.string().optional(),
});

export type RFQStep1Data = z.infer<typeof rfqStep1Schema>;

// RFQ Form - Step 2: Service Information
export const rfqStep2Schema = z.object({
  service_type: z.string().min(1, "Service type is required"),
  cargo_category: z.enum(["DG", "Genco"], {
    required_error: "Cargo category is required",
  }),
  cargo_description: z.string().min(1, "Cargo description is required"),
});

export type RFQStep2Data = z.infer<typeof rfqStep2Schema>;

// RFQ Form - Step 3: Location Details
export const rfqStep3Schema = z.object({
  origin_address: z.string().min(1, "Origin address is required"),
  origin_city: z.string().min(1, "Origin city is required"),
  origin_country: z.string().min(1, "Origin country is required"),
  destination_address: z.string().min(1, "Destination address is required"),
  destination_city: z.string().min(1, "Destination city is required"),
  destination_country: z.string().min(1, "Destination country is required"),
});

export type RFQStep3Data = z.infer<typeof rfqStep3Schema>;

// RFQ Form - Step 4: Cargo Specifications
export const rfqStep4Schema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  weight_per_unit: z.number().min(0.01, "Weight per unit is required"),
  packaging_type: z.string().optional(),
  weight_with_packaging: z.number().optional(),
  hs_code: z.string().optional(),
});

export type RFQStep4Data = z.infer<typeof rfqStep4Schema>;

// RFQ Form - Step 5: Dimensions
export const rfqStep5Schema = z.object({
  length: z.number().min(0.01, "Length is required"),
  width: z.number().min(0.01, "Width is required"),
  height: z.number().min(0.01, "Height is required"),
});

export type RFQStep5Data = z.infer<typeof rfqStep5Schema>;

// RFQ Form - Step 6: Additional Info
export const rfqStep6Schema = z.object({
  fleet_requirement: z.string().optional(),
  scope_of_work: z.string().min(1, "Scope of work is required"),
  additional_notes: z.string().optional(),
  estimated_project_date: z.string().optional(),
});

export type RFQStep6Data = z.infer<typeof rfqStep6Schema>;

// Complete RFQ Form
export const rfqFormSchema = rfqStep1Schema
  .merge(rfqStep2Schema)
  .merge(rfqStep3Schema)
  .merge(rfqStep4Schema)
  .merge(rfqStep5Schema)
  .merge(rfqStep6Schema);

export type RFQFormData = z.infer<typeof rfqFormSchema>;

// General Ticket Form
export const genTicketSchema = z.object({
  department_id: z.string().min(1, "Department is required"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export type GenTicketFormData = z.infer<typeof genTicketSchema>;

// Comment Form
export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required"),
  is_internal: z.boolean().optional().default(false),
});

export type CommentFormData = z.infer<typeof commentSchema>;

// Quote Form
export const quoteSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  valid_until: z.string().min(1, "Valid until date is required"),
  terms: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

// Assignment Form
export const assignmentSchema = z.object({
  assigned_to: z.string().min(1, "Assignee is required"),
  notes: z.string().optional(),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;

// User Form (Admin)
export const userSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Update User Form (Admin)
export const updateUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").optional(),
  role_id: z.string().optional(),
  department_id: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;