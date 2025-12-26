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
import { UNITS_OF_MEASURE, PACKAGING_TYPES } from "@/lib/constants";
import { Package, Scale, Box, Hash } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step4CargoProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step4Cargo({ formData, updateFormData, errors }: Step4CargoProps) {
  const totalWeight = formData.quantity * formData.weight_per_unit;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Cargo Specifications</h3>
        <p className="text-sm text-muted-foreground">
          Enter the quantity, weight, and packaging details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="1"
            value={formData.quantity || ""}
            onChange={(e) =>
              updateFormData({ quantity: parseInt(e.target.value) || 0 })
            }
            className={errors.quantity ? "border-destructive" : ""}
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">{errors.quantity}</p>
          )}
        </div>

        {/* Unit of Measure */}
        <div className="space-y-2">
          <Label htmlFor="unit_of_measure" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Unit of Measure <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.unit_of_measure}
            onValueChange={(value) => updateFormData({ unit_of_measure: value })}
          >
            <SelectTrigger className={errors.unit_of_measure ? "border-destructive" : ""}>
              <SelectValue placeholder="Select unit..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UNITS_OF_MEASURE).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit_of_measure && (
            <p className="text-xs text-destructive">{errors.unit_of_measure}</p>
          )}
        </div>

        {/* Weight per Unit */}
        <div className="space-y-2">
          <Label htmlFor="weight_per_unit" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Weight per Unit (kg) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="weight_per_unit"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.weight_per_unit || ""}
            onChange={(e) =>
              updateFormData({ weight_per_unit: parseFloat(e.target.value) || 0 })
            }
            className={errors.weight_per_unit ? "border-destructive" : ""}
          />
          {errors.weight_per_unit && (
            <p className="text-xs text-destructive">{errors.weight_per_unit}</p>
          )}
        </div>

        {/* Packaging Type */}
        <div className="space-y-2">
          <Label htmlFor="packaging_type" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Packaging Type
          </Label>
          <Select
            value={formData.packaging_type}
            onValueChange={(value) => updateFormData({ packaging_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select packaging..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PACKAGING_TYPES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weight with Packaging */}
        <div className="space-y-2">
          <Label htmlFor="weight_with_packaging">
            Weight with Packaging (kg)
          </Label>
          <Input
            id="weight_with_packaging"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.weight_with_packaging || ""}
            onChange={(e) =>
              updateFormData({
                weight_with_packaging: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        {/* HS Code */}
        <div className="space-y-2">
          <Label htmlFor="hs_code">HS Code</Label>
          <Input
            id="hs_code"
            placeholder="e.g., 8471.30.00"
            value={formData.hs_code}
            onChange={(e) => updateFormData({ hs_code: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Harmonized System code for customs classification
          </p>
        </div>
      </div>

      {/* Weight Summary */}
      {formData.quantity > 0 && formData.weight_per_unit > 0 && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Weight:</span>
            <span className="font-semibold text-lg">
              {totalWeight.toFixed(2)} kg
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.quantity} {formData.unit_of_measure || "units"} × {formData.weight_per_unit} kg
          </p>
        </div>
      )}
    </div>
  );
}