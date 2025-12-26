"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step3LocationProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step3Location({ formData, updateFormData, errors }: Step3LocationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Location Details</h3>
        <p className="text-sm text-muted-foreground">
          Specify the origin and destination for this shipment.
        </p>
      </div>

      {/* Origin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <h4 className="font-medium">Origin</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pl-7">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="origin_address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="origin_address"
              placeholder="Street address, building, etc."
              value={formData.origin_address}
              onChange={(e) => updateFormData({ origin_address: e.target.value })}
              className={errors.origin_address ? "border-destructive" : ""}
            />
            {errors.origin_address && (
              <p className="text-xs text-destructive">{errors.origin_address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin_city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="origin_city"
              placeholder="City"
              value={formData.origin_city}
              onChange={(e) => updateFormData({ origin_city: e.target.value })}
              className={errors.origin_city ? "border-destructive" : ""}
            />
            {errors.origin_city && (
              <p className="text-xs text-destructive">{errors.origin_city}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="origin_country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="origin_country"
              placeholder="Country"
              value={formData.origin_country}
              onChange={(e) => updateFormData({ origin_country: e.target.value })}
              className={errors.origin_country ? "border-destructive" : ""}
            />
            {errors.origin_country && (
              <p className="text-xs text-destructive">{errors.origin_country}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Destination */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Navigation className="h-5 w-5" />
          <h4 className="font-medium">Destination</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pl-7">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="destination_address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destination_address"
              placeholder="Street address, building, etc."
              value={formData.destination_address}
              onChange={(e) => updateFormData({ destination_address: e.target.value })}
              className={errors.destination_address ? "border-destructive" : ""}
            />
            {errors.destination_address && (
              <p className="text-xs text-destructive">{errors.destination_address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destination_city"
              placeholder="City"
              value={formData.destination_city}
              onChange={(e) => updateFormData({ destination_city: e.target.value })}
              className={errors.destination_city ? "border-destructive" : ""}
            />
            {errors.destination_city && (
              <p className="text-xs text-destructive">{errors.destination_city}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="destination_country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destination_country"
              placeholder="Country"
              value={formData.destination_country}
              onChange={(e) => updateFormData({ destination_country: e.target.value })}
              className={errors.destination_country ? "border-destructive" : ""}
            />
            {errors.destination_country && (
              <p className="text-xs text-destructive">{errors.destination_country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Route Preview */}
      {formData.origin_city && formData.destination_city && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {formData.origin_city}, {formData.origin_country}
            </span>
            <span className="text-muted-foreground">→</span>
            <Navigation className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {formData.destination_city}, {formData.destination_country}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}