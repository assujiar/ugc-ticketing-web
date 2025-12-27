"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Calculator } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step5Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step5Dimensions({ form }: Step5Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const length = watch("length");
  const width = watch("width");
  const height = watch("height");
  const quantity = watch("quantity");

  // Auto-calculate volume
  useEffect(() => {
    if (length && width && height) {
      // Convert cm to m and calculate CBM
      const volumePerUnit = (length * width * height) / 1000000;
      setValue("volume_per_unit", parseFloat(volumePerUnit.toFixed(4)));
      
      if (quantity) {
        const totalVolume = volumePerUnit * quantity;
        setValue("total_volume", parseFloat(totalVolume.toFixed(4)));
      }
    }
  }, [length, width, height, quantity, setValue]);

  const volumePerUnit = watch("volume_per_unit");
  const totalVolume = watch("total_volume");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="length">Length (cm) *</Label>
          <Input
            id="length"
            type="number"
            step="0.1"
            min="0"
            {...register("length", { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.length && (
            <p className="text-sm text-destructive">{errors.length.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="width">Width (cm) *</Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            min="0"
            {...register("width", { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.width && (
            <p className="text-sm text-destructive">{errors.width.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="0"
            {...register("height", { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.height && (
            <p className="text-sm text-destructive">{errors.height.message}</p>
          )}
        </div>
      </div>

      {/* Auto-calculated values */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" />
            Calculated Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
              <Box className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Volume per Unit</p>
                <p className="text-lg font-semibold">
                  {volumePerUnit ? `${volumePerUnit} CBM` : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
              <Box className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-lg font-semibold text-primary">
                  {totalVolume ? `${totalVolume} CBM` : "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
