import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("id, email, full_name, department_id, role_id, is_active, roles(id, name, display_name), departments(id, code, name)")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ success: false, message: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
