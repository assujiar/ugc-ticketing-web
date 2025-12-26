"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/user-menu";
import type { UserProfile } from "@/types";

interface HeaderProps {
  profile: UserProfile;
}

export function Header({ profile }: HeaderProps) {
  return (
    <header className="glass-header fixed right-0 top-0 z-30 flex h-16 items-center gap-4 px-4 lg:left-64 lg:px-8">
      {/* Search */}
      <div className="relative hidden flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Search tickets..."
          className="max-w-md pl-10"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User Menu */}
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}