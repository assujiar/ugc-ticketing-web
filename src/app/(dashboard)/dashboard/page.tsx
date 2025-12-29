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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
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
        needResponseTickets={summary.need_response_tickets || 0}
        waitingCustomerTickets={summary.waiting_customer_tickets || 0}
        closedTickets={summary.closed_tickets || 0}
        rfqTickets={summary.rfq_tickets || 0}
        genTickets={summary.gen_tickets || 0}
        wonTickets={summary.won_tickets || 0}
        lostTickets={summary.lost_tickets || 0}
        lostReasons={summary.lost_reasons || []}
      />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <TicketsByStatusChart data={summary.tickets_by_status || []} />
        {(isSuperAdmin || isManager) ? (
          <TicketsByDepartmentChart data={summary.tickets_by_department || []} />
        ) : (
          <TicketsTrendChart data={slaMetrics.trend || []} />
        )}
      </div>

      {/* SLA and Trend Charts (Admin/Manager only) */}
      {(isSuperAdmin || isManager) && (
        <div className="grid gap-6 md:grid-cols-2">
          <SLAComplianceChart data={slaMetrics.metrics || []} />
          <TicketsTrendChart data={slaMetrics.trend || []} />
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
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4">My Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Open</span>
                  <span className="font-semibold">{summary.open_tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Need Response</span>
                  <span className="font-semibold text-orange-400">{summary.need_response_tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Waiting Customer</span>
                  <span className="font-semibold text-yellow-400">{summary.waiting_customer_tickets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Closed</span>
                  <span className="font-semibold text-green-400">{summary.closed_tickets || 0}</span>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Won</span>
                    <span className="font-semibold text-green-400">{summary.won_tickets || 0}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-white/60">Lost</span>
                    <span className="font-semibold text-red-400">{summary.lost_tickets || 0}</span>
                  </div>
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
