import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import {
  canViewTicket,
  canDeleteAttachment,
  forbiddenResponse,
  hasPermission,
} from "@/lib/permissions";
import { UPLOAD_LIMITS } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tickets/:id/attachments - Get attachments for a ticket
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
      return forbiddenResponse("You do not have permission to view this ticket's attachments");
    }

    // Fetch attachments
    const { data: attachments, error } = await supabase
      .from("ticket_attachments")
      .select(
        `
        id,
        ticket_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_by,
        created_at,
        uploader:users!ticket_attachments_uploaded_by_fkey (
          id,
          full_name
        )
      `
      )
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Attachments fetch error:", error);
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attachments || [],
    });
  } catch (error) {
    console.error("Attachments fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching attachments", success: false },
      { status: 500 }
    );
  }
}

// POST /api/tickets/:id/attachments - Upload attachment to a ticket
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }
    const { profile } = authResult;

    // Check upload permission
    if (!hasPermission(profile, "attachments:upload")) {
      return forbiddenResponse("You do not have permission to upload attachments");
    }

    const supabase = await createServerClient();

    // Fetch ticket to check permission
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("created_by, assigned_to, department_id, ticket_code")
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

    // Check view permission (must be able to view ticket to upload)
    const ticketContext = {
      createdBy: ticket.created_by,
      assignedTo: ticket.assigned_to,
      departmentId: ticket.department_id,
    };

    if (!canViewTicket(profile, ticketContext)) {
      return forbiddenResponse("You do not have permission to upload to this ticket");
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided", success: false },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: `File size exceeds maximum limit of ${UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "File type not allowed", success: false },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `tickets/${ticket.ticket_code}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("File upload error:", uploadError);
      return NextResponse.json(
        { message: `Upload failed: ${uploadError.message}`, success: false },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    // Create attachment record
    const { data: attachment, error: createError } = await supabase
      .from("ticket_attachments")
      .insert({
        ticket_id: id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: profile.id,
      })
      .select(
        `
        id,
        ticket_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_by,
        created_at,
        uploader:users!ticket_attachments_uploaded_by_fkey (
          id,
          full_name
        )
      `
      )
      .single();

    if (createError) {
      console.error("Attachment record creation error:", createError);
      // Try to delete uploaded file
      await supabase.storage.from("attachments").remove([filePath]);
      return NextResponse.json(
        { message: createError.message, success: false },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "ticket_attachments",
      p_record_id: attachment.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: { file_name: file.name, file_size: file.size },
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json(
      { success: true, data: attachment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Attachment upload error:", error);
    return NextResponse.json(
      { message: "An error occurred while uploading the attachment", success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/:id/attachments - Delete attachment (with attachment_id in query)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachment_id");

    if (!attachmentId) {
      return NextResponse.json(
        { message: "Attachment ID is required", success: false },
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

    // Fetch attachment
    const { data: attachment, error: fetchError } = await supabase
      .from("ticket_attachments")
      .select("*")
      .eq("id", attachmentId)
      .eq("ticket_id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Attachment not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: fetchError.message, success: false },
        { status: 500 }
      );
    }

    // Check permission
    if (!canDeleteAttachment(profile, { uploadedBy: attachment.uploaded_by })) {
      return forbiddenResponse("You do not have permission to delete this attachment");
    }

    // Extract file path from URL for storage deletion
    const urlParts = attachment.file_url.split("/attachments/");
    const filePath = urlParts[1];

    // Delete from storage
    if (filePath) {
      await supabase.storage.from("attachments").remove([filePath]);
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from("ticket_attachments")
      .delete()
      .eq("id", attachmentId);

    if (deleteError) {
      console.error("Attachment delete error:", deleteError);
      return NextResponse.json(
        { message: deleteError.message, success: false },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "ticket_attachments",
      p_record_id: attachmentId,
      p_action: "delete",
      p_old_data: attachment,
      p_new_data: null,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("Attachment delete error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the attachment", success: false },
      { status: 500 }
    );
  }
}