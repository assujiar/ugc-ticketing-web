"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  );
}

type GlobalWithSupabase = typeof globalThis & {
  __ugc_supabase__?: SupabaseClient;
};

export function createClient(): SupabaseClient {
  const g = globalThis as GlobalWithSupabase;

  if (g.__ugc_supabase__) return g.__ugc_supabase__;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  g.__ugc_supabase__ = createBrowserClient(url, key);
  return g.__ugc_supabase__;
}