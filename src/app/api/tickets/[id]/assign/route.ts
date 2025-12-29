import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import type { AssignTicketRequest } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const body: AssignTicketRequest = await request.json();
    const supabase = await createServerClient();

    // Check permission
    if (!isSuperAdmin(profile) && !isManager(profile)) {
      return NextResponse.json({ message: "Not authorized to assign tickets", success: false }, { status: 403 });
    }

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    // Check department access for managers
    if (!isSuperAdmin(profile) && ticket.department_id !== profile.department_id) {
      return NextResponse.json({ message: "Cannot assign tickets from other departments", success: false }, { status: 403 });
    }

    // Validate assignee
    const { data: assignee, error: assigneeError } = await supabase
      .from("users")
      .select("id, full_name, is_active")
      .eq("id", body.assigned_to)
      .single();

    if (assigneeError || !assignee) {
      return NextResponse.json({ message: "Assignee not found", success: false }, { status: 400 });
    }

    if (!assignee.is_active) {
      return NextResponse.json({ message: "Cannot assign to inactive user", success: false }, { status: 400 });
    }

    // Assign ticket using RPC
    const { error: assignError } = await supabase.rpc("assign_ticket", {
      p_ticket_id: id,
      p_assigned_to: body.assigned_to,
      p_assigned_by: user.id,
      p_notes: body.notes || null,
    });

    if (assignError) {
      return NextResponse.json({ message: assignError.message, success: false }, { status: 500 });
    }

    // Get updated ticket
    const { data: updatedTicket } = await supabase
      .from("tickets")
      .select(
        `*, departments (id, code, name),
        creator:users!tickets_created_by_fkey (id, full_name, email),
        assignee:users!tickets_assigned_to_fkey (id, full_name, email)`
      )
      .eq("id", id)
      .single();

    await supabase.rpc("log_audit", {
      p_table_name: "tickets",
      p_record_id: id,
      p_action: "update",
      p_old_data: { assigned_to: ticket.assigned_to },
      p_new_data: { assigned_to: body.assigned_to, assigned_by: user.id, notes: body.notes },
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: `Ticket assigned to ${assignee.full_name}`,
    });
  } catch (error) {
    console.error("POST /api/tickets/[id]/assign error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
