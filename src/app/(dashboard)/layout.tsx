import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  department_id: string | null;
  is_active: boolean;
  roles: {
    id: string;
    name: string;
    display_name: string;
  } | null;
  departments: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      role_id,
      department_id,
      is_active,
      roles (
        id,
        name,
        display_name
      ),
      departments (
        id,
        code,
        name
      )
    `)
    .eq("id", session.user.id)
    .single();

  const profile = data as UserProfile | null;

  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0d1a2d]">
      {/* Desktop Sidebar */}
      <Sidebar profile={profile} />

      {/* Mobile Navigation */}
      <MobileNav profile={profile} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header profile={profile} />
        <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-24">{children}</main>
      </div>
    </div>
  );
}
