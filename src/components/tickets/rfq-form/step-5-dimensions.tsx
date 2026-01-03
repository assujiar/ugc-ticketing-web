"use client";

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
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const length = watch("length");
  const width = watch("width");
  const height = watch("height");
  const quantity = watch("quantity");

  const l = typeof length === "number" && Number.isFinite(length) ? length : 0;
  const w = typeof width === "number" && Number.isFinite(width) ? width : 0;
  const h = typeof height === "number" && Number.isFinite(height) ? height : 0;
  const q = typeof quantity === "number" && Number.isFinite(quantity) ? quantity : 0;

  const volumePerUnit = l > 0 && w > 0 && h > 0 ? (l * w * h) / 1_000_000 : null; // CBM
  const totalVolume = volumePerUnit !== null && q > 0 ? volumePerUnit * q : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="length">Length (cm) *</Label>
          <Input id="length" type="number" step="0.1" min="0" {...register("length", { valueAsNumber: true })} placeholder="0" />
          {errors.length && <p className="text-sm text-destructive">{errors.length.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="width">Width (cm) *</Label>
          <Input id="width" type="number" step="0.1" min="0" {...register("width", { valueAsNumber: true })} placeholder="0" />
          {errors.width && <p className="text-sm text-destructive">{errors.width.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (cm) *</Label>
          <Input id="height" type="number" step="0.1" min="0" {...register("height", { valueAsNumber: true })} placeholder="0" />
          {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
        </div>
      </div>

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
                  {volumePerUnit !== null ? `${volumePerUnit.toFixed(4)} CBM` : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
              <Box className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-lg font-semibold text-primary">
                  {totalVolume !== null ? `${totalVolume.toFixed(4)} CBM` : "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
