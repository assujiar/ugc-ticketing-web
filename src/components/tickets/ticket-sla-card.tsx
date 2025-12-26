"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  calculateTimeRemaining,
  calculateHoursElapsed,
  formatHours,
  getSLAStatus,
} from "@/lib/calculations";
import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { SLATracking } from "@/types";

interface TicketSLACardProps {
  slaTracking: SLATracking | null;
  ticketCreatedAt: string;
}

export function TicketSLACard({ slaTracking, ticketCreatedAt }: TicketSLACardProps) {
  if (!slaTracking) {
    return null;
  }

  const createdAt = new Date(ticketCreatedAt);

  // First Response SLA
  const firstResponseElapsed = slaTracking.first_response_at
    ? calculateHoursElapsed(createdAt, new Date(slaTracking.first_response_at))
    : calculateHoursElapsed(createdAt);
  const firstResponseStatus = slaTracking.first_response_at
    ? slaTracking.first_response_met
      ? "met"
      : "breached"
    : getSLAStatus(firstResponseElapsed, slaTracking.first_response_sla_hours);
  const firstResponseProgress = Math.min(
    (firstResponseElapsed / slaTracking.first_response_sla_hours) * 100,
    100
  );

  // Resolution SLA
  const resolutionElapsed = slaTracking.resolution_at
    ? calculateHoursElapsed(createdAt, new Date(slaTracking.resolution_at))
    : calculateHoursElapsed(createdAt);
  const resolutionStatus = slaTracking.resolution_at
    ? slaTracking.resolution_met
      ? "met"
      : "breached"
    : getSLAStatus(resolutionElapsed, slaTracking.resolution_sla_hours);
  const resolutionProgress = Math.min(
    (resolutionElapsed / slaTracking.resolution_sla_hours) * 100,
    100
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met":
      case "on_track":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "breached":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met":
        return <Badge variant="success">Met</Badge>;
      case "on_track":
        return <Badge variant="success">On Track</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "at_risk":
        return <Badge className="bg-orange-500 hover:bg-orange-500/80">At Risk</Badge>;
      case "breached":
        return <Badge variant="destructive">Breached</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "met":
      case "on_track":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "at_risk":
        return "bg-orange-500";
      case "breached":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* First Response SLA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(firstResponseStatus)}
              <span className="font-medium text-sm">First Response</span>
            </div>
            {getStatusBadge(firstResponseStatus)}
          </div>

          <div className="relative">
            <Progress
              value={firstResponseProgress}
              className={`h-2 ${getProgressColor(firstResponseStatus)}`}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {slaTracking.first_response_at
                ? `Responded in ${formatHours(firstResponseElapsed)}`
                : `${formatHours(firstResponseElapsed)} elapsed`}
            </span>
            <span>Target: {slaTracking.first_response_sla_hours}h</span>
          </div>
        </div>

        {/* Resolution SLA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(resolutionStatus)}
              <span className="font-medium text-sm">Resolution</span>
            </div>
            {getStatusBadge(resolutionStatus)}
          </div>

          <div className="relative">
            <Progress
              value={resolutionProgress}
              className={`h-2 ${getProgressColor(resolutionStatus)}`}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {slaTracking.resolution_at
                ? `Resolved in ${formatHours(resolutionElapsed)}`
                : `${formatHours(resolutionElapsed)} elapsed`}
            </span>
            <span>Target: {slaTracking.resolution_sla_hours}h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}