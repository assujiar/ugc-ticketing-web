"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTickets";
import { useCurrentUser } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, User, Calendar, Package, MapPin, Truck, Paperclip, FileText, Image, File, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { TicketSLACard } from "@/components/tickets/ticket-sla-card";
import Link from "next/link";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  need_response: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  waiting_customer: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

const opsRoles = ["domestics_ops_manager", "exim_ops_manager", "import_dtd_ops_manager", "warehouse_traffic_ops_manager"];

interface PageProps {
  params: Promise<{ id: string }>;
}

function AttachmentItem({ attachment }: { attachment: any }) {
  const fileName = typeof attachment === "string" ? attachment : (attachment.name || attachment.file_name || "File");
  const fileUrl = typeof attachment === "object" ? attachment.url : null;
  
  const getIcon = () => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <Image className="h-5 w-5 text-blue-400" />;
    }
    if (ext === "pdf") {
      return <FileText className="h-5 w-5 text-red-400" />;
    }
    return <File className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{fileName}</p>
        {fileUrl && (
          <Link href={fileUrl} target="_blank" className="text-xs text-orange-400 hover:underline">
            View / Download
          </Link>
        )}
      </div>
      {fileUrl && (
        <Link href={fileUrl} target="_blank">
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function TicketDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useCurrentUser();
  const { data: ticketResponse, isLoading, error, refetch } = useTicket(id);

  // Extract ticket data properly
  const ticket: any = ticketResponse?.data || ticketResponse;
  const isOpsRole = opsRoles.includes(profile?.roles?.name || "");

  const handleUpdate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["ticket", id] });
  };

  const getFleetData = () => {
    if (!ticket?.rfq_data?.fleet_requirement) return [];
    try {
      return JSON.parse(ticket.rfq_data.fleet_requirement);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket || !ticket.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Ticket not found</h2>
        <p className="text-white/60 mt-2">The ticket does not exist.</p>
        <Link href="/tickets">
          <Button className="mt-4">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  const status = ticket.status || "open";
  const priority = ticket.priority || "medium";
  const fleetData = getFleetData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-orange-400 font-mono">{ticket.ticket_code || "N/A"}</h1>
            <Badge className={statusColors[status] || statusColors.open}>
              {status === "need_response" ? "Need Response" : status === "waiting_customer" ? "Waiting Customer" : status === "in_progress" ? "In Progress" : status}
            </Badge>
            <Badge className={priorityColors[priority] || priorityColors.medium}>{priority}</Badge>
            {ticket.resolution && (
              <Badge className={ticket.resolution === "won" ? "bg-green-500/20 text-green-400" : ticket.resolution === "lost" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}>
                {ticket.resolution}
              </Badge>
            )}
          </div>
          <p className="text-white/60 mt-1">{ticket.subject || "No subject"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white/60">Department</p>
                    <p className="font-medium">{ticket.departments?.name || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white/60">Created By</p>
                    <p className="font-medium">{ticket.creator?.full_name || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white/60">Created At</p>
                    <p className="font-medium">{ticket.created_at ? formatDateTime(ticket.created_at) : "-"}</p>
                  </div>
                </div>
                {ticket.assignee && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-white/40" />
                    <div>
                      <p className="text-sm text-white/60">Assigned To</p>
                      <p className="font-medium">{ticket.assignee.full_name}</p>
                    </div>
                  </div>
                )}
              </div>
              {ticket.description && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-2">Description</p>
                  <p className="text-white/80 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {ticket.rfq_data && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Rate Inquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {!isOpsRole && (
                    <div>
                      <p className="text-sm text-white/60">Customer</p>
                      <p className="font-medium">{ticket.rfq_data.customer_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/60">Service Type</p>
                    <p className="font-medium">{ticket.rfq_data.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Cargo Category</p>
                    <p className="font-medium">{ticket.rfq_data.cargo_category}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-400 mt-1" />
                    <div>
                      <p className="text-sm text-white/60">Origin</p>
                      <p className="font-medium">{ticket.rfq_data.origin_city}, {ticket.rfq_data.origin_country}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-400 mt-1" />
                    <div>
                      <p className="text-sm text-white/60">Destination</p>
                      <p className="font-medium">{ticket.rfq_data.destination_city}, {ticket.rfq_data.destination_country}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-white/60">Quantity</p>
                    <p className="font-medium">{ticket.rfq_data.quantity} {ticket.rfq_data.unit_of_measure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Weight/Unit</p>
                    <p className="font-medium">{ticket.rfq_data.weight_per_unit} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Dimensions</p>
                    <p className="font-medium">{ticket.rfq_data.length}x{ticket.rfq_data.width}x{ticket.rfq_data.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Volume</p>
                    <p className="font-medium">{ticket.rfq_data.total_volume?.toFixed(4) || "0"} CBM</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Weight</p>
                    <p className="font-medium">{((ticket.rfq_data.weight_per_unit || 0) * (ticket.rfq_data.quantity || 0)).toFixed(2)} kg</p>
                  </div>
                </div>

                {fleetData.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Fleet Requirements
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {fleetData.map((fleet: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                          <span className="text-sm">{fleet.label}</span>
                          <Badge className="bg-orange-500/20 text-orange-400">{fleet.quantity} unit</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.rfq_data.scope_of_work && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">Scope of Work</p>
                    <p className="font-medium mt-1">{ticket.rfq_data.scope_of_work}</p>
                  </div>
                )}

                {ticket.rfq_data.estimated_project_date && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">Estimated Project Date</p>
                    <p className="font-medium mt-1">{ticket.rfq_data.estimated_project_date}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {ticket.rfq_data?.attachments && ticket.rfq_data.attachments.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments ({ticket.rfq_data.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ticket.rfq_data.attachments.map((att: any, idx: number) => (
                    <AttachmentItem key={idx} attachment={att} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <TicketComments ticketId={id} creatorId={ticket.created_by} />
        </div>

        <div className="space-y-6">
          <TicketSLACard ticket={ticket} />
          <TicketActions ticket={ticket} onUpdate={handleUpdate} />
        </div>
      </div>
    </div>
  );
}
