import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

// GET /api/dashboard/summary - Get dashboard summary metrics
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    const supabase = await createServerClient();

    // Use database function for role-based summary
    const { data: summary, error } = await supabase.rpc("get_dashboard_summary", {
      p_user_id: profile.id,
      p_department_id: profile.department_id,
    });

    if (error) {
      console.error("Dashboard summary error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    // Fetch recent tickets based on role
    let recentTicketsQuery = supabase
      .from("tickets")
      .select(
        `
        id,
        ticket_code,
        ticket_type,
        status,
        priority,
        subject,
        created_at,
        departments (
          code,
          name
        ),
        creator:users!tickets_created_by_fkey (
          full_name
        ),
        assignee:users!tickets_assigned_to_fkey (
          full_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    // Apply role-based filtering
    if (isSuperAdmin(profile)) {
      // Super admin sees all
    } else if (isManager(profile)) {
      // Manager sees department tickets
      if (profile.department_id) {
        recentTicketsQuery = recentTicketsQuery.eq("department_id", profile.department_id);
      }
    } else {
      // Staff sees own tickets
      recentTicketsQuery = recentTicketsQuery.or(
        `created_by.eq.${profile.id},assigned_to.eq.${profile.id}`
      );
    }

    const { data: recentTickets, error: recentError } = await recentTicketsQuery;

    if (recentError) {
      console.error("Recent tickets error:", recentError);
    }

    // Fetch tickets by type
    let ticketsByTypeQuery = supabase
      .from("tickets")
      .select("ticket_type");

    if (!isSuperAdmin(profile)) {
      if (isManager(profile) && profile.department_id) {
        ticketsByTypeQuery = ticketsByTypeQuery.eq("department_id", profile.department_id);
      } else {
        ticketsByTypeQuery = ticketsByTypeQuery.or(
          `created_by.eq.${profile.id},assigned_to.eq.${profile.id}`
        );
      }
    }

    const { data: ticketTypeData } = await ticketsByTypeQuery;

    // Count by type
    const ticketsByType: Record<string, number> = {};
    ticketTypeData?.forEach((t) => {
      ticketsByType[t.ticket_type] = (ticketsByType[t.ticket_type] || 0) + 1;
    });

    const ticketsByTypeArray = Object.entries(ticketsByType).map(([type, count]) => ({
      type,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        recent_tickets: recentTickets || [],
        tickets_by_type: ticketsByTypeArray,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching dashboard summary", success: false },
      { status: 500 }
    );
  }
}