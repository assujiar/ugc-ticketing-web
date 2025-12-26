"use client";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useAuth";
import { useSLAMetrics } from "@/hooks/useDashboard";
import { SLAComplianceChart } from "@/components/dashboard/sla-compliance-chart";
import { TicketsTrendChart } from "@/components/dashboard/tickets-trend-chart";
import { DepartmentPerformance } from "@/components/dashboard/department-performance";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const { isSuperAdmin, isManager, isLoading: authLoading } = useCurrentUser();
  const { data, isLoading } = useSLAMetrics(30);

  if (!authLoading && !isSuperAdmin && !isManager) {
    redirect("/dashboard");
  }

  const metrics = data?.data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View detailed reports and analytics"
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <SLAComplianceChart data={metrics.metrics || []} />
          <TicketsTrendChart data={metrics.trend || []} />
          <div className="md:col-span-2">
            <DepartmentPerformance metrics={metrics.metrics || []} />
          </div>
        </div>
      )}
    </div>
  );
}