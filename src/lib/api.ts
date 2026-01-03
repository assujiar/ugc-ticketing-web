import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, UserProfileComplete } from "@/types/database";

export function createClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createSupabaseClient<Database>(url, anon);
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as T;
}

export async function getCurrentUser(): Promise<{ user: unknown; profile: UserProfileComplete } | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(
      `
      *,
      roles (id, name, display_name),
      departments (id, code, name)
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  const typedProfile = profile as unknown as UserProfileComplete;
  if (!typedProfile.is_active) return null;

  return { user, profile: typedProfile };
}
