"use client";

import { useState } from "react";
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
import { Loader2, Upload, X, File } from "lucide-react";

export function GenForm() {
  const router = useRouter();
  const createMutation = useCreateTicket();
  const { data: departments } = useDepartments();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 5MB.`);
        return false;
      }
      return true;
    }).slice(0, 5 - files.length);

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);

    validFiles.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => [...prev, ""]);
      }
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

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
          // Upload files if any
          if (files.length > 0) {
            uploadFiles(result.data.id);
          }
          toast.success("Ticket created", { description: "Your general request has been submitted" });
          router.push(`/tickets/${result.data.id}`);
        },
        onError: (error) => {
          toast.error("Error", { description: error.message });
        },
      }
    );
  };

  const uploadFiles = async (ticketId: string) => {
    // TODO: Implement file upload to Supabase storage
    console.log("Uploading files for ticket:", ticketId, files);
  };

  return (
    <Card className="bg-white/5 border-white/10">
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
              <SelectTrigger className="bg-white/5 border-white/20">
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
              <p className="text-sm text-red-400">{errors.department_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Brief description of your request"
              className="bg-white/5 border-white/20"
            />
            {errors.subject && (
              <p className="text-sm text-red-400">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Provide details about your request"
              rows={5}
              className="bg-white/5 border-white/20"
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setValue("priority", value as typeof priority)}>
              <SelectTrigger className="bg-white/5 border-white/20">
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

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-orange-500/50 transition-colors">
              <input
                type="file"
                id="gen-file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="gen-file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-white/40 mb-2" />
                <p className="text-sm text-white/60">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Images, PDF, Word, Excel (max 5MB each, up to 5 files)
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {previews[index] ? (
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center bg-white/5 rounded mb-2">
                        <File className="h-8 w-8 text-white/40" />
                      </div>
                    )}
                    <p className="text-xs text-white/60 truncate">{file.name}</p>
                    <p className="text-xs text-white/40">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
