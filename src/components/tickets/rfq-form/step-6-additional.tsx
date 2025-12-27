"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { RFQFormData } from "@/types/forms";

interface Step6Props {
  form: UseFormReturn<RFQFormData>;
}

export function Step6Additional({ form }: Step6Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fleet_requirement">Fleet Requirement</Label>
        <Input
          id="fleet_requirement"
          {...register("fleet_requirement")}
          placeholder="e.g., 40ft container, refrigerated truck"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope_of_work">Scope of Work *</Label>
        <Textarea
          id="scope_of_work"
          {...register("scope_of_work")}
          placeholder="Describe the required services in detail"
          rows={4}
        />
        {errors.scope_of_work && (
          <p className="text-sm text-destructive">{errors.scope_of_work.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional Notes</Label>
        <Textarea
          id="additional_notes"
          {...register("additional_notes")}
          placeholder="Any other information or special requirements"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_project_date">Estimated Project Date</Label>
        <Input
          id="estimated_project_date"
          type="date"
          {...register("estimated_project_date")}
        />
      </div>
    </div>
  );
}
