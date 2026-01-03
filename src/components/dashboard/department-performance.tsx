"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, CheckCircle } from "lucide-react";

interface DepartmentPerformanceProps {
  metrics: Array<{
    department?: string;
    department_code?: string;
    department_name?: string;
    first_response_compliance?: number | null;
    resolution_compliance?: number | null;
    avg_first_response_hours?: number | null;
    avg_resolution_hours?: number | null;
    total?: number;
    closed?: number;
  }>;
}

export function DepartmentPerformance({ metrics }: DepartmentPerformanceProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-white/40">
          No performance data available
        </CardContent>
      </Card>
    );
  }

  const formatHours = (hours: number | null | undefined) => {
    if (hours === null || hours === undefined) return "N/A";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const getPerformanceRank = (
    firstResponse: number | null | undefined,
    resolution: number | null | undefined
  ): "excellent" | "good" | "fair" | "poor" => {
    const avg = ((firstResponse ?? 0) + (resolution ?? 0)) / 2;
    if (avg >= 90) return "excellent";
    if (avg >= 75) return "good";
    if (avg >= 50) return "fair";
    return "poor";
  };

  const rankConfig = {
    excellent: { label: "Excellent", color: "bg-green-500/20 text-green-400" },
    good: { label: "Good", color: "bg-blue-500/20 text-blue-400" },
    fair: { label: "Fair", color: "bg-yellow-500/20 text-yellow-400" },
    poor: { label: "Needs Attention", color: "bg-red-500/20 text-red-400" },
  };

  // Sort by performance
  const sortedMetrics = [...metrics].sort((a, b) => {
    const avgA = ((a.first_response_compliance ?? 0) + (a.resolution_compliance ?? 0)) / 2;
    const avgB = ((b.first_response_compliance ?? 0) + (b.resolution_compliance ?? 0)) / 2;
    return avgB - avgA;
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Department Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMetrics.map((dept, index) => {
            const deptName = dept.department || dept.department_name || "Unknown";
            const rank = getPerformanceRank(
              dept.first_response_compliance,
              dept.resolution_compliance
            );
            const config = rankConfig[rank];

            return (
              <div
                key={`${deptName}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{deptName}</span>
                    <Badge className={`text-xs ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-white/60">
                      <Clock className="h-3 w-3" />
                      <span>
                        Response:{" "}
                        <span className="font-medium text-white">
                          {dept.first_response_compliance ?? 0}%
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60">
                      <CheckCircle className="h-3 w-3" />
                      <span>
                        Closed:{" "}
                        <span className="font-medium text-white">
                          {dept.resolution_compliance ?? 0}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
