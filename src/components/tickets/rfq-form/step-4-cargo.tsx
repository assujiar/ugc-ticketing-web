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
import { UNITS_OF_MEASURE, PACKAGING_TYPES } from "@/lib/constants";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step4Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step4Cargo({ form }: Step4Props) {
  const { register, setValue, watch, formState: { errors } } = form;

  const unitOfMeasure = watch("unit_of_measure");
  const packagingType = watch("packaging_type");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Unit of Measure *</Label>
          <Select
            value={unitOfMeasure}
            onValueChange={(value) => setValue("unit_of_measure", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS_OF_MEASURE.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit_of_measure && (
            <p className="text-sm text-destructive">{errors.unit_of_measure.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight_per_unit">Weight per Unit (kg) *</Label>
          <Input
            id="weight_per_unit"
            type="number"
            step="0.01"
            min="0"
            {...register("weight_per_unit", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.weight_per_unit && (
            <p className="text-sm text-destructive">{errors.weight_per_unit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Packaging Type</Label>
          <Select
            value={packagingType || ""}
            onValueChange={(value) => setValue("packaging_type", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select packaging (optional)" />
            </SelectTrigger>
            <SelectContent>
              {PACKAGING_TYPES.map((pkg) => (
                <SelectItem key={pkg.value} value={pkg.value}>
                  {pkg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight_with_packaging">Weight with Packaging (kg)</Label>
          <Input
            id="weight_with_packaging"
            type="number"
            step="0.01"
            min="0"
            {...register("weight_with_packaging", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hs_code">HS Code</Label>
          <Input
            id="hs_code"
            {...register("hs_code")}
            placeholder="e.g., 8471.30"
          />
        </div>
      </div>
    </div>
  );
}
