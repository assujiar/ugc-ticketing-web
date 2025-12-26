"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Save } from "lucide-react";

export function ProfileForm() {
  const { profile, refreshProfile } = useCurrentUser();
  const { toast } = useToast();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: fullName })
        .eq("id", profile?.id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Input value={profile?.roles?.display_name || ""} disabled className="bg-muted" />
      </div>

      <div className="space-y-2">
        <Label>Department</Label>
        <Input value={profile?.departments?.name || "N/A"} disabled className="bg-muted" />
      </div>

      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
      </Button>
    </form>
  );
}