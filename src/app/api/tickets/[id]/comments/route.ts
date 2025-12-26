import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import {
  canViewTicket,
  canViewInternalComments,
  canCreateInternalComment,
  forbiddenResponse,
} from "@/lib/permissions";
import { validate, validationErrorResponse, createCommentSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tickets/:id/comments - Get comments for a ticket
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    const supabase = await createServerClient();

    // Fetch ticket to check permission
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id")
      .eq("id", id)
      .single();

    if (ticketError) {
      if (ticketError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Ticket not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: ticketError.message, success: false },
        { status: 500 }
      );
    }

    // Check view permission
    const ticketContext = {
      createdBy: ticket.created_by,
      assignedTo: ticket.assigned_to,
      departmentId: ticket.department_id,
    };

    if (!canViewTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to view this ticket's comments");
    }

    // Build query
    let query = supabase
      .from("ticket_comments")
      .select(
        `
        id,
        ticket_id,
        user_id,
        content,
        is_internal,
        created_at,
        updated_at,
        user:users!ticket_comments_user_id_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    // Filter out internal comments if user doesn't have permission
    if (!canViewInternalComments(profile)) {
      query = query.eq("is_internal", false);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error("Comments fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comments || [],
    });
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching comments", success: false },
      { status: 500 }
    );
  }
}

// POST /api/tickets/:id/comments - Add a comment to a ticket
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Parse and validate body
    const body = await request.json();
    const validation = validate(createCommentSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const { content, is_internal } = validation.data;

    const supabase = await createServerClient();

    // Fetch ticket to check permission
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id")
      .eq("id", id)
      .single();

    if (ticketError) {
      if (ticketError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Ticket not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: ticketError.message, success: false },
        { status: 500 }
      );
    }

    // Check view permission (must be able to view ticket to comment)
    const ticketContext = {
      createdBy: ticket.created_by,
      assignedTo: ticket.assigned_to,
      departmentId: ticket.department_id,
    };

    if (!canViewTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to comment on this ticket");
    }

    // Check internal comment permission
    if (is_internal && !canCreateInternalComment(profile)) {
      return forbiddenResponse("You do not have permission to create internal comments");
    }

    // Create comment
    const { data: comment, error: createError } = await supabase
      .from("ticket_comments")
      .insert({
        ticket_id: id,
        user_id: profile.id,
        content,
        is_internal: is_internal || false,
      })
      .select(
        `
        id,
        ticket_id,
        user_id,
        content,
        is_internal,
        created_at,
        updated_at,
        user:users!ticket_comments_user_id_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .single();

    if (createError) {
      console.error("Comment creation error:", createError);
      return NextResponse.json(
        { message: createError.message, success: false },
        { status: 500 }
      );
    }

    // Update SLA first response if this is the first response from staff
    // Only update if commenter is not the ticket creator and this is not an internal comment
    if (!is_internal && profile.id !== ticket.created_by) {
      await supabase.rpc("update_sla_tracking", {
        p_ticket_id: id,
        p_event_type: "first_response",
      });
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "ticket_comments",
      p_record_id: comment.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: comment,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json(
      { success: true, data: comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the comment", success: false },
      { status: 500 }
    );
  }
}