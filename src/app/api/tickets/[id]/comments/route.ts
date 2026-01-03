import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ticket_comments")
      .select(`
        *,
        user:users!ticket_comments_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { user, profile } = authResult;
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: ticket } = await supabase
      .from("tickets")
      .select("created_by, department_id, status, ticket_type")
      .eq("id", id)
      .single();

    const isCreator = ticket?.created_by === user.id;
    const isDeptResponding = profile.department_id === ticket?.department_id;
    const isRFQ = ticket?.ticket_type === "RFQ";

    // Insert comment with type and metadata
    const { data: comment, error: commentError } = await supabase
      .from("ticket_comments")
      .insert({
        ticket_id: id,
        user_id: user.id,
        content: body.content || null,
        is_internal: body.is_internal || false,
        type: body.type || "comment",
        metadata: body.metadata || null,
      } as any)
      .select(`
        *,
        user:users!ticket_comments_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (commentError) {
      console.error("Comment insert error:", commentError);
      return NextResponse.json({ success: false, message: commentError.message }, { status: 500 });
    }

    // Determine new status based on type or who responded
    let newStatus = ticket?.status || "open";
    
    if (body.type === "status_change") {
      // Don't change status - handled by ticket PATCH
    } else if (body.type === "waiting_customer") {
      newStatus = "waiting_customer";
    } else if (body.type === "need_adjustment") {
      newStatus = "need_adjustment";
    } else if (isDeptResponding && !isCreator) {
      newStatus = "need_response";
    } else if (isCreator) {
      newStatus = isRFQ ? "open" : "in_progress";
    }

    // Update ticket status if not a status_change
    if (body.type !== "status_change") {
      await supabase
        .from("tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
    }

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/[id]/comments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
