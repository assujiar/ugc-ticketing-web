"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import type { UserProfile } from "@/types";

interface SidebarProps {
  profile: UserProfile;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/tickets/create", label: "New Ticket", icon: Plus },
];

const adminItems = [
  { href: "/admin", label: "User Management", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isSuperAdmin = profile.roles?.name === "super_admin";

  return (
    <aside
      className={cn(
        "glass-sidebar hidden lg:block transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/20 px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="UGC"
              width={40}
              height={40}
              className="shrink-0"
            />
            {sidebarOpen && (
              <span className="text-lg font-bold text-secondary">
                UGC_Ticketing
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  !sidebarOpen && "justify-center"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Admin Section */}
          {isSuperAdmin && (
            <>
              <div className="my-4 border-t border-slate-200" />
              {sidebarOpen && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin
                </p>
              )}
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-secondary text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      !sidebarOpen && "justify-center"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Info */}
        {sidebarOpen && (
          <div className="border-t border-white/20 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-slate-900">
                  {profile.full_name}
                </p>
                <p className="text-xs text-slate-500">
                  {profile.roles?.display_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}