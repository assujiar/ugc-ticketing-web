"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_TYPES, CARGO_CATEGORIES } from "@/lib/constants";
import { Truck, Package, FileText } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step2ServiceProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step2Service({ formData, updateFormData, errors }: Step2ServiceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Service Information</h3>
        <p className="text-sm text-muted-foreground">
          Specify the type of service and cargo details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="service_type" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Service Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.service_type}
            onValueChange={(value) => updateFormData({ service_type: value })}
          >
            <SelectTrigger className={errors.service_type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select service type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_TYPES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service_type && (
            <p className="text-xs text-destructive">{errors.service_type}</p>
          )}
        </div>

        {/* Cargo Category */}
        <div className="space-y-2">
          <Label htmlFor="cargo_category" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cargo Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.cargo_category}
            onValueChange={(value) =>
              updateFormData({ cargo_category: value as "DG" | "Genco" })
            }
          >
            <SelectTrigger className={errors.cargo_category ? "border-destructive" : ""}>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CARGO_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cargo_category && (
            <p className="text-xs text-destructive">{errors.cargo_category}</p>
          )}
          {formData.cargo_category === "DG" && (
            <p className="text-xs text-amber-600">
              ⚠️ Dangerous Goods require special handling and documentation.
            </p>
          )}
        </div>

        {/* Cargo Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cargo_description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cargo Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cargo_description"
            placeholder="Describe the cargo (type of goods, nature, special requirements...)"
            value={formData.cargo_description}
            onChange={(e) => updateFormData({ cargo_description: e.target.value })}
            rows={4}
            className={errors.cargo_description ? "border-destructive" : ""}
          />
          {errors.cargo_description && (
            <p className="text-xs text-destructive">{errors.cargo_description}</p>
          )}
        </div>
      </div>
    </div>
  );
}