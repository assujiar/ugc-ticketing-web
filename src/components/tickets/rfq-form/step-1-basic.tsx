"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useUsers";
import { Building2, User, Mail, Phone } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step1BasicProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step1Basic({ formData, updateFormData, errors }: Step1BasicProps) {
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the target department and customer details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Target Department */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Target Department <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.department_id}
            onValueChange={(value) => updateFormData({ department_id: value })}
          >
            <SelectTrigger className={errors.department_id ? "border-destructive" : ""}>
              <SelectValue placeholder="Select department..." />
            </SelectTrigger>
            <SelectContent>
              {loadingDepts ? (
                <SelectItem value="" disabled>
                  Loading...
                </SelectItem>
              ) : (
                departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.department_id && (
            <p className="text-xs text-destructive">{errors.department_id}</p>
          )}
        </div>

        {/* Customer Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer_name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customer_name"
            placeholder="Enter customer or company name"
            value={formData.customer_name}
            onChange={(e) => updateFormData({ customer_name: e.target.value })}
            className={errors.customer_name ? "border-destructive" : ""}
          />
          {errors.customer_name && (
            <p className="text-xs text-destructive">{errors.customer_name}</p>
          )}
        </div>

        {/* Customer Email */}
        <div className="space-y-2">
          <Label htmlFor="customer_email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Customer Email
          </Label>
          <Input
            id="customer_email"
            type="email"
            placeholder="email@example.com"
            value={formData.customer_email}
            onChange={(e) => updateFormData({ customer_email: e.target.value })}
          />
        </div>

        {/* Customer Phone */}
        <div className="space-y-2">
          <Label htmlFor="customer_phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Customer Phone
          </Label>
          <Input
            id="customer_phone"
            type="tel"
            placeholder="+62 xxx xxxx xxxx"
            value={formData.customer_phone}
            onChange={(e) => updateFormData({ customer_phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}