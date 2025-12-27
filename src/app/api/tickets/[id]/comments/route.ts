import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import type { CreateCommentRequest } from "@/types/api";

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

    // Check ticket access
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    const canView =
      isSuperAdmin(profile) ||
      ticket.created_by === profile.id ||
      ticket.assigned_to === profile.id ||
      (isManager(profile) && ticket.department_id === profile.department_id);

    if (!canView) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    // Get comments
    let query = supabase
      .from("ticket_comments")
      .select(`*, user:users!ticket_comments_user_id_fkey (id, full_name, email)`)
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    // Non-managers can't see internal comments
    if (!isSuperAdmin(profile) && !isManager(profile)) {
      query = query.eq("is_internal", false);
    }

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("GET /api/tickets/[id]/comments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const body: CreateCommentRequest = await request.json();
    const supabase = await createServerClient();

    if (!body.content?.trim()) {
      return NextResponse.json({ message: "Comment content is required", success: false }, { status: 400 });
    }

    // Check ticket access
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    const canComment =
      isSuperAdmin(profile) ||
      ticket.created_by === profile.id ||
      ticket.assigned_to === profile.id ||
      (isManager(profile) && ticket.department_id === profile.department_id);

    if (!canComment) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    // Only managers can create internal comments
    const isInternal = body.is_internal && (isSuperAdmin(profile) || isManager(profile));

    const { data: comment, error } = await supabase
      .from("ticket_comments")
      .insert({
        ticket_id: id,
        user_id: user.id,
        content: body.content,
        is_internal: isInternal || false,
      })
      .select(`*, user:users!ticket_comments_user_id_fkey (id, full_name, email)`)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    // Update SLA first response if this is the first comment from staff
    if (ticket.created_by !== user.id) {
      await supabase.rpc("update_sla_event", { p_ticket_id: id, p_event_type: "first_response" });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "ticket_comments",
      p_record_id: comment.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: comment as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/[id]/comments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
