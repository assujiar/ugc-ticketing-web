"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TicketsByStatusChart } from "@/components/dashboard/tickets-by-status-chart";
import { TicketsByDepartmentChart } from "@/components/dashboard/tickets-by-department-chart";
import { SLAComplianceChart } from "@/components/dashboard/sla-compliance-chart";
import { TicketsTrendChart } from "@/components/dashboard/tickets-trend-chart";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { DepartmentPerformance } from "@/components/dashboard/department-performance";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary, useSLAMetrics } from "@/hooks/useDashboard";
import { useCurrentUser } from "@/hooks/useAuth";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>

      {/* Bottom section skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const { profile, isSuperAdmin, isManager } = useCurrentUser();
  const { data: summaryData, isLoading: loadingSummary } = useDashboardSummary();
  const { data: slaData, isLoading: loadingSLA } = useSLAMetrics(30);

  if (loadingSummary || loadingSLA) {
    return <DashboardSkeleton />;
  }

  const summary = summaryData?.data || {};
  const slaMetrics = slaData?.data || {};

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards
        totalTickets={summary.total_tickets || 0}
        openTickets={summary.open_tickets || 0}
        inProgressTickets={summary.in_progress_tickets || 0}
        resolvedTickets={summary.resolved_tickets || 0}
        avgResponseTime={slaMetrics.overall?.first_response_compliance || 0}
        avgResolutionTime={slaMetrics.overall?.resolution_compliance || 0}
      />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <TicketsByStatusChart
          data={summary.tickets_by_status || []}
        />
        {(isSuperAdmin || isManager) && (
          <TicketsByDepartmentChart
            data={summary.tickets_by_department || []}
          />
        )}
        {!isSuperAdmin && !isManager && (
          <TicketsTrendChart
            data={slaMetrics.trend || []}
          />
        )}
      </div>

      {/* SLA and Trend Charts */}
      {(isSuperAdmin || isManager) && (
        <div className="grid gap-6 md:grid-cols-2">
          <SLAComplianceChart
            data={slaMetrics.metrics || []}
          />
          <TicketsTrendChart
            data={slaMetrics.trend || []}
          />
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTickets tickets={summary.recent_tickets || []} />
        </div>
        <div>
          {(isSuperAdmin || isManager) ? (
            <DepartmentPerformance metrics={slaMetrics.metrics || []} />
          ) : (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">My Open Tickets</span>
                  <span className="font-semibold">{summary.open_tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Response</span>
                  <span className="font-semibold">{summary.pending_tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved This Month</span>
                  <span className="font-semibold">{summary.resolved_tickets || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useCurrentUser();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${profile?.full_name?.split(" ")[0] || "there"}!`}
        description="Here's an overview of your ticketing system"
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}