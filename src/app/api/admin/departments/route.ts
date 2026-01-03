import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/departments error:", error);
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
  }
}
