"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Settings,
  Menu,
  LogOut,
  Users,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface MobileNavProps {
  profile: {
    full_name: string;
    roles: { name: string; display_name: string } | null;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "New Ticket", href: "/tickets/new", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ profile }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isAdmin = profile.roles?.name === "super_admin";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white">UGC Ticketing</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[#0a1628] border-r border-white/10">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center h-16 px-6 border-b border-white/10">
                <span className="font-bold text-lg text-white">Menu</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <>
                    <div className="pt-4 pb-2">
                      <p className="px-3 text-xs font-semibold text-slate-500 uppercase">Admin</p>
                    </div>
                    <Link
                      href="/admin/users"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                    >
                      <Users className="h-5 w-5" />
                      Users
                    </Link>
                    <Link
                      href="/admin/departments"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                    >
                      <Building2 className="h-5 w-5" />
                      Departments
                    </Link>
                  </>
                )}
              </nav>

              {/* User & Logout */}
              <div className="border-t border-white/10 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-400">
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{profile.full_name}</p>
                    <p className="text-xs text-slate-400">{profile.roles?.display_name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
