import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Admin client with service role - use only in server-side code
// This bypasses RLS policies
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to check if code is running on server
export function isServerSide(): boolean {
  return typeof window === "undefined";
}

// Safe admin client that throws if called on client
export function getAdminClient() {
  if (!isServerSide()) {
    throw new Error("Admin client can only be used on the server");
  }
  return createAdminClient();
}