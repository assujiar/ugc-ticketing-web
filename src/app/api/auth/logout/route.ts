import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const supabase = await createServerClient();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all Supabase cookies manually
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Delete Supabase auth cookies
    allCookies.forEach((cookie) => {
      if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
        cookieStore.delete(cookie.name);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Still return success to allow redirect
    return NextResponse.json({ success: true });
  }
}
