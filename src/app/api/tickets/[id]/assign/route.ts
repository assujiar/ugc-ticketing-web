import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { canAssignTicket, forbiddenResponse } from "@/lib/permissions";
import { validate, validationErrorResponse, assignTicketSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tickets/:id/assign - Assign ticket to user
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
    const validation = validate(assignTicketSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const { assigned_to, notes } = validation.data;

    const supabase = await createServerClient();

    // Fetch existing ticket
    const { data: existingTicket, error: fetchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Ticket not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: fetchError.message, success: false },
        { status: 500 }
      );
    }

    // Check permission
    const ticketContext = {
      createdBy: existingTicket.created_by,
      assignedTo: existingTicket.assigned_to,
      departmentId: existingTicket.department_id,
    };

    if (!canAssignTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to assign this ticket");
    }

    // Verify assignee exists and is active
    const { data: assignee, error: assigneeError } = await supabase
      .from("users")
      .select("id, full_name, email, is_active")
      .eq("id", assigned_to)
      .single();

    if (assigneeError || !assignee) {
      return NextResponse.json(
        { message: "Invalid assignee", success: false },
        { status: 400 }
      );
    }

    if (!assignee.is_active) {
      return NextResponse.json(
        { message: "Cannot assign to inactive user", success: false },
        { status: 400 }
      );
    }

    // Use database function to assign ticket
    const { data: updatedTicket, error: assignError } = await supabase.rpc(
      "assign_ticket",
      {
        p_ticket_id: id,
        p_assigned_to: assigned_to,
        p_assigned_by: profile.id,
        p_notes: notes || null,
      }
    );

    if (assignError) {
      console.error("Ticket assignment error:", assignError);
      return NextResponse.json(
        { message: assignError.message, success: false },
        { status: 500 }
      );
    }

    // Fetch updated ticket with relations
    const { data: ticket, error: refetchError } = await supabase
      .from("tickets")
      .select(
        `
        id,
        ticket_code,
        ticket_type,
        status,
        priority,
        subject,
        description,
        department_id,
        created_by,
        assigned_to,
        rfq_data,
        created_at,
        updated_at,
        resolved_at,
        closed_at,
        departments (
          id,
          code,
          name
        ),
        creator:users!tickets_created_by_fkey (
          id,
          full_name,
          email
        ),
        assignee:users!tickets_assigned_to_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (refetchError) {
      // Return basic data if refetch fails
      return NextResponse.json({
        success: true,
        data: updatedTicket,
        message: `Ticket assigned to ${assignee.full_name}`,
      });
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "ticket_assignments",
      p_record_id: id,
      p_action: "create",
      p_old_data: { assigned_to: existingTicket.assigned_to },
      p_new_data: { assigned_to, assigned_by: profile.id, notes },
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Ticket assigned to ${assignee.full_name}`,
    });
  } catch (error) {
    console.error("Ticket assignment error:", error);
    return NextResponse.json(
      { message: "An error occurred while assigning the ticket", success: false },
      { status: 500 }
    );
  }
}

// GET /api/tickets/:id/assign - Get assignment history
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

    // Fetch assignment history
    const { data: assignments, error } = await supabase
      .from("ticket_assignments")
      .select(
        `
        id,
        ticket_id,
        assigned_to,
        assigned_by,
        assigned_at,
        notes,
        assignee:users!ticket_assignments_assigned_to_fkey (
          id,
          full_name,
          email
        ),
        assigner:users!ticket_assignments_assigned_by_fkey (
          id,
          full_name
        )
      `
      )
      .eq("ticket_id", id)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("Assignment history fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignments || [],
    });
  } catch (error) {
    console.error("Assignment history error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching assignment history", success: false },
      { status: 500 }
    );
  }
}