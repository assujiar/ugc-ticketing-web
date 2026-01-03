"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, CheckCircle, AlertTriangle } from "lucide-react";

interface SLAComplianceChartProps {
  data: Array<{
    department?: string;
    department_code?: string;
    department_name?: string;
    first_response_compliance: number | null;
    resolution_compliance: number | null;
    avg_first_response_hours?: number | null;
    avg_resolution_hours?: number | null;
  }>;
}

export function SLAComplianceChart({ data }: SLAComplianceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            SLA Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-white/40">
          No SLA data available
        </CardContent>
      </Card>
    );
  }

  const getComplianceColor = (value: number | null) => {
    if (value === null) return "bg-white/20";
    if (value >= 90) return "bg-green-500";
    if (value >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getComplianceBadge = (value: number | null) => {
    if (value === null) return { color: "bg-white/20 text-white/60", label: "N/A" };
    if (value >= 90) return { color: "bg-green-500/20 text-green-400", label: "Good" };
    if (value >= 70) return { color: "bg-amber-500/20 text-amber-400", label: "Warning" };
    return { color: "bg-red-500/20 text-red-400", label: "Critical" };
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="h-5 w-5" />
          SLA Compliance by Department
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((dept, index) => {
            const deptName = dept.department || dept.department_name || "Unknown";
            const deptCode = dept.department_code || deptName.substring(0, 3).toUpperCase();
            const responseCompliance = dept.first_response_compliance ?? 0;
            const resolutionCompliance = dept.resolution_compliance ?? 0;
            const responseBadge = getComplianceBadge(dept.first_response_compliance);
            const resolutionBadge = getComplianceBadge(dept.resolution_compliance);

            return (
              <div key={`${deptName}-${index}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{deptName}</span>
                  </div>
                </div>

                {/* First Response */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      First Response
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {dept.first_response_compliance !== null
                          ? `${dept.first_response_compliance.toFixed(0)}%`
                          : "N/A"}
                      </span>
                      <Badge className={`text-xs ${responseBadge.color}`}>
                        {responseBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getComplianceColor(dept.first_response_compliance)} transition-all`}
                      style={{ width: `${responseCompliance}%` }}
                    />
                  </div>
                </div>

                {/* Resolution */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Resolution
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {dept.resolution_compliance !== null
                          ? `${dept.resolution_compliance.toFixed(0)}%`
                          : "N/A"}
                      </span>
                      <Badge className={`text-xs ${resolutionBadge.color}`}>
                        {resolutionBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getComplianceColor(dept.resolution_compliance)} transition-all`}
                      style={{ width: `${resolutionCompliance}%` }}
                    />
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
