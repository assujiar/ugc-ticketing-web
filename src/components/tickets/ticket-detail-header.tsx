"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketTypeBadge } from "./ticket-type-badge";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useDeleteTicket } from "@/hooks/useTicket";
import { useCurrentUser } from "@/hooks/useAuth";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import type { Ticket } from "@/types";

interface TicketDetailHeaderProps {
  ticket: Ticket;
}

export function TicketDetailHeader({ ticket }: TicketDetailHeaderProps) {
  const router = useRouter();
  const { profile, isSuperAdmin, isManager } = useCurrentUser();
  const deleteTicket = useDeleteTicket(ticket.id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canDelete =
    isSuperAdmin ||
    (isManager && profile?.department_id === ticket.department_id) ||
    ticket.created_by === profile?.id;

  const handleDelete = async () => {
    await deleteTicket.mutateAsync();
    router.push("/tickets");
  };

  const statusClass =
    ticket.status === "open"
      ? "bg-blue-500/20 text-blue-400"
      : ticket.status === "in_progress"
      ? "bg-purple-500/20 text-purple-400"
      : ticket.status === "pending"
      ? "bg-yellow-500/20 text-yellow-400"
      : ticket.status === "resolved"
      ? "bg-green-500/20 text-green-400"
      : "bg-gray-500/20 text-gray-400";

  const priorityClass =
    ticket.priority === "urgent"
      ? "bg-red-500/20 text-red-400"
      : ticket.priority === "high"
      ? "bg-orange-500/20 text-orange-400"
      : ticket.priority === "medium"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-slate-500/20 text-slate-300";

  return (
    <div className="space-y-4">
      <Link href="/tickets">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono text-primary">{ticket.ticket_code}</h1>
            <TicketTypeBadge type={ticket.ticket_type} />
          </div>

          <h2 className="text-xl font-semibold">{ticket.subject}</h2>

          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
            <div>
              Created {formatDateTime(ticket.created_at)}
              {ticket.creator && <span> by {ticket.creator.full_name}</span>}
            </div>
            {ticket.departments && (
              <div>
                <span className="font-medium">{ticket.departments.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={statusClass}>{ticket.status}</Badge>
          <Badge className={priorityClass}>{ticket.priority}</Badge>

          {canDelete && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>

              <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Ticket"
                description={`Are you sure you want to delete ticket ${ticket.ticket_code}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                isLoading={deleteTicket.isPending}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
