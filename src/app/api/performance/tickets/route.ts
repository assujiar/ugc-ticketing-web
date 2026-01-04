import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("department_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = (supabase as any)
      .from("ticket_response_summary")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Role-based filtering
    if (isSuperAdmin(profile)) {
      // Super admin sees all tickets
      if (departmentId) query = query.eq("department_id", departmentId);
    } else if (isManager(profile)) {
      // Manager sees their department's tickets
      if (profile.department_id) {
        query = query.eq("department_id", profile.department_id);
      }
    } else {
      // Regular user sees only tickets they created or are assigned to
      query = query.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
    }

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      console.error("Ticket performance error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      meta: {
        role: profile.roles?.name,
        canViewAll: isSuperAdmin(profile),
        canViewDepartment: isManager(profile),
      }
    });
  } catch (error) {
    console.error("GET /api/performance/tickets error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
