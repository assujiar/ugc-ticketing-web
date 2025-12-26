import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { canViewTicket, canUpdateTicket, canDeleteTicket, forbiddenResponse } from "@/lib/permissions";
import { validate, validationErrorResponse, updateTicketSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tickets/:id - Get ticket detail
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

    // Fetch ticket with all relations
    const { data: ticket, error } = await supabase
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
        ),
        sla_tracking (
          id,
          first_response_at,
          first_response_sla_hours,
          first_response_met,
          resolution_at,
          resolution_sla_hours,
          resolution_met
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { message: "Ticket not found", success: false },
          { status: 404 }
        );
      }
      console.error("Ticket fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    // Check permission
    const ticketContext = {
      createdBy: ticket.created_by,
      assignedTo: ticket.assigned_to,
      departmentId: ticket.department_id,
    };

    if (!canViewTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to view this ticket");
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Ticket fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the ticket", success: false },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/:id - Update ticket
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const validation = validate(updateTicketSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

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

    if (!canUpdateTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to update this ticket");
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...validation.data };

    // Handle status transitions
    if (updateData.status) {
      const newStatus = updateData.status as string;

      // Set resolved_at when moving to resolved
      if (newStatus === "resolved" && !existingTicket.resolved_at) {
        updateData.resolved_at = new Date().toISOString();

        // Update SLA tracking
        await supabase.rpc("update_sla_tracking", {
          p_ticket_id: id,
          p_event_type: "resolution",
        });
      }

      // Set closed_at when moving to closed
      if (newStatus === "closed" && !existingTicket.closed_at) {
        updateData.closed_at = new Date().toISOString();

        // Also set resolved_at if not already set
        if (!existingTicket.resolved_at) {
          updateData.resolved_at = new Date().toISOString();
          await supabase.rpc("update_sla_tracking", {
            p_ticket_id: id,
            p_event_type: "resolution",
          });
        }
      }

      // Clear closed_at if reopening
      if (newStatus === "open" && existingTicket.status === "closed") {
        updateData.closed_at = null;
        updateData.resolved_at = null;
      }
    }

    // Update ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", id)
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
      .single();

    if (updateError) {
      console.error("Ticket update error:", updateError);
      return NextResponse.json(
        { message: updateError.message, success: false },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "tickets",
      p_record_id: id,
      p_action: "update",
      p_old_data: existingTicket,
      p_new_data: updatedTicket,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket update error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the ticket", success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/:id - Delete ticket
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

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

    if (!canDeleteTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to delete this ticket");
    }

    // Create audit log before deletion
    await supabase.rpc("create_audit_log", {
      p_table_name: "tickets",
      p_record_id: id,
      p_action: "delete",
      p_old_data: existingTicket,
      p_new_data: null,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    // Delete ticket (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Ticket delete error:", deleteError);
      return NextResponse.json(
        { message: deleteError.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Ticket delete error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the ticket", success: false },
      { status: 500 }
    );
  }
}