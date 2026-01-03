import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Re-export the singleton client
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient() as SupabaseClient<Database>;
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

export async function getCurrentUser() {
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
  if (!profile.is_active) return null;

  return { user, profile };
}
