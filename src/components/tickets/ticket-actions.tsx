"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUpdateTicket, useDeleteTicket, useAssignTicket } from "@/hooks/useTicket";
import { useUsers } from "@/hooks/useUsers";
import { TICKET_STATUS, TICKET_PRIORITY } from "@/lib/constants";
import { Trash2, UserPlus, Loader2 } from "lucide-react";
import type { Ticket, TicketStatus, TicketPriority } from "@/types";

interface TicketActionsProps {
  ticket: Ticket;
  canUpdate?: boolean;
  canDelete?: boolean;
  canAssign?: boolean;
}

export function TicketActions({
  ticket,
  canUpdate = false,
  canDelete = false,
  canAssign = false,
}: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  const updateMutation = useUpdateTicket(ticket.id);
  const deleteMutation = useDeleteTicket(ticket.id);
  const assignMutation = useAssignTicket(ticket.id);
  const { data: users } = useUsers({ department: ticket.department_id });

  const handleStatusChange = (newStatus: string) => {
    const typedStatus = newStatus as TicketStatus;
    setStatus(typedStatus);
    updateMutation.mutate(
      { status: typedStatus },
      {
        onSuccess: () => {
          toast({ title: "Status updated", description: `Ticket status changed to ${typedStatus}` });
        },
        onError: (error) => {
          setStatus(ticket.status);
          toast.error("Error", { description: error.message });
        },
      }
    );
  };

  const handlePriorityChange = (newPriority: string) => {
    const typedPriority = newPriority as TicketPriority;
    setPriority(typedPriority);
    updateMutation.mutate(
      { priority: typedPriority },
      {
        onSuccess: () => {
          toast({ title: "Priority updated", description: `Ticket priority changed to ${typedPriority}` });
        },
        onError: (error) => {
          setPriority(ticket.priority);
          toast.error("Error", { description: error.message });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Ticket deleted", { description: "The ticket has been deleted"  });
        router.push("/tickets");
      },
      onError: (error) => {
        toast.error("Error", { description: error.message });
      },
    });
    setShowDeleteDialog(false);
  };

  const handleAssign = () => {
    if (!selectedAssignee) return;
    assignMutation.mutate(
      { assigned_to: selectedAssignee },
      {
        onSuccess: () => {
          toast.success("Ticket assigned", { description: "The ticket has been assigned"  });
          setShowAssignDialog(false);
          setSelectedAssignee("");
        },
        onError: (error) => {
          toast.error("Error", { description: error.message });
        },
      }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Select */}
      {canUpdate && (
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TICKET_STATUS).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Priority Select */}
      {canUpdate && (
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Assign Button */}
      {canAssign && (
        <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign
        </Button>
      )}

      {/* Delete Button */}
      {canDelete && (
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket {ticket.ticket_code}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Select a user to assign this ticket to.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedAssignee || assignMutation.isPending}>
              {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
