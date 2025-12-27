import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import type { CreateQuoteRequest, UpdateQuoteRequest } from "@/types/api";

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

    const { data: quotes, error } = await supabase
      .from("rate_quotes")
      .select(`*, creator:users!rate_quotes_created_by_fkey (id, full_name)`)
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: quotes });
  } catch (error) {
    console.error("GET /api/tickets/[id]/quotes error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    // Only managers can create quotes
    if (!isSuperAdmin(profile) && !isManager(profile)) {
      return NextResponse.json({ message: "Not authorized to create quotes", success: false }, { status: 403 });
    }

    const body: CreateQuoteRequest = await request.json();
    const supabase = await createServerClient();

    // Check ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("ticket_type, department_id")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    if (ticket.ticket_type !== "RFQ") {
      return NextResponse.json({ message: "Quotes can only be created for RFQ tickets", success: false }, { status: 400 });
    }

    // Generate quote number
    const { data: quoteNumber } = await supabase.rpc("generate_quote_number", { p_ticket_id: id });

    const { data: quote, error } = await supabase
      .from("rate_quotes")
      .insert({
        ticket_id: id,
        quote_number: quoteNumber as string,
        amount: body.amount,
        currency: body.currency || "USD",
        valid_until: body.valid_until,
        terms: body.terms || null,
        status: "draft",
        created_by: user.id,
      })
      .select(`*, creator:users!rate_quotes_created_by_fkey (id, full_name)`)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "rate_quotes",
      p_record_id: quote.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: quote as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/[id]/quotes error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quoteId");

    if (!quoteId) {
      return NextResponse.json({ message: "Quote ID is required", success: false }, { status: 400 });
    }

    const body: UpdateQuoteRequest = await request.json();
    const supabase = await createServerClient();

    // Get existing quote
    const { data: existingQuote, error: fetchError } = await supabase
      .from("rate_quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("ticket_id", id)
      .single();

    if (fetchError || !existingQuote) {
      return NextResponse.json({ message: "Quote not found", success: false }, { status: 404 });
    }

    // Only creator or super admin can update
    if (!isSuperAdmin(profile) && existingQuote.created_by !== user.id) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status) updateData.status = body.status;
    if (body.amount) updateData.amount = body.amount;
    if (body.currency) updateData.currency = body.currency;
    if (body.valid_until) updateData.valid_until = body.valid_until;
    if (body.terms !== undefined) updateData.terms = body.terms;

    const { data: updatedQuote, error } = await supabase
      .from("rate_quotes")
      .update(updateData)
      .eq("id", quoteId)
      .select(`*, creator:users!rate_quotes_created_by_fkey (id, full_name)`)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "rate_quotes",
      p_record_id: quoteId,
      p_action: "update",
      p_old_data: existingQuote as Record<string, unknown>,
      p_new_data: updatedQuote as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: updatedQuote });
  } catch (error) {
    console.error("PATCH /api/tickets/[id]/quotes error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
