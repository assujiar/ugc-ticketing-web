"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface MobileNavProps {
  profile: UserProfile;
}

export function MobileNav({ profile }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSuperAdmin = profile.roles?.name === "super_admin";

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/20 bg-white/90 px-4 backdrop-blur-lg">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="UGC" width={32} height={32} />
          <span className="text-lg font-bold text-secondary">UGC_Ticketing</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 transform bg-white/95 backdrop-blur-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <NavLinks
            isSuperAdmin={isSuperAdmin}
            onNavigate={() => setIsOpen(false)}
          />

          {/* User Info */}
          <div className="mt-auto border-t border-slate-200 pt-4">
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
        </div>
      </div>
    </div>
  );
}