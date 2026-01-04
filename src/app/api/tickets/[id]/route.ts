import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { notifyTicketClosed } from "@/lib/email/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        departments (id, code, name),
        creator:users!tickets_created_by_fkey (id, full_name, email),
        assignee:users!tickets_assigned_to_fkey (id, full_name, email)
      `)
      .eq("id", id)
      .single();
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Get current ticket state for comparison
    const { data: currentTicket } = await supabase
      .from("tickets")
      .select("status, close_outcome")
      .eq("id", id)
      .single();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.assigned_to) updateData.assigned_to = body.assigned_to;
    if (body.resolution) updateData.resolution = body.resolution;
    if (body.resolved_at) updateData.resolved_at = body.resolved_at;
    if (body.close_outcome) updateData.close_outcome = body.close_outcome;
    if (body.close_reason) updateData.close_reason = body.close_reason;
    if (body.status === "closed") updateData.closed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        departments (id, code, name),
        creator:users!tickets_created_by_fkey (id, full_name, email),
        assignee:users!tickets_assigned_to_fkey (id, full_name, email)
      `)
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Send notification if ticket was just closed
    if (body.status === "closed" && currentTicket?.status !== "closed") {
      const outcome = body.close_outcome || "resolved";
      notifyTicketClosed(id, outcome).catch(err => {
        console.error("Failed to send ticket closed notification:", err);
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { id } = await params;
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
