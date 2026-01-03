"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClient();

  // Check auth and clear any stale session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is logged in, redirect to dashboard
          window.location.href = "/dashboard";
          return;
        }
      } catch (error) {
        // Session might be invalid, clear it
        console.log("Clearing invalid session");
        await supabase.auth.signOut();
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      // First, ensure no stale session
      await supabase.auth.signOut();
      
      // Then login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Login failed");
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        toast.success("Login successful! Redirecting...");
        // Force full page reload
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-slate-300 mt-2">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-orange-500"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-orange-500 pr-10"
              {...register("password")}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-orange-500/25"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Having trouble signing in?{" "}
        <span className="text-orange-400 hover:text-orange-300 cursor-pointer transition-colors">
          Contact your administrator
        </span>
      </p>
    </div>
  );
}
