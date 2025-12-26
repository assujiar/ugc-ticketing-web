import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { validate, validationErrorResponse } from "@/lib/validations";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation);
    }

    const { email, password } = validation.data;

    // Sign in with Supabase
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { message: "Login failed", success: false },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        is_active,
        roles (
          name,
          display_name
        ),
        departments (
          code,
          name
        )
      `)
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // Check if user is active
    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { message: "Account is deactivated. Please contact administrator.", success: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          profile,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login", success: false },
      { status: 500 }
    );
  }
}