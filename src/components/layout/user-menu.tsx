"use client";

import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface UserMenuProps {
  profile: UserProfile;
}

export function UserMenu({ profile }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-white">
            {getInitials(profile.full_name || "User")}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-slate-900">
            {profile.full_name}
          </p>
          <p className="text-xs text-slate-500">
            {profile.departments?.name || "No Department"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-dropdown">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{profile.full_name}</span>
            <span className="text-xs text-slate-500">{profile.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/logout"
            className="flex items-center gap-2 text-accent focus:text-accent"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}