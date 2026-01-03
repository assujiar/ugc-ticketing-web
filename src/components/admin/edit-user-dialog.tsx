"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdateUser } from "@/hooks/useAdmin";
import { useRoles, useDepartments } from "@/hooks/useDashboard";
import { updateUserSchema, type UpdateUserFormData } from "@/types/forms";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "@/types";

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NO_DEPARTMENT = "__none__";

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const updateMutation = useUpdateUser(user?.id || "");
  const { data: roles } = useRoles();
  const { data: departments } = useDepartments();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const roleId = watch("role_id");
  const departmentId = watch("department_id");
  const isActive = watch("is_active");

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        role_id: user.role_id,
        department_id: user.department_id ?? undefined,
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success("User updated", { description: "The user has been updated successfully" });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Error", { description: error.message });
      },
    });
  };

  const handleDepartmentChange = (value: string) => {
    if (value === NO_DEPARTMENT) {
      setValue("department_id", null as any);
    } else {
      setValue("department_id", value);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              className="bg-white/5 border-white/20"
            />
            {errors.full_name && (
              <p className="text-sm text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleId || ""} onValueChange={(value) => setValue("role_id", value)}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId || NO_DEPARTMENT}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value={NO_DEPARTMENT}>No Department</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked: boolean) => setValue("is_active", checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
