"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks/useAttachments";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";
import { UPLOAD_LIMITS } from "@/lib/constants";
import {
  Paperclip,
  Upload,
  File,
  FileText,
  FileImage,
  FileArchive,
  Trash2,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import type { TicketAttachment } from "@/types";

interface TicketAttachmentsProps {
  ticketId: string;
}

export function TicketAttachments({ ticketId }: TicketAttachmentsProps) {
  const { profile, isSuperAdmin } = useCurrentUser();
  const { data, isLoading } = useAttachments(ticketId);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TicketAttachment | null>(null);

  const attachments: TicketAttachment[] = data?.data || [];

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        // Validate file
        if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds maximum size of 10MB`);
          continue;
        }

        if (!UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type)) {
          alert(`File type "${file.type}" is not allowed`);
          continue;
        }

        await uploadAttachment.mutateAsync({ ticketId, file });
      }
    },
    [ticketId, uploadAttachment]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAttachment.mutateAsync({
      ticketId,
      attachmentId: deleteTarget.id,
    });
    setDeleteTarget(null);
  };

  const canDelete = (attachment: TicketAttachment) =>
    isSuperAdmin || attachment.uploaded_by === profile?.id;

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return FileImage;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("zip") || fileType.includes("archive")) return FileArchive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Attachments
          {attachments.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {attachments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            accept={UPLOAD_LIMITS.ALLOWED_TYPES.join(",")}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              {uploadAttachment.isPending ? (
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <span className="text-primary font-medium">Click to upload</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, Images, Documents up to 10MB
              </p>
            </div>
          </label>
        </div>

        {/* Attachments list */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No attachments yet
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.file_type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {attachment.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span>•</span>
                      <span>{attachment.uploader?.full_name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(attachment.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>

                    {canDelete(attachment) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(attachment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete confirmation */}
        <ConfirmationDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Attachment"
          description={`Are you sure you want to delete "${deleteTarget?.file_name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={deleteAttachment.isPending}
        />
      </CardContent>
    </Card>
  );
}