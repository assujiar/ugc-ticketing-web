import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { forbiddenResponse } from "@/lib/permissions";
import { validate, validationErrorResponse, createUserSchema } from "@/lib/validations";

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return forbiddenResponse("Only administrators can access user management");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const search = searchParams.get("search") || "";

    const supabase = await createServerClient();

    let query = supabase
      .from("users")
      .select(
        `
        id, email, full_name, is_active, created_at, updated_at,
        roles ( id, name, display_name ),
        departments ( id, code, name )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch users", success: false }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return forbiddenResponse("Only administrators can create users");
    }

    const body = await request.json();
    const validation = validate(createUserSchema, body);
    if (!validation.success) return validationErrorResponse(validation);

    const { email, password, full_name, role_id, department_id } = validation.data;

    const supabase = await createServerClient();

    // Create auth user via Supabase Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ message: authError.message, success: false }, { status: 400 });
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({
        full_name,
        role_id,
        department_id: department_id || null,
        is_active: true,
      })
      .eq("id", authData.user.id)
      .select(`
        id, email, full_name, is_active, created_at,
        roles ( id, name, display_name ),
        departments ( id, code, name )
      `)
      .single();

    if (userError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ message: userError.message, success: false }, { status: 500 });
    }

    // Audit log
    await supabase.rpc("create_audit_log", {
      p_table_name: "users",
      p_record_id: userData.id,
      p_action: "create",
      p_old_data: null,
      p_new_data: userData,
      p_user_id: profile.id,
      p_ip_address: request.headers.get("x-forwarded-for") || null,
    });

    return NextResponse.json({ success: true, data: userData }, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json({ message: "Failed to create user", success: false }, { status: 500 });
  }
}