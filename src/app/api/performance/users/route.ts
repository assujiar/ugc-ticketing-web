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
    const userId = searchParams.get("user_id");

    let query = (supabase as any)
      .from("user_response_performance")
      .select("*")
      .order("total_responses", { ascending: false });

    // Role-based filtering
    if (isSuperAdmin(profile)) {
      // Super admin sees all
      if (departmentId) query = query.eq("department_id", departmentId);
      if (userId) query = query.eq("user_id", userId);
    } else if (isManager(profile)) {
      // Manager sees their department only
      if (profile.department_id) {
        query = query.eq("department_id", profile.department_id);
      }
      if (userId) query = query.eq("user_id", userId);
    } else {
      // Regular user sees only their own data
      query = query.eq("user_id", profile.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("User performance error:", error);
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
    console.error("GET /api/performance/users error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
