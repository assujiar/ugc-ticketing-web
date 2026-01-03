"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step3Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step3Location({ form }: Step3Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Origin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-green-600" />
            Origin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin_address">Address *</Label>
            <Input
              id="origin_address"
              {...register("origin_address")}
              placeholder="Street address"
            />
            {errors.origin_address && (
              <p className="text-sm text-destructive">{errors.origin_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin_city">City *</Label>
            <Input
              id="origin_city"
              {...register("origin_city")}
              placeholder="City"
            />
            {errors.origin_city && (
              <p className="text-sm text-destructive">{errors.origin_city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin_country">Country *</Label>
            <Input
              id="origin_country"
              {...register("origin_country")}
              placeholder="Country"
            />
            {errors.origin_country && (
              <p className="text-sm text-destructive">{errors.origin_country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-red-600" />
            Destination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination_address">Address *</Label>
            <Input
              id="destination_address"
              {...register("destination_address")}
              placeholder="Street address"
            />
            {errors.destination_address && (
              <p className="text-sm text-destructive">{errors.destination_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_city">City *</Label>
            <Input
              id="destination_city"
              {...register("destination_city")}
              placeholder="City"
            />
            {errors.destination_city && (
              <p className="text-sm text-destructive">{errors.destination_city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_country">Country *</Label>
            <Input
              id="destination_country"
              {...register("destination_country")}
              placeholder="Country"
            />
            {errors.destination_country && (
              <p className="text-sm text-destructive">{errors.destination_country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
