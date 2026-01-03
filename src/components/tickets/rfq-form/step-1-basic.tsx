"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step1Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step1Basic({ form }: Step1Props) {
  const { register, setValue, watch, formState: { errors } } = form;
  const { data: departments, isLoading, error } = useDepartments();

  const departmentId = watch("department_id");

  // Debug log
  console.log("Departments data:", departments);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="department_id">Target Department *</Label>
        <Select
          value={departmentId}
          onValueChange={(value) => setValue("department_id", value)}
        >
          <SelectTrigger>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading departments...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select department" />
            )}
          </SelectTrigger>
          <SelectContent>
            {error ? (
              <div className="p-2 text-sm text-red-500">
                Error loading departments: {error.message}
              </div>
            ) : departments && departments.length > 0 ? (
              departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                No departments available
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.department_id && (
          <p className="text-sm text-destructive">{errors.department_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_name">Customer Name *</Label>
        <Input
          id="customer_name"
          {...register("customer_name")}
          placeholder="Enter customer name"
        />
        {errors.customer_name && (
          <p className="text-sm text-destructive">{errors.customer_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_email">Customer Email</Label>
        <Input
          id="customer_email"
          type="email"
          {...register("customer_email")}
          placeholder="customer@example.com"
        />
        {errors.customer_email && (
          <p className="text-sm text-destructive">{errors.customer_email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_phone">Customer Phone</Label>
        <Input
          id="customer_phone"
          {...register("customer_phone")}
          placeholder="+62 xxx xxxx xxxx"
        />
        {errors.customer_phone && (
          <p className="text-sm text-destructive">{errors.customer_phone.message}</p>
        )}
      </div>
    </div>
  );
}
