"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  isSuperAdmin: boolean;
  onNavigate?: () => void;
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

export function NavLinks({ isSuperAdmin, onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-white shadow-lg"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {isSuperAdmin && (
        <>
          <div className="my-4 border-t border-slate-200" />
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Admin
          </p>
          {adminItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-secondary text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}