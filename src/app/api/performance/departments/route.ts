import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("department_id");

    let query = (supabase as any)
      .from("department_response_performance")
      .select("*")
      .order("total_tickets", { ascending: false });

    if (departmentId) query = query.eq("department_id", departmentId);

    const { data, error } = await query;

    if (error) {
      console.error("Department performance error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/performance/departments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
