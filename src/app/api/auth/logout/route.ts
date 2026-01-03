import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    
    const response = NextResponse.json({ success: true });
    
    // Clear auth cookies
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
