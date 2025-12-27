import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import type { UpdateTicketRequest } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = await createServerClient();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(
        `*, departments (id, code, name),
        creator:users!tickets_created_by_fkey (id, full_name, email),
        assignee:users!tickets_assigned_to_fkey (id, full_name, email)`
      )
      .eq("id", id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    // Check access
    const canView =
      isSuperAdmin(profile) ||
      ticket.created_by === profile.id ||
      ticket.assigned_to === profile.id ||
      (isManager(profile) && ticket.department_id === profile.department_id);

    if (!canView) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const body: UpdateTicketRequest = await request.json();
    const supabase = await createServerClient();

    // Get existing ticket
    const { data: existingTicket, error: fetchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingTicket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    // Check access
    const canUpdate =
      isSuperAdmin(profile) ||
      existingTicket.created_by === profile.id ||
      existingTicket.assigned_to === profile.id ||
      (isManager(profile) && existingTicket.department_id === profile.department_id);

    if (!canUpdate) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "resolved" && !existingTicket.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
        await supabase.rpc("update_sla_event", { p_ticket_id: id, p_event_type: "resolved" });
      }
      if (body.status === "closed" && !existingTicket.closed_at) {
        updateData.closed_at = new Date().toISOString();
        if (!existingTicket.resolved_at) {
          updateData.resolved_at = new Date().toISOString();
          await supabase.rpc("update_sla_event", { p_ticket_id: id, p_event_type: "resolved" });
        }
      }
      if (body.status === "in_progress" && existingTicket.status === "open") {
        await supabase.rpc("update_sla_event", { p_ticket_id: id, p_event_type: "first_response" });
      }
    }
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.description !== undefined) updateData.description = body.description;

    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ message: updateError.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "tickets",
      p_record_id: id,
      p_action: "update",
      p_old_data: existingTicket as Record<string, unknown>,
      p_new_data: updatedTicket as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const supabase = await createServerClient();

    const { data: ticket, error: fetchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    const canDelete =
      isSuperAdmin(profile) ||
      ticket.created_by === profile.id ||
      (isManager(profile) && ticket.department_id === profile.department_id);

    if (!canDelete) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from("tickets").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "tickets",
      p_record_id: id,
      p_action: "delete",
      p_old_data: ticket as Record<string, unknown>,
      p_new_data: null,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, message: "Ticket deleted" });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
