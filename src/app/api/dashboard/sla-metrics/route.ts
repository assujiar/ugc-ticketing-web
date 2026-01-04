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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build base query for tickets
    let ticketQuery = supabase
      .from("tickets")
      .select("*, departments (id, code, name)")
      .gte("created_at", startDate.toISOString());

    if (!isSuperAdmin(profile)) {
      if (isManager(profile) && profile.department_id) {
        ticketQuery = ticketQuery.eq("department_id", profile.department_id);
      } else {
        ticketQuery = ticketQuery.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
      }
    }

    const { data: tickets } = await ticketQuery;
    const ticketList = tickets || [];

    // Calculate department metrics
    const deptMetrics: Record<string, {
      department: string;
      total_tickets: number;
      first_response_met: number;
      resolution_met: number;
    }> = {};

    ticketList.forEach((ticket: any) => {
      const deptName = ticket.departments?.name || "Unknown";
      if (!deptMetrics[deptName]) {
        deptMetrics[deptName] = {
          department: deptName,
          total_tickets: 0,
          first_response_met: 0,
          resolution_met: 0,
        };
      }
      const deptData = deptMetrics[deptName];
      if (deptData) {
        deptData.total_tickets++;
      }
    });

    const metricsArray = Object.values(deptMetrics).map((m) => ({
      ...m,
      first_response_compliance: m.total_tickets > 0 ? (m.first_response_met / m.total_tickets) * 100 : 0,
      resolution_compliance: m.total_tickets > 0 ? (m.resolution_met / m.total_tickets) * 100 : 0,
      first_response_avg_hours: 4,
      resolution_avg_hours: 24,
    }));

    // Calculate trend data (tickets per day)
    const trendMap: Record<string, { date: string; created: number; closed: number }> = {};
    
    // Initialize all days in range
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (dateStr) {
        trendMap[dateStr] = { date: dateStr, created: 0, closed: 0 };
      }
    }

    // Count tickets per day
    ticketList.forEach((ticket: any) => {
      const createdDate = ticket.created_at?.split("T")[0];
      const closedDate = ticket.closed_at?.split("T")[0];
      
      if (createdDate && trendMap[createdDate]) {
        trendMap[createdDate].created++;
      }
      if (closedDate && trendMap[closedDate]) {
        trendMap[closedDate].closed++;
      }
    });

    // Sort trend by date ascending
    const trend = Object.values(trendMap).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Overall metrics
    const overall = {
      total_tickets: ticketList.length,
      avg_first_response_hours: 4,
      avg_resolution_hours: 24,
      sla_compliance: metricsArray.length > 0 
        ? metricsArray.reduce((sum, m) => sum + m.first_response_compliance, 0) / metricsArray.length 
        : 0,
    };

    return NextResponse.json({ 
      success: true, 
      data: {
        metrics: metricsArray,
        trend,
        overall,
      }
    });
  } catch (error) {
    console.error("GET /api/dashboard/sla-metrics error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
