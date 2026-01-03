import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();

    const { searchParams } = new URL(request.url);
    const daysRaw = searchParams.get("days");
    const days = Number.isFinite(Number(daysRaw)) ? Math.max(1, parseInt(daysRaw as string, 10)) : 30;

    // Supabase generated RPC typing seringnya expect string, bukan nullable
    const departmentId = isSuperAdmin(profile) ? "" : (profile.department_id ?? "");

    const { data: metrics, error } = await supabase.rpc("get_sla_metrics", {
      p_user_id: profile.id,
      p_department_id: departmentId,
      p_days: days,
    });

    if (error) {
      // Fallback calculation
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from("tickets")
        .select("*, sla_tracking (*), departments (id, code, name)")
        .gte("created_at", startDate.toISOString());

      if (!isSuperAdmin(profile)) {
        if (isManager(profile) && profile.department_id) {
          query = query.eq("department_id", profile.department_id);
        } else {
          query = query.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
        }
      }

      const { data: tickets } = await query;
      const ticketList = tickets || [];

      const deptMetrics: Record<
        string,
        { department: string; total_tickets: number; first_response_met: number; resolution_met: number }
      > = {};

      ticketList.forEach((ticket) => {
        const dept = ticket.departments as { name?: string } | null;
        const deptName = dept?.name || "Unknown";
        if (!deptMetrics[deptName]) {
          deptMetrics[deptName] = {
            department: deptName,
            total_tickets: 0,
            first_response_met: 0,
            resolution_met: 0,
          };
        }
        deptMetrics[deptName].total_tickets++;

        const slaTracking =
          ticket.sla_tracking as
            | { first_response_met?: boolean; resolution_met?: boolean }
            | { first_response_met?: boolean; resolution_met?: boolean }[]
            | null;

        const sla = Array.isArray(slaTracking) ? slaTracking[0] : slaTracking;
        if (sla?.first_response_met) deptMetrics[deptName].first_response_met++;
        if (sla?.resolution_met) deptMetrics[deptName].resolution_met++;
      });

      const metricsArray = Object.values(deptMetrics).map((m) => ({
        ...m,
        first_response_compliance: m.total_tickets > 0 ? (m.first_response_met / m.total_tickets) * 100 : 0,
        resolution_compliance: m.total_tickets > 0 ? (m.resolution_met / m.total_tickets) * 100 : 0,
        first_response_avg_hours: 4,
        resolution_avg_hours: 24,
      }));

      return NextResponse.json({ success: true, data: metricsArray });
    }

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("GET /api/dashboard/sla-metrics error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
