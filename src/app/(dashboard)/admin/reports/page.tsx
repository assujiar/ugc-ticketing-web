"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useAuth";
import { useDashboardSummary, useSLAMetrics } from "@/hooks/useDashboard";
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  Clock
} from "lucide-react";
import { redirect } from "next/navigation";

export default function AdminReportsPage() {
  const { isSuperAdmin, isLoading: authLoading } = useCurrentUser();
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: slaData, isLoading: slaLoading } = useSLAMetrics(30);

  if (!authLoading && !isSuperAdmin) {
    redirect("/dashboard");
  }

  const summary = summaryData?.data || {};
  const slaMetrics = slaData?.data || {};
  const isLoading = summaryLoading || slaLoading;

  const winRate = summary.won_tickets && summary.lost_tickets 
    ? Math.round((summary.won_tickets / (summary.won_tickets + summary.lost_tickets)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View analytics and generate reports"
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Tickets</p>
                <p className="text-3xl font-bold mt-1">{summary.total_tickets || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Ticket className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Closed Tickets</p>
                <p className="text-3xl font-bold mt-1">{summary.closed_tickets || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Win Rate (RFQ)</p>
                <p className="text-3xl font-bold mt-1">{winRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <ThumbsUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg SLA Compliance</p>
                <p className="text-3xl font-bold mt-1">{slaMetrics.overall?.resolution_compliance || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFQ Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              RFQ Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="h-5 w-5 text-green-400" />
                  <span>Won</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{summary.won_tickets || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <ThumbsDown className="h-5 w-5 text-red-400" />
                  <span>Lost</span>
                </div>
                <span className="text-2xl font-bold text-red-400">{summary.lost_tickets || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span>Win Rate</span>
                </div>
                <span className="text-2xl font-bold text-purple-400">{winRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Lost Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.lost_reasons && summary.lost_reasons.length > 0 ? (
              <div className="space-y-3">
                {summary.lost_reasons.map((reason: any) => (
                  <div key={reason.reason} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm">{reason.label}</span>
                    <span className="font-bold text-red-400">{reason.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                No lost tickets yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket by Type */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tickets by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-white/60">Rate Inquiry (RFQ)</p>
                <p className="text-2xl font-bold mt-1">{summary.rfq_tickets || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">of total</p>
                <p className="text-lg font-bold text-purple-400">
                  {summary.total_tickets ? Math.round((summary.rfq_tickets || 0) / summary.total_tickets * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-white/60">General Request</p>
                <p className="text-2xl font-bold mt-1">{summary.gen_tickets || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">of total</p>
                <p className="text-lg font-bold text-cyan-400">
                  {summary.total_tickets ? Math.round((summary.gen_tickets || 0) / summary.total_tickets * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
