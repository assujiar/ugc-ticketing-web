"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateTicket, useAssignTicket } from "@/hooks/useTickets";
import { useUsersByDepartment } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";
import { getValidTransitions } from "@/lib/ticket-utils";
import { Settings, UserPlus, RefreshCw, Check } from "lucide-react";
import type { Ticket } from "@/types";

interface TicketActionsProps {
  ticket: Ticket;
}

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TicketActions({ ticket }: TicketActionsProps) {
  const { profile, isSuperAdmin, isManager } = useCurrentUser();
  const updateTicket = useUpdateTicket();
  const assignTicket = useAssignTicket();

  const canAssign =
    isSuperAdmin || (isManager && profile?.department_id === ticket.department_id);

  const canUpdateStatus =
    isSuperAdmin ||
    (isManager && profile?.department_id === ticket.department_id) ||
    ticket.created_by === profile?.id;

  const { data: departmentUsers } = useUsersByDepartment(
    canAssign ? ticket.department_id : null
  );

  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [selectedPriority, setSelectedPriority] = useState(ticket.priority);
  const [selectedAssignee, setSelectedAssignee] = useState(ticket.assigned_to || "");
  const [assignNotes, setAssignNotes] = useState("");

  const validTransitions = getValidTransitions(ticket.status);

  const handleStatusUpdate = async () => {
    if (selectedStatus === ticket.status) return;
    await updateTicket.mutateAsync({
      id: ticket.id,
      data: { status: selectedStatus },
    });
  };

  const handlePriorityUpdate = async () => {
    if (selectedPriority === ticket.priority) return;
    await updateTicket.mutateAsync({
      id: ticket.id,
      data: { priority: selectedPriority },
    });
  };

  const handleAssignment = async () => {
    if (!selectedAssignee || selectedAssignee === ticket.assigned_to) return;
    await assignTicket.mutateAsync({
      ticketId: ticket.id,
      assignedTo: selectedAssignee,
      notes: assignNotes || undefined,
    });
    setAssignNotes("");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Update */}
        {canUpdateStatus && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Update Status</label>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ticket.status}>
                    {statusLabels[ticket.status]} (Current)
                  </SelectItem>
                  {validTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                onClick={handleStatusUpdate}
                disabled={
                  selectedStatus === ticket.status || updateTicket.isPending
                }
              >
                {updateTicket.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Priority Update */}
        {canUpdateStatus && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Update Priority</label>
            <div className="flex gap-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                      {value === ticket.priority && " (Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                onClick={handlePriorityUpdate}
                disabled={
                  selectedPriority === ticket.priority || updateTicket.isPending
                }
              >
                {updateTicket.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Assignment */}
        {canAssign && (
          <>
            <Separator />
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Assign Ticket
              </label>

              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  {ticket.assigned_to && (
                    <SelectItem value={ticket.assigned_to}>
                      {ticket.assignee?.full_name} (Current)
                    </SelectItem>
                  )}
                  {departmentUsers
                    ?.filter((u) => u.id !== ticket.assigned_to)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Assignment notes (optional)..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={2}
              />

              <Button
                className="w-full"
                onClick={handleAssignment}
                disabled={
                  !selectedAssignee ||
                  selectedAssignee === ticket.assigned_to ||
                  assignTicket.isPending
                }
              >
                {assignTicket.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Quick status buttons */}
        {canUpdateStatus && ticket.status !== "closed" && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Actions</label>
              <div className="grid grid-cols-2 gap-2">
                {ticket.status !== "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTicket.mutate({
                        id: ticket.id,
                        data: { status: "resolved" },
                      })
                    }
                    disabled={updateTicket.isPending}
                  >
                    Mark Resolved
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTicket.mutate({
                      id: ticket.id,
                      data: { status: "closed" },
                    })
                  }
                  disabled={updateTicket.isPending}
                >
                  Close Ticket
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Reopen closed ticket */}
        {ticket.status === "closed" && canUpdateStatus && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              updateTicket.mutate({
                id: ticket.id,
                data: { status: "open" },
              })
            }
            disabled={updateTicket.isPending}
          >
            Reopen Ticket
          </Button>
        )}
      </CardContent>
    </Card>
  );
}