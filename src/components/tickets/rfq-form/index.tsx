"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { Step1Basic } from "./step-1-basic";
import { Step2Service } from "./step-2-service";
import { Step3Location } from "./step-3-location";
import { Step4Cargo } from "./step-4-cargo";
import { Step5Dimensions } from "./step-5-dimensions";
import { Step6Additional } from "./step-6-additional";
import { useCreateTicket } from "@/hooks/useTickets";
import { ChevronLeft, ChevronRight, Send, RefreshCw } from "lucide-react";
import type { RFQData } from "@/types";

const TOTAL_STEPS = 6;

const stepTitles = [
  "Basic Information",
  "Service Details",
  "Location",
  "Cargo Specs",
  "Dimensions",
  "Additional Info",
];

export interface RFQFormData {
  // Step 1: Basic
  department_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  // Step 2: Service
  service_type: string;
  cargo_category: "DG" | "Genco" | "";
  cargo_description: string;

  // Step 3: Location
  origin_address: string;
  origin_city: string;
  origin_country: string;
  destination_address: string;
  destination_city: string;
  destination_country: string;

  // Step 4: Cargo
  quantity: number;
  unit_of_measure: string;
  weight_per_unit: number;
  packaging_type: string;
  weight_with_packaging: number;
  hs_code: string;

  // Step 5: Dimensions
  length: number;
  width: number;
  height: number;
  volume_per_unit: number;
  total_volume: number;

  // Step 6: Additional
  fleet_requirement: string;
  scope_of_work: string;
  additional_notes: string;
  estimated_project_date: string;
}

const initialFormData: RFQFormData = {
  department_id: "",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  service_type: "",
  cargo_category: "",
  cargo_description: "",
  origin_address: "",
  origin_city: "",
  origin_country: "",
  destination_address: "",
  destination_city: "",
  destination_country: "",
  quantity: 1,
  unit_of_measure: "",
  weight_per_unit: 0,
  packaging_type: "",
  weight_with_packaging: 0,
  hs_code: "",
  length: 0,
  width: 0,
  height: 0,
  volume_per_unit: 0,
  total_volume: 0,
  fleet_requirement: "",
  scope_of_work: "",
  additional_notes: "",
  estimated_project_date: "",
};

export function RFQForm() {
  const router = useRouter();
  const createTicket = useCreateTicket();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RFQFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (updates: Partial<RFQFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete clearedErrors[key];
    });
    setErrors(clearedErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.department_id) newErrors.department_id = "Department is required";
        if (!formData.customer_name) newErrors.customer_name = "Customer name is required";
        break;

      case 2:
        if (!formData.service_type) newErrors.service_type = "Service type is required";
        if (!formData.cargo_category) newErrors.cargo_category = "Cargo category is required";
        if (!formData.cargo_description) newErrors.cargo_description = "Cargo description is required";
        break;

      case 3:
        if (!formData.origin_address) newErrors.origin_address = "Origin address is required";
        if (!formData.origin_city) newErrors.origin_city = "Origin city is required";
        if (!formData.origin_country) newErrors.origin_country = "Origin country is required";
        if (!formData.destination_address) newErrors.destination_address = "Destination address is required";
        if (!formData.destination_city) newErrors.destination_city = "Destination city is required";
        if (!formData.destination_country) newErrors.destination_country = "Destination country is required";
        break;

      case 4:
        if (!formData.quantity || formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";
        if (!formData.unit_of_measure) newErrors.unit_of_measure = "Unit of measure is required";
        if (!formData.weight_per_unit || formData.weight_per_unit <= 0) newErrors.weight_per_unit = "Weight is required";
        break;

      case 5:
        if (!formData.length || formData.length <= 0) newErrors.length = "Length is required";
        if (!formData.width || formData.width <= 0) newErrors.width = "Width is required";
        if (!formData.height || formData.height <= 0) newErrors.height = "Height is required";
        break;

      case 6:
        if (!formData.scope_of_work) newErrors.scope_of_work = "Scope of work is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Build RFQ data
    const rfqData: RFQData = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || undefined,
      customer_phone: formData.customer_phone || undefined,
      service_type: formData.service_type,
      cargo_category: formData.cargo_category as "DG" | "Genco",
      cargo_description: formData.cargo_description,
      origin_address: formData.origin_address,
      origin_city: formData.origin_city,
      origin_country: formData.origin_country,
      destination_address: formData.destination_address,
      destination_city: formData.destination_city,
      destination_country: formData.destination_country,
      quantity: formData.quantity,
      unit_of_measure: formData.unit_of_measure,
      weight_per_unit: formData.weight_per_unit,
      packaging_type: formData.packaging_type || undefined,
      weight_with_packaging: formData.weight_with_packaging || undefined,
      hs_code: formData.hs_code || undefined,
      length: formData.length,
      width: formData.width,
      height: formData.height,
      volume_per_unit: formData.volume_per_unit,
      total_volume: formData.total_volume,
      fleet_requirement: formData.fleet_requirement || undefined,
      scope_of_work: formData.scope_of_work,
      additional_notes: formData.additional_notes || undefined,
      estimated_project_date: formData.estimated_project_date || undefined,
    };

    // Build subject from RFQ data
    const subject = `RFQ: ${formData.customer_name} - ${formData.origin_city} to ${formData.destination_city}`;

    const result = await createTicket.mutateAsync({
      ticket_type: "RFQ",
      subject,
      description: formData.scope_of_work,
      department_id: formData.department_id,
      priority: "medium",
      rfq_data: rfqData,
    });

    if (result?.data?.id) {
      router.push(`/tickets/${result.data.id}`);
    }
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      errors,
    };

    switch (currentStep) {
      case 1:
        return <Step1Basic {...stepProps} />;
      case 2:
        return <Step2Service {...stepProps} />;
      case 3:
        return <Step3Location {...stepProps} />;
      case 4:
        return <Step4Cargo {...stepProps} />;
      case 5:
        return <Step5Dimensions {...stepProps} />;
      case 6:
        return <Step6Additional {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepTitles={stepTitles}
      />

      {/* Step content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {TOTAL_STEPS}
        </span>

        {currentStep < TOTAL_STEPS ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createTicket.isPending}
            className="gap-2"
          >
            {createTicket.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}