import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

// GET /api/dashboard/sla-metrics - Get SLA performance metrics
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const supabase = await createServerClient();

    // Use database function for role-based SLA metrics
    const { data: metrics, error } = await supabase.rpc("get_sla_metrics", {
      p_user_id: profile.id,
      p_department_id: profile.department_id,
      p_days: days,
    });

    if (error) {
      console.error("SLA metrics error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    // Calculate additional metrics for the response
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get trend data (tickets created per day)
    let trendQuery = supabase
      .from("tickets")
      .select("created_at, status")
      .gte("created_at", startDate.toISOString());

    if (!isSuperAdmin(profile)) {
      if (isManager(profile) && profile.department_id) {
        trendQuery = trendQuery.eq("department_id", profile.department_id);
      } else {
        trendQuery = trendQuery.or(
          `created_by.eq.${profile.id},assigned_to.eq.${profile.id}`
        );
      }
    }

    const { data: trendData } = await trendQuery;

    // Group by date
    const ticketsByDate: Record<string, { total: number; resolved: number }> = {};
    
    trendData?.forEach((ticket) => {
      const date = new Date(ticket.created_at).toISOString().split("T")[0];
      if (!ticketsByDate[date]) {
        ticketsByDate[date] = { total: 0, resolved: 0 };
      }
      ticketsByDate[date].total++;
      if (ticket.status === "resolved" || ticket.status === "closed") {
        ticketsByDate[date].resolved++;
      }
    });

    const trendArray = Object.entries(ticketsByDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        resolved: data.resolved,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate overall SLA compliance
    let overallFirstResponseCompliance = 0;
    let overallResolutionCompliance = 0;
    let totalDepartments = 0;

    if (Array.isArray(metrics)) {
      metrics.forEach((m: { first_response_compliance: number | null; resolution_compliance: number | null }) => {
        if (m.first_response_compliance !== null) {
          overallFirstResponseCompliance += m.first_response_compliance;
          totalDepartments++;
        }
        if (m.resolution_compliance !== null) {
          overallResolutionCompliance += m.resolution_compliance;
        }
      });

      if (totalDepartments > 0) {
        overallFirstResponseCompliance = Math.round(
          (overallFirstResponseCompliance / totalDepartments) * 100
        ) / 100;
        overallResolutionCompliance = Math.round(
          (overallResolutionCompliance / totalDepartments) * 100
        ) / 100;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: metrics || [],
        trend: trendArray,
        period_days: days,
        overall: {
          first_response_compliance: overallFirstResponseCompliance,
          resolution_compliance: overallResolutionCompliance,
        },
      },
    });
  } catch (error) {
    console.error("SLA metrics error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching SLA metrics", success: false },
      { status: 500 }
    );
  }
}