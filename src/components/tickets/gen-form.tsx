"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useUsers";
import { useCreateTicket } from "@/hooks/useTickets";
import { Building2, FileText, AlertTriangle, Send, RefreshCw } from "lucide-react";

interface GenFormData {
  department_id: string;
  subject: string;
  description: string;
  priority: string;
}

const initialFormData: GenFormData = {
  department_id: "",
  subject: "",
  description: "",
  priority: "medium",
};

const priorityOptions = [
  { value: "low", label: "Low", description: "No urgency, can wait" },
  { value: "medium", label: "Medium", description: "Normal priority" },
  { value: "high", label: "High", description: "Needs attention soon" },
  { value: "urgent", label: "Urgent", description: "Requires immediate action" },
];

export function GenForm() {
  const router = useRouter();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const createTicket = useCreateTicket();

  const [formData, setFormData] = useState<GenFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (updates: Partial<GenFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete clearedErrors[key];
    });
    setErrors(clearedErrors);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await createTicket.mutateAsync({
      ticket_type: "GEN",
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      department_id: formData.department_id,
      priority: formData.priority as "low" | "medium" | "high" | "urgent",
    });

    if (result?.data?.id) {
      router.push(`/tickets/${result.data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">General Request</h3>
        <p className="text-sm text-muted-foreground">
          Submit a general service request or inquiry.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Target Department <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.department_id}
            onValueChange={(value) => updateFormData({ department_id: value })}
          >
            <SelectTrigger
              className={errors.department_id ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select department..." />
            </SelectTrigger>
            <SelectContent>
              {loadingDepts ? (
                <SelectItem value="" disabled>
                  Loading...
                </SelectItem>
              ) : (
                departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.department_id && (
            <p className="text-xs text-destructive">{errors.department_id}</p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Subject <span className="text-destructive">*</span>
          </Label>
          <Input
            id="subject"
            placeholder="Brief summary of your request"
            value={formData.subject}
            onChange={(e) => updateFormData({ subject: e.target.value })}
            className={errors.subject ? "border-destructive" : ""}
            maxLength={255}
          />
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject}</p>
          )}
          <p className="text-xs text-muted-foreground text-right">
            {formData.subject.length}/255
          </p>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Priority
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => updateFormData({ priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Provide details about your request. Include any relevant information that will help the team understand and address your needs."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={6}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={createTicket.isPending} className="gap-2">
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
      </div>
    </form>
  );
}