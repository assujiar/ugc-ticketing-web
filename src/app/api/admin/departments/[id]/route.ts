import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/departments/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;
    const { profile } = authResult;

    if (!isSuperAdmin(profile)) {
      return NextResponse.json({ message: "Access denied", success: false }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerClient();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.default_sla_hours !== undefined) updateData.default_sla_hours = body.default_sla_hours;

    const { data, error } = await supabase
      .from("departments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/admin/departments/[id] error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
