import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();

    const departmentId = isSuperAdmin(profile) ? null : profile.department_id;

    const { data: summary, error } = await supabase.rpc("get_dashboard_summary", {
      p_user_id: profile.id,
      p_department_id: departmentId,
    });

    if (error) {
      let ticketQuery = supabase.from("tickets").select("*");

      if (!isSuperAdmin(profile)) {
        if (isManager(profile) && profile.department_id) {
          ticketQuery = ticketQuery.eq("department_id", profile.department_id);
        } else {
          ticketQuery = ticketQuery.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
        }
      }

      const { data: tickets } = await ticketQuery;
      const ticketList = tickets || [];

      return NextResponse.json({
        success: true,
        data: {
          total_tickets: ticketList.length,
          open_tickets: ticketList.filter((t) => t.status === "open").length,
          in_progress_tickets: ticketList.filter((t) => t.status === "in_progress").length,
          resolved_tickets: ticketList.filter((t) => t.status === "resolved" || t.status === "closed").length,
          tickets_by_status: [
            { status: "open", count: ticketList.filter((t) => t.status === "open").length },
            { status: "in_progress", count: ticketList.filter((t) => t.status === "in_progress").length },
            { status: "pending", count: ticketList.filter((t) => t.status === "pending").length },
            { status: "resolved", count: ticketList.filter((t) => t.status === "resolved").length },
            { status: "closed", count: ticketList.filter((t) => t.status === "closed").length },
          ],
          tickets_by_type: [
            { type: "RFQ", count: ticketList.filter((t) => t.ticket_type === "RFQ").length },
            { type: "GEN", count: ticketList.filter((t) => t.ticket_type === "GEN").length },
          ],
          tickets_by_department: [],
          recent_tickets: ticketList.slice(0, 5),
        },
      });
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("GET /api/dashboard/summary error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
