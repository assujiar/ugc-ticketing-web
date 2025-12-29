import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import type { CreateUserRequest } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from("users")
      .select(`*, roles (id, name, display_name), departments (id, code, name)`)
      .order("created_at", { ascending: false });

    const department = searchParams.get("department");
    const role = searchParams.get("role");
    const active = searchParams.get("active");

    if (department && department !== "all") query = query.eq("department_id", department);
    if (role && role !== "all") query = query.eq("role_id", role);
    if (active !== null && active !== "all") query = query.eq("is_active", active === "true");

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { user, profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const body: CreateUserRequest = await request.json();

    if (!body.email || !body.password || !body.full_name || !body.role_id) {
      return NextResponse.json({ message: "Missing required fields", success: false }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ message: authError.message, success: false }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: body.email,
        full_name: body.full_name,
        role_id: body.role_id,
        department_id: body.department_id || null,
        is_active: true,
      })
      .select(`*, roles (id, name, display_name), departments (id, code, name)`)
      .single();

    if (userError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ message: userError.message, success: false }, { status: 500 });
    }

    await supabase.rpc("log_audit", {
      p_table_name: "users",
      p_record_id: newUser.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: newUser as Record<string, unknown>,
      p_user_id: user.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
