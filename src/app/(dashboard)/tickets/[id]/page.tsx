"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import { TicketDetailHeader } from "@/components/tickets/ticket-detail-header";
import { TicketInfoCard } from "@/components/tickets/ticket-info-card";
import { TicketSLACard } from "@/components/tickets/ticket-sla-card";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { TicketAttachments } from "@/components/tickets/ticket-attachments";
import { TicketQuotes } from "@/components/tickets/ticket-quotes";
import { TicketAssignmentHistory } from "@/components/tickets/ticket-assignment-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Paperclip, Receipt, Users } from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useTicket(id);

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (error || !data?.data) {
    notFound();
  }

  const ticket = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <TicketDetailHeader ticket={ticket} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for mobile-friendly navigation */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="comments" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Comments</span>
              </TabsTrigger>
              <TabsTrigger value="attachments" className="gap-1">
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              {ticket.ticket_type === "RFQ" && (
                <TabsTrigger value="quotes" className="gap-1">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline">Quotes</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="history" className="gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <TicketComments
                ticketId={ticket.id}
                ticketCreatedBy={ticket.created_by}
              />
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <TicketAttachments ticketId={ticket.id} />
            </TabsContent>

            {ticket.ticket_type === "RFQ" && (
              <TabsContent value="quotes" className="mt-4">
                <TicketQuotes
                  ticketId={ticket.id}
                  ticketType={ticket.ticket_type}
                  departmentId={ticket.department_id}
                />
              </TabsContent>
            )}

            <TabsContent value="history" className="mt-4">
              <TicketAssignmentHistory ticketId={ticket.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          <TicketActions ticket={ticket} />
          <TicketInfoCard ticket={ticket} />
          <TicketSLACard
            slaTracking={ticket.sla_tracking || null}
            ticketCreatedAt={ticket.created_at}
          />
        </div>
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}