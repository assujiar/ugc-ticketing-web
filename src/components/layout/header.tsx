"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  profile: {
    full_name: string;
    email: string;
    roles: { display_name: string } | null;
  };
}

export function Header({ profile }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call server-side logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    
    // Clear any local storage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Force full page reload to login
    window.location.replace("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Welcome Message */}
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-white">
            Welcome back, {profile.full_name?.split(" ")[0]}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-slate-300 hover:text-white hover:bg-white/10">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-400">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:inline-block text-white">
                  {profile.full_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1a2942] border-white/10 text-white">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profile.full_name}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {profile.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => window.location.href = "/settings"}
                className="hover:bg-white/10 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.location.href = "/settings"}
                className="hover:bg-white/10 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
