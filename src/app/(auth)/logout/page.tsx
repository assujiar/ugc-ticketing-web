"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    };

    handleLogout();
  }, [router, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <LoadingSpinner size="lg" />
      <p className="text-slate-600">Signing out...</p>
    </div>
  );
}