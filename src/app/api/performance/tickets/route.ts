import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
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

    if (departmentId) query = query.eq("department_id", departmentId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      console.error("Ticket performance error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/performance/tickets error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
