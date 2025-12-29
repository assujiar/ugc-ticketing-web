"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import type { UserProfile } from "@/types";

interface UserMenuProps {
  profile: UserProfile;
}

export function UserMenu({ profile }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log("Starting logout...");
    
    try {
      // Call API to logout server-side
      const res = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      console.log("Logout response:", res.status);
      
      if (res.ok) {
        toast.success("Logged out successfully");
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
        // Force full page reload to login
        window.location.replace("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout, redirecting anyway...");
      // Force redirect anyway
      window.location.replace("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-orange-500 text-white">
            {getInitials(profile.full_name || "User")}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-white">
            {profile.full_name}
          </p>
          <p className="text-xs text-white/60">
            {profile.departments?.name || profile.roles?.display_name || "User"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-white/60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium text-white">{profile.full_name}</span>
            <span className="text-xs text-white/60">{profile.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
