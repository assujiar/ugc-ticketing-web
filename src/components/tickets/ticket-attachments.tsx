"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/hooks/useAttachments";
import { formatFileSize } from "@/lib/utils";
import { UPLOAD_LIMITS } from "@/lib/constants";
import {
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import type { TicketAttachment } from "@/types";

interface TicketAttachmentsProps {
  ticketId: string;
  canUpload?: boolean;
  canDelete?: boolean;
}

export function TicketAttachments({
  ticketId,
  canUpload = false,
  canDelete = false,
}: TicketAttachmentsProps) {
  const [deleteTarget, setDeleteTarget] = useState<TicketAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments, isLoading } = useAttachments(ticketId);
  const uploadMutation = useUploadAttachment(ticketId);
  const deleteMutation = useDeleteAttachment(ticketId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > UPLOAD_LIMITS.MAX_SIZE_BYTES) {
      alert(`File size exceeds ${UPLOAD_LIMITS.MAX_SIZE_MB}MB limit`);
      return;
    }

    uploadMutation.mutate(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (fileType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>
              {attachments?.length || 0} file(s) attached
            </CardDescription>
          </div>
          {canUpload && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(",")}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!attachments || attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attachments yet
            </p>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment: TicketAttachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-4 border rounded-lg p-3"
                >
                  {getFileIcon(attachment.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attachment.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(attachment.file_size)} •{" "}
                      {format(new Date(attachment.created_at), "PPp")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(attachment)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.file_name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
