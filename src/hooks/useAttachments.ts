"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

async function fetchAttachments(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/attachments`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch attachments");
  }

  return response.json();
}

async function uploadAttachment({
  ticketId,
  file,
}: {
  ticketId: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload attachment");
  }

  return response.json();
}

async function deleteAttachment({
  ticketId,
  attachmentId,
}: {
  ticketId: string;
  attachmentId: string;
}) {
  const response = await fetch(
    `/api/tickets/${ticketId}/attachments?attachment_id=${attachmentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete attachment");
  }

  return response.json();
}

export function useAttachments(ticketId: string) {
  return useQuery({
    queryKey: ["ticket", ticketId, "attachments"],
    queryFn: () => fetchAttachments(ticketId),
    enabled: !!ticketId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "attachments"],
      });
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId, "attachments"],
      });
      toast({
        title: "Attachment deleted",
        description: "The attachment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}