"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Settings,
  Users,
  Building2,
  FileText,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  profile: {
    full_name: string;
    roles: { name: string; display_name: string } | null;
    departments: { code: string; name: string } | null;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "New Ticket", href: "/tickets/new", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit", icon: FileText },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.roles?.name === "super_admin";

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-1 flex-col bg-[#0a1628]/90 backdrop-blur-xl border-r border-white/10">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">UGC Ticketing</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-orange-400">
                {profile.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.full_name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile.roles?.display_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
