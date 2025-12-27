"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useCreateTicket } from "@/hooks/useTicket";
import { rfqFormSchema, type RFQFormData } from "@/types/forms";
import { Step1Basic } from "./step-1-basic";
import { Step2Service } from "./step-2-service";
import { Step3Location } from "./step-3-location";
import { Step4Cargo } from "./step-4-cargo";
import { Step5Dimensions } from "./step-5-dimensions";
import { Step6Additional } from "./step-6-additional";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";

const STEPS = [
  { title: "Basic Information", component: Step1Basic },
  { title: "Service Information", component: Step2Service },
  { title: "Location Details", component: Step3Location },
  { title: "Cargo Specifications", component: Step4Cargo },
  { title: "Dimensions", component: Step5Dimensions },
  { title: "Additional Info", component: Step6Additional },
];

export function RFQForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateTicket();

  const form = useForm<RFQFormData>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      department_id: "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      service_type: "",
      cargo_category: "Genco",
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
      weight_with_packaging: undefined,
      hs_code: "",
      length: 0,
      width: 0,
      height: 0,
      fleet_requirement: "",
      scope_of_work: "",
      additional_notes: "",
      estimated_project_date: "",
    },
    mode: "onChange",
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof RFQFormData)[] => {
    switch (step) {
      case 0:
        return ["department_id", "customer_name"];
      case 1:
        return ["service_type", "cargo_category", "cargo_description"];
      case 2:
        return [
          "origin_address", "origin_city", "origin_country",
          "destination_address", "destination_city", "destination_country",
        ];
      case 3:
        return ["quantity", "unit_of_measure", "weight_per_unit"];
      case 4:
        return ["length", "width", "height"];
      case 5:
        return ["scope_of_work"];
      default:
        return [];
    }
  };

  const onSubmit = async (data: RFQFormData) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);

    try {
      const rfqData = {
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        service_type: data.service_type,
        cargo_category: data.cargo_category,
        cargo_description: data.cargo_description,
        origin_address: data.origin_address,
        origin_city: data.origin_city,
        origin_country: data.origin_country,
        destination_address: data.destination_address,
        destination_city: data.destination_city,
        destination_country: data.destination_country,
        quantity: data.quantity,
        unit_of_measure: data.unit_of_measure,
        weight_per_unit: data.weight_per_unit,
        packaging_type: data.packaging_type || null,
        weight_with_packaging: data.weight_with_packaging || null,
        hs_code: data.hs_code || null,
        length: data.length,
        width: data.width,
        height: data.height,
        volume_per_unit: (data.length * data.width * data.height) / 1000000,
        total_volume: ((data.length * data.width * data.height) / 1000000) * data.quantity,
        fleet_requirement: data.fleet_requirement || null,
        scope_of_work: data.scope_of_work,
        additional_notes: data.additional_notes || null,
        estimated_project_date: data.estimated_project_date || null,
      };

      console.log("Sending to API:", {
        ticket_type: "RFQ",
        subject: `Rate Inquiry - ${data.customer_name}`,
        description: data.cargo_description,
        department_id: data.department_id,
        priority: "medium",
        rfq_data: rfqData,
      });

      const result = await createMutation.mutateAsync({
        ticket_type: "RFQ",
        subject: `Rate Inquiry - ${data.customer_name}`,
        description: data.cargo_description,
        department_id: data.department_id,
        priority: "medium",
        rfq_data: rfqData,
      });

      console.log("API result:", result);
      toast.success("Rate Inquiry Submitted!");
      router.push(`/tickets/${result.data.id}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  // Debug form state
  console.log("Form errors:", form.formState.errors);
  console.log("Form isValid:", form.formState.isValid);
  console.log("Current step:", currentStep);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Rate Inquiry (RFQ)</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription className="pt-2">
          {STEPS[currentStep].title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="min-h-[300px]">
            <CurrentStepComponent form={form} />
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-white/20 hover:bg-white/10"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="bg-orange-500 hover:bg-orange-600">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting || createMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting || createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Inquiry
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
