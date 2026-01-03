import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import { forbiddenResponse } from "@/lib/permissions";

type AuditAction = "create" | "update" | "delete";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile) && !isManager(profile)) {
      return forbiddenResponse("Only managers and administrators can view audit logs");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const tableName = searchParams.get("table_name");
    const action = searchParams.get("action") as AuditAction | null;

    const supabase = createAdminClient();

    let query = supabase
      .from("audit_logs")
      .select(
        `
        id, table_name, record_id, action, old_data, new_data, ip_address, created_at,
        users ( id, full_name, email )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (tableName) query = query.eq("table_name", tableName);
    if (action) query = query.eq("action", action);

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch audit logs", success: false }, { status: 500 });
  }
}
