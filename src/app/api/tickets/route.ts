import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { isSuperAdmin, isManager } from "@/lib/auth";
import {
  validate,
  validationErrorResponse,
  createTicketSchema,
  ticketListParamsSchema,
} from "@/lib/validations";
import { PAGINATION } from "@/lib/constants";

// GET /api/tickets - List tickets with filtering and pagination
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
    const params = {
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || String(PAGINATION.DEFAULT_PAGE_SIZE),
      status: searchParams.get("status") || undefined,
      department: searchParams.get("department") || undefined,
      type: searchParams.get("type") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: searchParams.get("sortOrder") || "desc",
      assignedToMe: searchParams.get("assignedToMe") || undefined,
      createdByMe: searchParams.get("createdByMe") || undefined,
    };

    // Validate params
    const validation = validate(ticketListParamsSchema, params);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const {
      page,
      pageSize,
      status,
      department,
      type,
      search,
      sortBy,
      sortOrder,
      assignedToMe,
      createdByMe,
    } = validation.data;

    const supabase = await createServerClient();

    // Build query
    let query = supabase
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
      `,
        { count: "exact" }
      );

    // Apply role-based filtering (RLS handles this, but we add explicit filters for clarity)
    if (isSuperAdmin(profile)) {
      // Super admin sees all - no additional filter
    } else if (isManager(profile)) {
      // Manager sees department tickets
      if (profile.department_id) {
        query = query.eq("department_id", profile.department_id);
      }
    } else {
      // Staff sees own tickets (created or assigned)
      query = query.or(`created_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
    }

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (department && department !== "all") {
      // Get department ID from code
      const { data: deptData } = await supabase
        .from("departments")
        .select("id")
        .eq("code", department)
        .single();

      if (deptData) {
        query = query.eq("department_id", deptData.id);
      }
    }

    if (type && type !== "all") {
      query = query.eq("ticket_type", type);
    }

    if (search) {
      query = query.or(
        `ticket_code.ilike.%${search}%,subject.ilike.%${search}%`
      );
    }

    if (assignedToMe) {
      query = query.eq("assigned_to", profile.id);
    }

    if (createdByMe) {
      query = query.eq("created_by", profile.id);
    }

    // Apply sorting
    const ascending = sortOrder === "asc";
    query = query.order(sortBy, { ascending });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: tickets, error, count } = await query;

    if (error) {
      console.error("Tickets fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: tickets || [],
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Tickets list error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching tickets", success: false },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Parse and validate body
    const body = await request.json();
    const validation = validate(createTicketSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const { ticket_type, subject, description, department_id, priority, rfq_data } =
      validation.data;

    const supabase = await createServerClient();

    // Get department code for ticket code generation
    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("code")
      .eq("id", department_id)
      .single();

    if (deptError || !department) {
      return NextResponse.json(
        { message: "Invalid department", success: false },
        { status: 400 }
      );
    }

    // Use database function to create ticket with auto-generated code and SLA tracking
    const { data: ticket, error: createError } = await supabase.rpc("create_ticket", {
      p_ticket_type: ticket_type,
      p_subject: subject,
      p_description: description || null,
      p_department_id: department_id,
      p_created_by: profile.id,
      p_priority: priority || "medium",
      p_rfq_data: rfq_data || null,
    });

    if (createError) {
      console.error("Ticket creation error:", createError);
      return NextResponse.json(
        { message: createError.message, success: false },
        { status: 500 }
      );
    }

    // Fetch the created ticket with relations
    const { data: createdTicket, error: fetchError } = await supabase
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
        departments (
          id,
          code,
          name
        ),
        creator:users!tickets_created_by_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .eq("id", ticket.id)
      .single();

    if (fetchError) {
      console.error("Ticket fetch error:", fetchError);
      // Return basic ticket data if fetch fails
      return NextResponse.json(
        { success: true, data: ticket },
        { status: 201 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "tickets",
      p_record_id: createdTicket.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: createdTicket,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json(
      { success: true, data: createdTicket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ticket creation error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the ticket", success: false },
      { status: 500 }
    );
  }
}