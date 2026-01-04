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

    let query = (supabase as any)
      .from("department_response_performance")
      .select("*")
      .order("total_tickets", { ascending: false });

    // Role-based filtering
    if (isSuperAdmin(profile)) {
      // Super admin sees all departments
      if (departmentId) query = query.eq("department_id", departmentId);
    } else if (isManager(profile)) {
      // Manager sees only their department
      if (profile.department_id) {
        query = query.eq("department_id", profile.department_id);
      }
    } else {
      // Regular user sees only their department
      if (profile.department_id) {
        query = query.eq("department_id", profile.department_id);
      } else {
        // No department = no data
        return NextResponse.json({ 
          success: true, 
          data: [],
          meta: { role: profile.roles?.name }
        });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Department performance error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      meta: {
        role: profile.roles?.name,
        canViewAll: isSuperAdmin(profile),
      }
    });
  } catch (error) {
    console.error("GET /api/performance/departments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
