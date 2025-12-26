import { z } from "zod";

// Login form
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// General ticket form
export const genTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().optional(),
  department_id: z.string().min(1, "Please select a department"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export type GenTicketFormData = z.infer<typeof genTicketSchema>;

// RFQ Step schemas
export const rfqStep1Schema = z.object({
  department_id: z.string().min(1, "Please select a department"),
  customer_name: z.string().min(2, "Customer name is required"),
  customer_email: z.string().email().optional().or(z.literal("")),
  customer_phone: z.string().optional(),
});

export const rfqStep2Schema = z.object({
  service_type: z.string().min(1, "Please select a service type"),
  cargo_category: z.enum(["DG", "Genco"]),
  cargo_description: z.string().min(10, "Please provide cargo description"),
});

export const rfqStep3Schema = z.object({
  origin_address: z.string().min(5, "Origin address is required"),
  origin_city: z.string().min(2, "Origin city is required"),
  origin_country: z.string().min(2, "Origin country is required"),
  destination_address: z.string().min(5, "Destination address is required"),
  destination_city: z.string().min(2, "Destination city is required"),
  destination_country: z.string().min(2, "Destination country is required"),
});

export const rfqStep4Schema = z.object({
  quantity: z.number().positive("Quantity must be positive"),
  unit_of_measure: z.string().min(1, "Please select unit"),
  weight_per_unit: z.number().positive("Weight must be positive"),
  packaging_type: z.string().optional(),
  weight_with_packaging: z.number().optional(),
  hs_code: z.string().optional(),
});

export const rfqStep5Schema = z.object({
  length: z.number().positive("Length must be positive"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
});

export const rfqStep6Schema = z.object({
  fleet_requirement: z.string().optional(),
  scope_of_work: z.string().min(10, "Please describe scope of work"),
  additional_notes: z.string().optional(),
  estimated_project_date: z.string().optional(),
});

// Combined RFQ form
export const rfqFormSchema = rfqStep1Schema
  .merge(rfqStep2Schema)
  .merge(rfqStep3Schema)
  .merge(rfqStep4Schema)
  .merge(rfqStep5Schema)
  .merge(rfqStep6Schema);

export type RFQFormData = z.infer<typeof rfqFormSchema>;

// Quote form
export const quoteSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  valid_until: z.string().min(1, "Valid until date is required"),
  terms: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

// User form
export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Name is required"),
  role_id: z.string().min(1, "Please select a role"),
  department_id: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  role_id: z.string().optional(),
  department_id: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
