"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateTicket } from "@/hooks/useTicket";
import { useDepartments } from "@/hooks/useDashboard";
import { genTicketSchema, type GenTicketFormData } from "@/types/forms";
import { TICKET_PRIORITY } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function GenForm() {
  const router = useRouter();
  const createMutation = useCreateTicket();
  const { data: departments } = useDepartments();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenTicketFormData>({
    resolver: zodResolver(genTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      department_id: "",
      priority: "medium",
    },
  });

  const departmentId = watch("department_id");
  const priority = watch("priority");

  const onSubmit = async (data: GenTicketFormData) => {
    createMutation.mutate(
      {
        ticket_type: "GEN",
        subject: data.subject,
        description: data.description || null,
        department_id: data.department_id,
        priority: data.priority,
      },
      {
        onSuccess: (result) => {
          toast.success("Ticket created", { description: "Your general request has been submitted"  });
          router.push(`/tickets/${result.data.id}`);
        },
        onError: (error) => {
          toast.error("Error", { description: error.message });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Request</CardTitle>
        <CardDescription>
          Submit a general service request to the appropriate department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="department_id">Department *</Label>
            <Select value={departmentId} onValueChange={(value) => setValue("department_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department_id && (
              <p className="text-sm text-destructive">{errors.department_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Brief description of your request"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Provide details about your request"
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setValue("priority", value as typeof priority)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
