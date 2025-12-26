"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calculateVolumes } from "@/lib/calculations";
import { Ruler, Box, Calculator } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step5DimensionsProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step5Dimensions({ formData, updateFormData, errors }: Step5DimensionsProps) {
  // Auto-calculate volumes when dimensions change
  useEffect(() => {
    if (formData.length > 0 && formData.width > 0 && formData.height > 0) {
      const { volumePerUnit, totalVolume } = calculateVolumes(
        formData.length,
        formData.width,
        formData.height,
        formData.quantity || 1
      );

      updateFormData({
        volume_per_unit: volumePerUnit,
        total_volume: totalVolume,
      });
    }
  }, [formData.length, formData.width, formData.height, formData.quantity]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Dimensions</h3>
        <p className="text-sm text-muted-foreground">
          Enter the dimensions per unit. Volume will be calculated automatically.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Length */}
        <div className="space-y-2">
          <Label htmlFor="length" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Length (cm) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="length"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="0.0"
            value={formData.length || ""}
            onChange={(e) =>
              updateFormData({ length: parseFloat(e.target.value) || 0 })
            }
            className={errors.length ? "border-destructive" : ""}
          />
          {errors.length && (
            <p className="text-xs text-destructive">{errors.length}</p>
          )}
        </div>

        {/* Width */}
        <div className="space-y-2">
          <Label htmlFor="width" className="flex items-center gap-2">
            <Ruler className="h-4 w-4 rotate-90" />
            Width (cm) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="0.0"
            value={formData.width || ""}
            onChange={(e) =>
              updateFormData({ width: parseFloat(e.target.value) || 0 })
            }
            className={errors.width ? "border-destructive" : ""}
          />
          {errors.width && (
            <p className="text-xs text-destructive">{errors.width}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Height (cm) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="0.0"
            value={formData.height || ""}
            onChange={(e) =>
              updateFormData({ height: parseFloat(e.target.value) || 0 })
            }
            className={errors.height ? "border-destructive" : ""}
          />
          {errors.height && (
            <p className="text-xs text-destructive">{errors.height}</p>
          )}
        </div>
      </div>

      {/* Volume Calculation Results */}
      {formData.length > 0 && formData.width > 0 && formData.height > 0 && (
        <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />
            <h4 className="font-medium">Auto-Calculated Volume</h4>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Volume per Unit */}
            <div className="p-4 rounded-lg bg-background">
              <div className="text-sm text-muted-foreground">Volume per Unit</div>
              <div className="text-2xl font-bold">
                {formData.volume_per_unit.toFixed(6)} <span className="text-base font-normal">CBM</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formData.length} × {formData.width} × {formData.height} cm
              </div>
            </div>

            {/* Total Volume */}
            <div className="p-4 rounded-lg bg-background">
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-2xl font-bold text-primary">
                {formData.total_volume.toFixed(6)} <span className="text-base font-normal">CBM</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formData.volume_per_unit.toFixed(6)} CBM × {formData.quantity || 1} {formData.unit_of_measure || "units"}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * CBM = Cubic Meters. Calculated by converting centimeters to meters (÷ 100).
          </p>
        </div>
      )}

      {/* Visual representation */}
      {formData.length > 0 && formData.width > 0 && formData.height > 0 && (
        <div className="flex justify-center">
          <div
            className="relative border-2 border-dashed border-primary/50 rounded"
            style={{
              width: Math.min(200, formData.length),
              height: Math.min(150, formData.height),
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              {formData.length} × {formData.width} × {formData.height} cm
            </div>
            <div
              className="absolute bottom-0 right-0 bg-primary/10 rounded"
              style={{
                width: Math.min(Math.min(200, formData.length) * 0.3, formData.width * 0.5),
                height: Math.min(Math.min(150, formData.height) * 0.3, formData.width * 0.5),
                transform: "translate(30%, 30%)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}