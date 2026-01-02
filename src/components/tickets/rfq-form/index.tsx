"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useCreateTicket } from "@/hooks/useTicket";
import { createClient } from "@/lib/supabase/client";
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
] as const;

export function RFQForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateTicket();
  const supabase = createClient();

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

  const safeStepIndex = useMemo(() => {
    const max = STEPS.length - 1;
    if (currentStep < 0) return 0;
    if (currentStep > max) return max;
    return currentStep;
  }, [currentStep]);

  const stepMeta = STEPS[safeStepIndex] ?? STEPS[0];
  const CurrentStepComponent = stepMeta.component;

  const progress = ((safeStepIndex + 1) / STEPS.length) * 100;

  const getFieldsForStep = (step: number): (keyof RFQFormData)[] => {
    switch (step) {
      case 0:
        return ["department_id", "customer_name"];
      case 1:
        return ["service_type", "cargo_category", "cargo_description"];
      case 2:
        return [
          "origin_address",
          "origin_city",
          "origin_country",
          "destination_address",
          "destination_city",
          "destination_country",
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

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(safeStepIndex);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && safeStepIndex < STEPS.length - 1) {
      setCurrentStep(safeStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (safeStepIndex > 0) {
      setCurrentStep(safeStepIndex - 1);
    }
  };

  const uploadFiles = async (ticketId: string): Promise<any[]> => {
    const files: File[] = (window as any).__rfqFiles || [];
    if (files.length === 0) return [];

    const uploadedFiles: any[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop() || "bin";
      const fileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("attachments").upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(fileName);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        console.warn("No publicUrl returned for:", fileName);
        continue;
      }

      uploadedFiles.push({
        name: file.name,
        file_name: file.name,
        file_path: fileName,
        url: publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    return uploadedFiles;
  };

  const onSubmit = async (data: RFQFormData) => {
    setIsSubmitting(true);

    try {
      const volumePerUnit = (data.length * data.width * data.height) / 1_000_000;
      const totalVolume = volumePerUnit * (data.quantity || 0);

      const rfqData: any = {
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
        volume_per_unit: Number.isFinite(volumePerUnit) ? Number(volumePerUnit.toFixed(4)) : 0,
        total_volume: Number.isFinite(totalVolume) ? Number(totalVolume.toFixed(4)) : 0,
        fleet_requirement: data.fleet_requirement || null,
        scope_of_work: data.scope_of_work,
        additional_notes: data.additional_notes || null,
        estimated_project_date: data.estimated_project_date || null,
        attachments: [],
      };

      const result = await createMutation.mutateAsync({
        ticket_type: "RFQ",
        subject: `Rate Inquiry - ${data.customer_name}`,
        description: data.cargo_description,
        department_id: data.department_id,
        priority: "medium",
        rfq_data: rfqData,
      });

      const ticketId = (result as any)?.data?.id as string | undefined;
      if (!ticketId) {
        throw new Error("Ticket created but response missing ticket id");
      }

      const files: File[] = (window as any).__rfqFiles || [];
      if (files.length > 0) {
        toast.info("Uploading attachments...");
        const uploadedFiles = await uploadFiles(ticketId);

        if (uploadedFiles.length > 0) {
          rfqData.attachments = uploadedFiles;
          await (supabase.from("tickets") as any).update({ rfq_data: rfqData }).eq("id", ticketId);
        }
      }

      (window as any).__rfqFiles = [];

      toast.success("Rate Inquiry Submitted!");
      router.push(`/tickets/${ticketId}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Rate Inquiry (RFQ)</CardTitle>
          <span className="text-sm text-white/60">
            Step {safeStepIndex + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription className="pt-2">{stepMeta.title}</CardDescription>
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
              disabled={safeStepIndex === 0}
              className="border-white/20 hover:bg-white/10"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {safeStepIndex < STEPS.length - 1 ? (
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
