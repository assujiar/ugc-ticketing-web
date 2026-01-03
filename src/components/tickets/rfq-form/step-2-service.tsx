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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SERVICE_TYPES } from "@/lib/constants";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step2Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step2Service({ form }: Step2Props) {
  const { register, setValue, watch, formState: { errors } } = form;

  const serviceType = watch("service_type");
  const cargoCategory = watch("cargo_category");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Service Type *</Label>
        <Select
          value={serviceType}
          onValueChange={(value) => setValue("service_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_type && (
          <p className="text-sm text-destructive">{errors.service_type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cargo Category *</Label>
        <RadioGroup
          value={cargoCategory}
          onValueChange={(value) => setValue("cargo_category", value as "DG" | "Genco")}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="DG" id="dg" />
            <Label htmlFor="dg" className="font-normal cursor-pointer">
              Dangerous Goods (DG)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Genco" id="genco" />
            <Label htmlFor="genco" className="font-normal cursor-pointer">
              General Cargo (Genco)
            </Label>
          </div>
        </RadioGroup>
        {errors.cargo_category && (
          <p className="text-sm text-destructive">{errors.cargo_category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargo_description">Cargo Description *</Label>
        <Textarea
          id="cargo_description"
          {...register("cargo_description")}
          placeholder="Describe the cargo in detail"
          rows={4}
        />
        {errors.cargo_description && (
          <p className="text-sm text-destructive">{errors.cargo_description.message}</p>
        )}
      </div>
    </div>
  );
}
