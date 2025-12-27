import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import type { UpdateUserRequest } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("users")
      .select(`*, roles (id, name, display_name), departments (id, code, name)`)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const body: UpdateUserRequest = await request.json();
    const supabase = await createServerClient();

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.role_id !== undefined) updateData.role_id = body.role_id;
    if (body.department_id !== undefined) updateData.department_id = body.department_id;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select(`*, roles (id, name, display_name), departments (id, code, name)`)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "users",
      p_record_id: id,
      p_action: "update",
      p_old_data: existingUser as Record<string, unknown>,
      p_new_data: updatedUser as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    if (id === user.id) {
      return NextResponse.json({ message: "Cannot deactivate your own account", success: false }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Soft delete - just deactivate
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "users",
      p_record_id: id,
      p_action: "update",
      p_old_data: null,
      p_new_data: { is_active: false },
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: updatedUser, message: "User deactivated" });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
