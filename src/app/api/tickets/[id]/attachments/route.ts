import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";
import { UPLOAD_LIMITS } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    const supabase = createAdminClient();

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

    const { data: attachments, error } = await supabase
      .from("ticket_attachments")
      .select(`*, uploader:users!ticket_attachments_uploaded_by_fkey (id, full_name)`)
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    console.error("GET /api/tickets/[id]/attachments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const supabase = createAdminClient();

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id, ticket_code")
      .eq("id", id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ message: "Ticket not found", success: false }, { status: 404 });
    }

    const canUpload =
      isSuperAdmin(profile) ||
      ticket.created_by === profile.id ||
      ticket.assigned_to === profile.id ||
      (isManager(profile) && ticket.department_id === profile.department_id);

    if (!canUpload) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided", success: false }, { status: 400 });
    }

    if (file.size > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: `File size exceeds ${UPLOAD_LIMITS.MAX_SIZE_MB}MB limit`, success: false },
        { status: 400 }
      );
    }

    const allowedTypes: readonly string[] = UPLOAD_LIMITS.ALLOWED_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "File type not allowed", success: false }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${ticket.ticket_code}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("ticket-attachments").upload(fileName, file);

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message, success: false }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("ticket-attachments").getPublicUrl(fileName);

    const { data: attachment, error } = await supabase
      .from("ticket_attachments")
      .insert({
        ticket_id: id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      })
      .select(`*, uploader:users!ticket_attachments_uploaded_by_fkey (id, full_name)`)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/[id]/attachments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json({ message: "Attachment ID is required", success: false }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: attachment, error: fetchError } = await supabase
      .from("ticket_attachments")
      .select("*")
      .eq("id", attachmentId)
      .eq("ticket_id", id)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json({ message: "Attachment not found", success: false }, { status: 404 });
    }

    if (!isSuperAdmin(profile) && attachment.uploaded_by !== user.id) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const filePath = attachment.file_url.split("/ticket-attachments/")[1];
    if (filePath) {
      await supabase.storage.from("ticket-attachments").remove([filePath]);
    }

    const { error } = await supabase.from("ticket_attachments").delete().eq("id", attachmentId);

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    console.error("DELETE /api/tickets/[id]/attachments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
