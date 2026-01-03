#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(projectRoot, ". patch_backups", timestamp);
const args = process.argv.slice(2);
const isWhatIf = args.includes("--whatif");
const isApply = args.includes("--apply");

console.log("\n========================================");
console.log("UGC Ticketing Platform - Build Patch v2");
console.log("========================================");
console.log(`Project Root: ${projectRoot}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Backup Dir: ${backupDir}`);
console.log("");

if (! isWhatIf && !isApply) {
  console.error("ERROR: Use --whatif or --apply");
  console.log("Usage: node patch.js --whatif");
  console.log("       node patch.js --apply");
  process.exit(1);
}

if (isWhatIf) {
  console.log("MODE: WhatIf (Simulation - no files written)\n");
}

if (! fs.existsSync(path.join(projectRoot, "package.json"))) {
  console.error("ERROR: package.json not found");
  process.exit(1);
}

function deleteFile(filepath, description) {
  if (isWhatIf) {
    console.log(`[SIMULATE] DELETE: ${filepath}`);
    console.log(`  → ${description}\n`);
  } else {
    if (fs.existsSync(filepath)) {
      const backupPath = path.join(backupDir, path.basename(filepath));
      if (! fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      fs.copyFileSync(filepath, backupPath);
      fs.unlinkSync(filepath);
      console.log(`✓ DELETED: ${filepath}`);
      console.log(`  (backed up to ${backupPath})\n`);
    }
  }
}

function createFile(filepath, content, description) {
  if (isWhatIf) {
    console.log(`[SIMULATE] CREATE: ${filepath}`);
    console.log(`  → ${description}`);
    console.log(`  → Size: ~${content.length} bytes\n`);
  } else {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, content, "utf8");
    console.log(`✓ CREATED: ${filepath}\n`);
  }
}

function updateFile(filepath, content, description) {
  if (! fs.existsSync(filepath)) {
    console.error(`ERROR: File not found: ${filepath}`);
    return;
  }
  
  if (isWhatIf) {
    console.log(`[SIMULATE] UPDATE: ${filepath}`);
    console.log(`  → ${description}\n`);
  } else {
    const backupPath = path.join(backupDir, path.basename(filepath) + ".bak");
    if (! fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(filepath, backupPath);
    fs.writeFileSync(filepath, content, "utf8");
    console.log(`✓ UPDATED: ${filepath}`);
    console.log(`  (backed up to ${backupPath})\n`);
  }
}

console.log("=== FILE OPERATIONS ===\n");

// 1. Delete .  eslintrc.json
deleteFile(
  path.join(projectRoot, ".eslintrc.json"),
  "Remove deprecated ESLint v8 config"
);

// 2. Create eslint.config.js
createFile(
  path.join(projectRoot, "eslint.config.js"),
  `import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      "node_modules/**",
      ". next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*. config.js",
      "*.config.ts",
      "*.config.mjs",
    ],
  },
  js. configs.recommended,
  ... tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next":  nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks":  "error",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-types": "off",
      "@typescript-eslint/no-floating-promises": "warn",
    },
  },
];`,
  "Create ESLint v9 flat config"
);

// 3. Delete jest.setup.ts
deleteFile(
  path.join(projectRoot, "jest.setup.ts"),
  "Remove Jest setup (migrating to Vitest)"
);

// 4. Update vitest.config.ts
updateFile(
  path.join(projectRoot, "vitest.config. ts"),
  `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude:  [
        "node_modules/",
        "tests/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});`,
  "Add proper setup files and globals"
);

// 5. Create tests/setup.ts
createFile(
  path.join(projectRoot, "tests", "setup.ts"),
  `import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi. fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Mock fetch globally
global.fetch = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});`,
  "Create Vitest setup with proper mocks"
);

// 6. Create src/types/database.ts
createFile(
  path.join(projectRoot, "src", "types", "database.ts"),
  `import { User as AuthUser } from "@supabase/supabase-js";

// ============================================
// USER PROFILE TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface UserProfileComplete extends UserProfile {
  roles: Role | null;
  departments: Department | null;
}

// ============================================
// TICKET TYPES
// ============================================

export type TicketType = "RFQ" | "GEN";
export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface RFQData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  cargo_category: string;
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
  length:  number;
  width: number;
  height: number;
  volume_per_unit: number;
  total_volume: number;
  scope_of_work: string;
}

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
  rfq_data: RFQData | null;
  created_at:  string;
  updated_at:  string;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface TicketWithRelations extends Ticket {
  departments: Department | null;
  creator: UserProfile | null;
  assignee: UserProfile | null;
}

// ============================================
// SLA TYPES
// ============================================

export interface SLAConfig {
  id: string;
  department_id: string;
  ticket_type: TicketType;
  first_response_hours: number;
  resolution_hours: number;
}

export interface SLATracking {
  id: string;
  ticket_id: string;
  first_response_at: string | null;
  first_response_sla_hours: number;
  first_response_met:  boolean | null;
  resolution_at:  string | null;
  resolution_sla_hours: number;
  resolution_met: boolean | null;
}

// ============================================
// COMMENT & ATTACHMENT TYPES
// ============================================

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

// ============================================
// QUOTE TYPES
// ============================================

export interface RateQuote {
  id: string;
  ticket_id: string;
  quote_number: string;
  amount: number;
  currency: string;
  valid_until: string;
  terms: string | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  created_by: string;
  created_at: string;
}

// ============================================
// SUPABASE RPC PARAMS
// ============================================

export interface GetDashboardSummaryParams {
  p_user_id: string;
  p_department_id?: string | null;
}

export interface GetSLAMetricsParams {
  p_user_id: string;
  p_department_id?: string | null;
  p_days?:  number;
}

export interface AssignTicketParams {
  p_ticket_id: string;
  p_assigned_to:  string;
  p_assigned_by: string;
  p_notes?: string | null;
}

export interface CreateAuditLogParams {
  p_table_name: string;
  p_record_id: string;
  p_action: string;
  p_old_data?:  Record<string, unknown> | null;
  p_new_data?: Record<string, unknown> | null;
  p_user_id: string;
  p_ip_address?:  string | null;
}

// ============================================
// DASHBOARD RESPONSE TYPES
// ============================================

export interface DashboardSummary {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  tickets_by_status: Array<{
    status: TicketStatus;
    count:  number;
  }>;
  tickets_by_department: Array<{
    department:  string;
    count: number;
  }>;
}

export interface SLAMetric {
  department:  string;
  department_code: string;
  total_tickets: number;
  first_response_avg_hours: number;
  first_response_compliance: number;
  resolution_avg_hours: number;
  resolution_compliance: number;
}`,
  "Add complete database type definitions"
);

// 7. Create src/lib/permissions.ts
createFile(
  path.join(projectRoot, "src", "lib", "permissions.ts"),
  `import { NextResponse } from "next/server";
import type { UserProfileComplete } from "@/types/database";

// ============================================
// ROLE CHECKERS
// ============================================

export function isSuperAdmin(profile: UserProfileComplete | null): boolean {
  return profile?.roles?.name === "super_admin" || false;
}

export function isManager(profile: UserProfileComplete | null): boolean {
  const managerRoles = [
    "super_admin",
    "marketing_manager",
    "sales_manager",
    "domestics_ops_manager",
    "exim_ops_manager",
    "import_dtd_ops_manager",
    "warehouse_traffic_ops_manager",
  ];
  return managerRoles.includes(profile?.roles?.name || "") || false;
}

export function isStaff(profile: UserProfileComplete | null): boolean {
  const staffRoles = ["marketing_staff", "salesperson"];
  return staffRoles.includes(profile?.roles?.name || "") || false;
}

export function canAccessTicket(
  profile: UserProfileComplete | null,
  ticketCreatorId: string,
  ticketAssigneeId: string | null,
  ticketDepartmentId: string,
): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (isManager(profile) && profile.departments?.id === ticketDepartmentId) {
    return true;
  }
  return profile.id === ticketCreatorId || profile.id === ticketAssigneeId;
}

export function canAssignTicket(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

export function canCreateQuote(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

export function canManageUsers(profile: UserProfileComplete | null): boolean {
  return isSuperAdmin(profile) || false;
}

export function canViewAuditLog(profile: UserProfileComplete | null): boolean {
  return isManager(profile) || false;
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function forbiddenResponse(message = "Access denied") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 403 },
  );
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse. json(
    { success: false, message, errors: [] },
    { status: 401 },
  );
}

export function notFoundResponse(message = "Resource not found") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 404 },
  );
}

export function badRequestResponse(
  message = "Bad request",
  errors: Array<{ field: string; message:  string }> = [],
) {
  return NextResponse.json(
    { success: false, message, errors },
    { status:  400 },
  );
}

export function conflictResponse(message = "Resource already exists") {
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 409 },
  );
}

export function internalErrorResponse(message = "Internal server error") {
  console.error("[API Error]", message);
  return NextResponse.json(
    { success: false, message, errors: [] },
    { status: 500 },
  );
}

export function successResponse<T>(data: T, message = "Success") {
  return NextResponse.json(
    { success: true, message, data },
    { status:  200 },
  );
}

export function createdResponse<T>(data: T, message = "Created successfully") {
  return NextResponse. json(
    { success: true, message, data },
    { status: 201 },
  );
}`,
  "Add permission helpers and response utilities"
);

// 8. Create src/hooks/useTicket.ts
createFile(
  path.join(projectRoot, "src", "hooks", "useTicket. ts"),
  `"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Ticket, TicketWithRelations } from "@/types/database";

const API_BASE = "/api/tickets";

// ============================================
// HOOK:  useTicket
// Fetch single ticket by ID with relations
// ============================================

interface UseTicketOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useTicket(
  ticketId: string | undefined,
  options: UseTicketOptions = {},
) {
  const { enabled = !!ticketId, refetchInterval } = options;

  return useQuery<TicketWithRelations>({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error("Ticket ID required");

      const res = await fetch(\`\${API_BASE}/\${ticketId}\`);
      if (!res.ok) throw new Error(\`Failed to fetch ticket: \${res.statusText}\`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Unknown error");

      return json.data as TicketWithRelations;
    },
    enabled,
    refetchInterval,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// HOOK: useUpdateTicket
// Mutate ticket status, priority, etc
// ============================================

export function useUpdateTicket(ticketId: string) {
  return useMutation({
    mutationFn: async (
      payload:  Partial<{
        status: string;
        priority: string;
        description:  string;
        subject: string;
      }>,
    ) => {
      const res = await fetch(\`\${API_BASE}/\${ticketId}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(\`Update failed: \${res.statusText}\`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      return json.data as Ticket;
    },
  });
}

// ============================================
// HOOK: useAssignTicket
// Assign ticket to user
// ============================================

export function useAssignTicket(ticketId: string) {
  return useMutation({
    mutationFn: async (payload: {
      assigned_to: string;
      notes?: string;
    }) => {
      const res = await fetch(\`\${API_BASE}/\${ticketId}/assign\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(\`Assign failed: \${res.statusText}\`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      return json.data;
    },
  });
}

// ============================================
// HOOK: useDeleteTicket
// Delete ticket
// ============================================

export function useDeleteTicket() {
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await fetch(\`\${API_BASE}/\${ticketId}\`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(\`Delete failed: \${res.statusText}\`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      return json.data;
    },
  });
}`,
  "Create useTicket hook with query and mutation hooks"
);

// 9. Update src/hooks/useCurrentUser.ts
updateFile(
  path.join(projectRoot, "src", "hooks", "useCurrentUser.ts"),
  `"use client";

import { useAuth } from "./useAuth";
import {
  isSuperAdmin,
  isManager,
  isStaff,
} from "@/lib/permissions";
import type { UserProfileComplete } from "@/types/database";

// ============================================
// HOOK:  useCurrentUser
// Extended auth hook with role/permission checks
// ============================================

export function useCurrentUser() {
  const { user, profile, isLoading, error, isAuthenticated } = useAuth();

  // Ensure profile has correct type
  const typedProfile = profile as UserProfileComplete | null;

  return {
    user,
    profile: typedProfile,
    isLoading,
    error,
    isAuthenticated,
    
    // Permission flags
    isSuperAdmin:  isSuperAdmin(typedProfile),
    isManager: isManager(typedProfile),
    isStaff: isStaff(typedProfile),
    
    // Convenience checks
    isActive: typedProfile?.is_active ?? false,
    departmentId: typedProfile?.department_id ?? null,
    roleId: typedProfile?.role_id ?? null,
    roleName: typedProfile?.roles?.name ?? null,
  };
}`,
  "Add permission helpers and convenience methods to useCurrentUser"
);

console.log("=== SUMMARY ===\n");

if (isWhatIf) {
  console.log("Simulation complete. No files were modified.");
  console.log("Review the changes above and run with --apply to execute.\n");
} else {
  console.log("✓ Patch applied successfully!");
  console.log(`✓ Backups saved to: ${backupDir}\n`);
  console.log("NEXT STEPS:");
  console.log("1. npm ci");
  console.log("2. npm run lint");
  console.log("3. npm run typecheck");
  console.log("4. npm run build\n");
}
`,
  "Run Node.js patch script"
);