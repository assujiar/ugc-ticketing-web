"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Truck, FileText, Calendar, MessageSquare } from "lucide-react";
import type { RFQFormData } from "./index";

interface Step6AdditionalProps {
  formData: RFQFormData;
  updateFormData: (updates: Partial<RFQFormData>) => void;
  errors: Record<string, string>;
}

export function Step6Additional({ formData, updateFormData, errors }: Step6AdditionalProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Additional Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide any additional details about the shipment.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Fleet Requirement */}
        <div className="space-y-2">
          <Label htmlFor="fleet_requirement" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fleet Requirement
          </Label>
          <Input
            id="fleet_requirement"
            placeholder="e.g., 20ft container, refrigerated truck, flatbed..."
            value={formData.fleet_requirement}
            onChange={(e) => updateFormData({ fleet_requirement: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Specify any vehicle or container requirements.
          </p>
        </div>

        {/* Scope of Work */}
        <div className="space-y-2">
          <Label htmlFor="scope_of_work" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scope of Work <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="scope_of_work"
            placeholder="Describe the scope of work, services required, special handling instructions..."
            value={formData.scope_of_work}
            onChange={(e) => updateFormData({ scope_of_work: e.target.value })}
            rows={4}
            className={errors.scope_of_work ? "border-destructive" : ""}
          />
          {errors.scope_of_work && (
            <p className="text-xs text-destructive">{errors.scope_of_work}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additional_notes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Additional Notes
          </Label>
          <Textarea
            id="additional_notes"
            placeholder="Any additional information, special requests, or notes..."
            value={formData.additional_notes}
            onChange={(e) => updateFormData({ additional_notes: e.target.value })}
            rows={3}
          />
        </div>

        {/* Estimated Project Date */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="estimated_project_date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Estimated Project Date
          </Label>
          <Input
            id="estimated_project_date"
            type="date"
            value={formData.estimated_project_date}
            onChange={(e) =>
              updateFormData({ estimated_project_date: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-muted-foreground">
            When do you expect this shipment to take place?
          </p>
        </div>
      </div>

      {/* Summary Preview */}
      <div className="p-6 rounded-lg bg-muted/50 border space-y-3">
        <h4 className="font-medium">Request Summary</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{formData.customer_name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-medium">
              {formData.origin_city && formData.destination_city
                ? `${formData.origin_city} → ${formData.destination_city}`
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo:</span>
            <span className="font-medium">
              {formData.quantity} {formData.unit_of_measure || "units"} •{" "}
              {formData.total_volume.toFixed(4)} CBM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{formData.service_type || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}