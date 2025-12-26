"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  User,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import type { Ticket, RFQData } from "@/types";

interface TicketInfoCardProps {
  ticket: Ticket;
}

export function TicketInfoCard({ ticket }: TicketInfoCardProps) {
  const rfqData = ticket.rfq_data as RFQData | null;

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Ticket Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Creator */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Created by</div>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {getInitials(ticket.creator?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {ticket.creator?.full_name}
              </span>
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Assigned to</div>
            {ticket.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(ticket.assignee?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {ticket.assignee.full_name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>

        {/* Department */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Department</div>
            <div className="font-medium text-sm">
              {ticket.departments?.name}
              <Badge variant="outline" className="ml-2 text-xs">
                {ticket.departments?.code}
              </Badge>
            </div>
          </div>
        </div>

        {/* Created at */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Created</div>
            <div className="font-medium text-sm">
              {formatDateTime(ticket.created_at)}
              <span className="text-muted-foreground ml-1 text-xs">
                ({formatRelativeTime(ticket.created_at)})
              </span>
            </div>
          </div>
        </div>

        {/* Updated at */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Last Updated</div>
            <div className="font-medium text-sm">
              {formatRelativeTime(ticket.updated_at)}
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </>
        )}

        {/* RFQ Data */}
        {ticket.ticket_type === "RFQ" && rfqData && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium">Rate Inquiry Details</div>

              {/* Customer */}
              {rfqData.customer_name && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <User className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Customer</div>
                    <div className="text-sm">{rfqData.customer_name}</div>
                  </div>
                </div>
              )}

              {/* Route */}
              {(rfqData.origin_city || rfqData.destination_city) && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Route</div>
                    <div className="text-sm">
                      {rfqData.origin_city}, {rfqData.origin_country} →{" "}
                      {rfqData.destination_city}, {rfqData.destination_country}
                    </div>
                  </div>
                </div>
              )}

              {/* Cargo */}
              {rfqData.cargo_description && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Package className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Cargo</div>
                    <div className="text-sm">
                      {rfqData.cargo_description}
                      {rfqData.cargo_category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {rfqData.cargo_category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Volume */}
              {rfqData.total_volume && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Truck className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-sm">
                      {rfqData.quantity} {rfqData.unit_of_measure} •{" "}
                      {rfqData.total_volume.toFixed(4)} CBM
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}