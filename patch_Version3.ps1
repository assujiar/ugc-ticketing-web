<#
.SYNOPSIS
    UGC Ticketing Platform - Build Fix Patch v2.0
    Complete fix for ESLint, TypeScript, Hooks, API types

.PARAMETER WhatIf
    Simulate changes without writing files

.PARAMETER Apply
    Apply all changes to disk

.EXAMPLE
    .\patch.ps1 -WhatIf
    .\patch.ps1 -Apply
#>

param(
    [switch]$WhatIf,
    [switch]$Apply
)

$projectRoot = Get-Location
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$projectRoot\. patch_backups\$timestamp"
$patchLog = "$projectRoot\patch_$timestamp.log"

$colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Log {
    param([string]$Message, [string]$Type = 'Info')
    $ts = Get-Date -Format "HH:mm:ss"
    $output = "[$ts] [$Type] $Message"
    Write-Host $output -ForegroundColor $colors[$Type]
    Add-Content -Path $patchLog -Value $output -ErrorAction SilentlyContinue
}

function Test-FileExists {
    param([string]$Path)
    return Test-Path -LiteralPath $Path -PathType Leaf
}

function Backup-File {
    param([string]$SourcePath)
    
    if (-not (Test-FileExists $SourcePath)) {
        return
    }
    
    if (-not $WhatIf) {
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        $fileName = Split-Path $SourcePath -Leaf
        $backupPath = Join-Path $backupDir $fileName
        Copy-Item -LiteralPath $SourcePath -Destination $backupPath -Force
        Write-Log "Backed up:  $SourcePath" 'Success'
    }
}

function Create-File {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Description
    )
    
    $dir = Split-Path $Path -Parent
    
    if ($WhatIf) {
        Write-Log "[SIMULATE] CREATE:  $Path" 'Warning'
        Write-Log "  → $Description" 'Info'
        Write-Log "  → Size: ~$($Content.Length) bytes" 'Info'
        return
    }
    
    try {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8 -Force
        Write-Log "CREATED: $Path" 'Success'
    }
    catch {
        Write-Log "ERROR creating $Path :  $_" 'Error'
        throw
    }
}

function Update-File {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Description
    )
    
    if (-not (Test-FileExists $Path)) {
        Write-Log "File not found: $Path" 'Error'
        return $false
    }
    
    if ($WhatIf) {
        Write-Log "[SIMULATE] UPDATE: $Path" 'Warning'
        Write-Log "  → $Description" 'Info'
        return
    }
    
    try {
        Backup-File $Path
        Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8 -Force
        Write-Log "UPDATED: $Path" 'Success'
        return $true
    }
    catch {
        Write-Log "ERROR updating $Path : $_" 'Error'
        throw
    }
}

function Remove-FileIfExists {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (-not (Test-FileExists $Path)) {
        Write-Log "File doesn't exist (skip): $Path" 'Info'
        return
    }
    
    if ($WhatIf) {
        Write-Log "[SIMULATE] DELETE: $Path" 'Warning'
        Write-Log "  → $Description" 'Info'
        return
    }
    
    try {
        Backup-File $Path
        Remove-Item -LiteralPath $Path -Force
        Write-Log "DELETED: $Path" 'Success'
    }
    catch {
        Write-Log "ERROR deleting $Path : $_" 'Error'
        throw
    }
}

# ============================================
# HEADER
# ============================================
Write-Log "" 'Info'
Write-Log "========================================" 'Info'
Write-Log "UGC Ticketing Platform - Build Patch v2.0" 'Info'
Write-Log "========================================" 'Info'
Write-Log "Project Root: $projectRoot" 'Info'
Write-Log "Timestamp: $timestamp" 'Info'
Write-Log "Backup Directory: $backupDir" 'Info'
Write-Log "Log File: $patchLog" 'Info'
Write-Log "" 'Info'

# Validate project
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Log "ERROR: package.json not found" 'Error'
    exit 1
}

# Validate mode
if (-not $WhatIf -and -not $Apply) {
    Write-Log "ERROR: Use -WhatIf or -Apply" 'Error'
    Write-Log "Usage: .\patch.ps1 -WhatIf   # Simulate" 'Info'
    Write-Log "       .\patch.ps1 -Apply   # Execute" 'Info'
    exit 1
}

if ($WhatIf) {
    Write-Log "MODE: WhatIf (Simulation - no files written)" 'Warning'
}
else {
    Write-Log "MODE: Apply (Executing patch)" 'Warning'
}

Write-Log "" 'Info'

# ============================================
# EXECUTE PATCHES
# ============================================

Write-Log "=== FILE OPERATIONS ===" 'Info'
Write-Log "" 'Info'

# 1. Delete . eslintrc.json
Remove-FileIfExists ". eslintrc.json" "Remove deprecated ESLint v8 config"

# 2. Create eslint.config.js
Create-File "eslint.config.js" @'
import js from "@eslint/js";
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
      "react-hooks/rules-of-hooks": "error",
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
];
'@ "Create ESLint v9 flat config"

# 3. Update vitest.config.ts
Update-File "vitest.config.ts" @'
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles:  ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude:  [
        "node_modules/",
        "tests/",
        "**/*.test.ts",
        "**/*. test.tsx",
        "**/*.spec.ts",
        "**/*. spec.tsx",
      ],
    },
  },
  resolve: {
    alias:  {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
'@ "Add proper setup files and globals"

# 4. Delete jest.setup.ts
Remove-FileIfExists "jest.setup. ts" "Remove Jest setup (migrating to Vitest)"

# 5. Create tests/setup.ts
Create-File "tests/setup.ts" @'
import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
        data: { subscription: { unsubscribe:  vi.fn() } },
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
});
'@ "Create Vitest setup with proper mocks"

# 6. Create database types
Create-File "src/types/database.ts" @'
import { User as AuthUser } from "@supabase/supabase-js";

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
  roles:  Role | null;
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
  resolved_at:  string | null;
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
  id:  string;
  ticket_id:  string;
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
  p_department_id?:  string | null;
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
}
'@ "Add complete database type definitions"

# 7. Create permissions helper
Create-File "src/lib/permissions.ts" @'
import { NextResponse } from "next/server";
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
  return NextResponse.json(
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
}
'@ "Add permission helpers and response utilities"

Write-Log "" 'Info'
Write-Log "=== SUMMARY ===" 'Info'

if ($WhatIf) {
    Write-Log "" 'Info'
    Write-Log "Simulation complete. No files were modified." 'Warning'
    Write-Log "Review the changes above and run with -Apply to execute." 'Info'
}
else {
    Write-Log "" 'Info'
    Write-Log "Patch applied successfully!" 'Success'
    Write-Log "Backups saved to: $backupDir" 'Success'
    Write-Log "" 'Info'
    Write-Log "NEXT STEPS:" 'Warning'
    Write-Log "1. npm ci" 'Info'
    Write-Log "2. npm run lint" 'Info'
    Write-Log "3. npm run typecheck" 'Info'
    Write-Log "4. npm run build" 'Info'
}

Write-Log "" 'Info'
Write-Log "Log saved to: $patchLog" 'Info'
Write-Log "" 'Info'
'@ name=patch. ps1