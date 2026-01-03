import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { message: "No active session", success: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { message: "An error occurred during token refresh", success: false },
      { status: 500 }
    );
  }
}