import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import {
  canViewTicket,
  canCreateQuote,
  forbiddenResponse,
  hasPermission,
} from "@/lib/permissions";
import { validate, validationErrorResponse, createQuoteSchema, updateQuoteSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tickets/:id/quotes - Get quotes for a ticket
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Check quote view permission
    if (!hasPermission(profile, "quotes:view")) {
      return forbiddenResponse("You do not have permission to view quotes");
    }

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
      return forbiddenResponse("You do not have permission to view this ticket's quotes");
    }

    // Fetch quotes
    const { data: quotes, error } = await supabase
      .from("rate_quotes")
      .select(
        `
        id,
        ticket_id,
        quote_number,
        amount,
        currency,
        valid_until,
        terms,
        status,
        created_by,
        created_at,
        updated_at,
        creator:users!rate_quotes_created_by_fkey (
          id,
          full_name
        )
      `
      )
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Quotes fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotes || [],
    });
  } catch (error) {
    console.error("Quotes fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching quotes", success: false },
      { status: 500 }
    );
  }
}

// POST /api/tickets/:id/quotes - Create a quote for a ticket
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
    const validation = validate(createQuoteSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const { amount, currency, valid_until, terms } = validation.data;

    const supabase = await createServerClient();

    // Fetch ticket to check permission
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id, ticket_type")
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

    // Check create quote permission
    const ticketContext = {
      createdBy: ticket.created_by,
      assignedTo: ticket.assigned_to,
      departmentId: ticket.department_id,
    };

    if (!canCreateQuote(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to create quotes for this ticket");
    }

    // Verify ticket is RFQ type (quotes are for rate inquiries)
    if (ticket.ticket_type !== "RFQ") {
      return NextResponse.json(
        { message: "Quotes can only be created for Rate Inquiry (RFQ) tickets", success: false },
        { status: 400 }
      );
    }

    // Generate quote number
    const { data: quoteNumber, error: quoteNumError } = await supabase.rpc(
      "generate_quote_number",
      { p_ticket_id: id }
    );

    if (quoteNumError) {
      console.error("Quote number generation error:", quoteNumError);
      return NextResponse.json(
        { message: "Failed to generate quote number", success: false },
        { status: 500 }
      );
    }

    // Create quote
    const { data: quote, error: createError } = await supabase
      .from("rate_quotes")
      .insert({
        ticket_id: id,
        quote_number: quoteNumber,
        amount,
        currency: currency || "USD",
        valid_until,
        terms: terms || null,
        status: "draft",
        created_by: profile.id,
      })
      .select(
        `
        id,
        ticket_id,
        quote_number,
        amount,
        currency,
        valid_until,
        terms,
        status,
        created_by,
        created_at,
        updated_at,
        creator:users!rate_quotes_created_by_fkey (
          id,
          full_name
        )
      `
      )
      .single();

    if (createError) {
      console.error("Quote creation error:", createError);
      return NextResponse.json(
        { message: createError.message, success: false },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "rate_quotes",
      p_record_id: quote.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: quote,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json(
      { success: true, data: quote },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quote creation error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the quote", success: false },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/:id/quotes - Update a quote (with quote_id in query)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quote_id");

    if (!quoteId) {
      return NextResponse.json(
        { message: "Quote ID is required", success: false },
        { status: 400 }
      );
    }

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Parse and validate body
    const body = await request.json();
    const validation = validate(updateQuoteSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const supabase = await createServerClient();

    // Fetch existing quote
    const { data: existingQuote, error: fetchError } = await supabase
      .from("rate_quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("ticket_id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Quote not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: fetchError.message, success: false },
        { status: 500 }
      );
    }

    // Check permission (creator or super admin can update)
    const isSuperAdmin = profile.roles?.name === "super_admin";
    const isCreator = existingQuote.created_by === profile.id;

    if (!isSuperAdmin && !isCreator) {
      return forbiddenResponse("You do not have permission to update this quote");
    }

    // Update quote
    const { data: updatedQuote, error: updateError } = await supabase
      .from("rate_quotes")
      .update(validation.data)
      .eq("id", quoteId)
      .select(
        `
        id,
        ticket_id,
        quote_number,
        amount,
        currency,
        valid_until,
        terms,
        status,
        created_by,
        created_at,
        updated_at,
        creator:users!rate_quotes_created_by_fkey (
          id,
          full_name
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Quote update error:", updateError);
      return NextResponse.json(
        { message: updateError.message, success: false },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "rate_quotes",
      p_record_id: quoteId,
      p_action: "update",
      p_old_data: existingQuote,
      p_new_data: updatedQuote,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({
      success: true,
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Quote update error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the quote", success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/:id/quotes - Delete a quote (with quote_id in query)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quote_id");

    if (!quoteId) {
      return NextResponse.json(
        { message: "Quote ID is required", success: false },
        { status: 400 }
      );
    }

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    const supabase = await createServerClient();

    // Fetch existing quote
    const { data: existingQuote, error: fetchError } = await supabase
      .from("rate_quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("ticket_id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Quote not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: fetchError.message, success: false },
        { status: 500 }
      );
    }

    // Check permission (creator or super admin can delete)
    const isSuperAdmin = profile.roles?.name === "super_admin";
    const isCreator = existingQuote.created_by === profile.id;

    if (!isSuperAdmin && !isCreator) {
      return forbiddenResponse("You do not have permission to delete this quote");
    }

    // Create audit log before deletion
    await supabase.rpc("create_audit_log", {
      p_table_name: "rate_quotes",
      p_record_id: quoteId,
      p_action: "delete",
      p_old_data: existingQuote,
      p_new_data: null,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    // Delete quote
    const { error: deleteError } = await supabase
      .from("rate_quotes")
      .delete()
      .eq("id", quoteId);

    if (deleteError) {
      console.error("Quote delete error:", deleteError);
      return NextResponse.json(
        { message: deleteError.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error) {
    console.error("Quote delete error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the quote", success: false },
      { status: 500 }
    );
  }
}