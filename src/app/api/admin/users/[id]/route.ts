import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { forbiddenResponse } from "@/lib/permissions";
import { validate, validationErrorResponse, updateUserSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return forbiddenResponse("Only administrators can view user details");
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, email, full_name, is_active, created_at, updated_at,
        roles ( id, name, display_name ),
        departments ( id, code, name )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
      }
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch user", success: false }, { status: 500 });
  }
}

// PATCH /api/admin/users/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return forbiddenResponse("Only administrators can update users");
    }

    const body = await request.json();
    const validation = validate(updateUserSchema, body);
    if (!validation.success) return validationErrorResponse(validation);

    const supabase = await createServerClient();

    // Get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
      }
      return NextResponse.json({ message: fetchError.message, success: false }, { status: 500 });
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(validation.data)
      .eq("id", id)
      .select(`
        id, email, full_name, is_active, created_at, updated_at,
        roles ( id, name, display_name ),
        departments ( id, code, name )
      `)
      .single();

    if (updateError) {
      return NextResponse.json({ message: updateError.message, success: false }, { status: 500 });
    }

    // Audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "users",
      p_record_id: id,
      p_action: "update",
      p_old_data: existingUser,
      p_new_data: updatedUser,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update user", success: false }, { status: 500 });
  }
}

// DELETE /api/admin/users/:id (soft delete - deactivate)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return forbiddenResponse("Only administrators can deactivate users");
    }

    if (id === profile.id) {
      return NextResponse.json({ message: "Cannot deactivate yourself", success: false }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    // Audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "users",
      p_record_id: id,
      p_action: "deactivate",
      p_old_data: existingUser,
      p_new_data: { ...existingUser, is_active: false },
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, message: "User deactivated" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to deactivate user", success: false }, { status: 500 });
  }
}