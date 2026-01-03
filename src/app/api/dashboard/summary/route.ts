import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();

    // Build query based on role
    let ticketQuery = supabase
      .from("tickets")
      .select(`
        id, status, priority, ticket_type, department_id,
        created_at, created_by, assigned_to, subject, ticket_code,
        close_outcome, close_reason,
        departments (id, code, name)
      `)
      .order("created_at", { ascending: false });

    if (!isSuperAdmin(profile)) {
      if (isManager(profile) && profile.department_id) {
        // Manager sees tickets from their department OR created by them
        ticketQuery = ticketQuery.or(`department_id.eq.${profile.department_id},created_by.eq.${profile.id}`);
      } else {
        // Regular user sees tickets they created OR assigned to them
        ticketQuery = ticketQuery.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
      }
    }

    const { data: tickets, error } = await ticketQuery;

    if (error) {
      console.error("Dashboard query error:", error);
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    const ticketList = tickets || [];

    // Calculate counts
    const statusCounts = {
      open: ticketList.filter((t) => t.status === "open").length,
      need_response: ticketList.filter((t) => t.status === "need_response").length,
      in_progress: ticketList.filter((t) => t.status === "in_progress").length,
      waiting_customer: ticketList.filter((t) => t.status === "waiting_customer").length,
      need_adjustment: ticketList.filter((t) => t.status === "need_adjustment").length,
      pending: ticketList.filter((t) => t.status === "pending").length,
      resolved: ticketList.filter((t) => t.status === "resolved").length,
      closed: ticketList.filter((t) => t.status === "closed").length,
    };

    const typeCounts = {
      rfq: ticketList.filter((t) => t.ticket_type === "RFQ").length,
      gen: ticketList.filter((t) => t.ticket_type === "GEN").length,
    };

    // RFQ outcome counts
    const closedTickets = ticketList.filter((t) => t.status === "closed");
    const wonTickets = closedTickets.filter((t) => t.close_outcome === "won").length;
    const lostTickets = closedTickets.filter((t) => t.close_outcome === "lost").length;

    // Tickets by status for chart
    const ticketsByStatus = [
      { status: "Open", count: statusCounts.open },
      { status: "Need Response", count: statusCounts.need_response },
      { status: "In Progress", count: statusCounts.in_progress },
      { status: "Waiting Customer", count: statusCounts.waiting_customer },
      { status: "Pending", count: statusCounts.pending },
      { status: "Closed", count: statusCounts.closed },
    ].filter((s) => s.count > 0);

    // Tickets by department
    const deptCounts: Record<string, number> = {};
    ticketList.forEach((ticket) => {
      const deptName = (ticket.departments as any)?.name || "Unknown";
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });
    const ticketsByDepartment = Object.entries(deptCounts).map(([name, count]) => ({
      department: name,
      count,
    }));

    // Recent tickets
    const recentTickets = ticketList.slice(0, 5).map((t) => ({
      id: t.id,
      ticket_code: t.ticket_code,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      created_at: t.created_at,
      department: (t.departments as any)?.name || "Unknown",
    }));

    return NextResponse.json({
      success: true,
      data: {
        total_tickets: ticketList.length,
        open_tickets: statusCounts.open,
        need_response_tickets: statusCounts.need_response,
        in_progress_tickets: statusCounts.in_progress,
        waiting_customer_tickets: statusCounts.waiting_customer,
        pending_tickets: statusCounts.pending,
        closed_tickets: statusCounts.closed,
        rfq_tickets: typeCounts.rfq,
        gen_tickets: typeCounts.gen,
        won_tickets: wonTickets,
        lost_tickets: lostTickets,
        tickets_by_status: ticketsByStatus,
        tickets_by_department: ticketsByDepartment,
        recent_tickets: recentTickets,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/summary error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
