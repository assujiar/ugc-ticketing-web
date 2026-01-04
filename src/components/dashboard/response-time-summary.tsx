"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, TrendingUp, Award } from "lucide-react";

interface UserMetric {
  userId: string;
  userName: string;
  role: string;
  department: string;
  totalResponses: number;
  avgResponseTimeHours: number;
  medianResponseTimeHours?: number;
}

interface RoleMetric {
  role: string;
  userCount: number;
  totalResponses: number;
  avgResponseTimeHours: number;
}

interface ResponseTimeSummaryProps {
  userMetrics: UserMetric[];
  roleMetrics: RoleMetric[];
  overall: {
    totalUsers: number;
    totalResponses: number;
    avgResponseTimeHours: number;
  };
}

function formatTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  return `${(hours / 24).toFixed(1)}d`;
}

function getTimeColor(hours: number): string {
  if (hours <= 2) return "text-green-400";
  if (hours <= 4) return "text-yellow-400";
  if (hours <= 8) return "text-orange-400";
  return "text-red-400";
}

export function ResponseTimeSummary({ userMetrics, roleMetrics, overall }: ResponseTimeSummaryProps) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-400" />
          Response Time Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{overall.totalUsers}</div>
            <div className="text-xs text-white/50">Active Users</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{overall.totalResponses}</div>
            <div className="text-xs text-white/50">Total Responses</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${getTimeColor(overall.avgResponseTimeHours)}`}>
              {formatTime(overall.avgResponseTimeHours)}
            </div>
            <div className="text-xs text-white/50">Avg Response</div>
          </div>
        </div>

        {/* By Role */}
        {roleMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" /> By Role
            </h4>
            <div className="space-y-2">
              {roleMetrics.slice(0, 5).map((role) => (
                <div key={role.role} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80">{role.role.replace(/_/g, " ")}</span>
                    <span className="text-white/40 text-xs">({role.userCount})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs">{role.totalResponses} resp</span>
                    <span className={`font-medium ${getTimeColor(role.avgResponseTimeHours)}`}>
                      {formatTime(role.avgResponseTimeHours)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers */}
        {userMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-1">
              <Award className="h-4 w-4 text-yellow-400" /> Top Responders
            </h4>
            <div className="space-y-2">
              {userMetrics.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      index === 1 ? "bg-gray-400/20 text-gray-300" :
                      index === 2 ? "bg-orange-600/20 text-orange-400" :
                      "bg-white/10 text-white/50"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white/80 truncate max-w-[120px]">{user.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs">{user.totalResponses}</span>
                    <span className={`font-medium ${getTimeColor(user.avgResponseTimeHours)}`}>
                      {formatTime(user.avgResponseTimeHours)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {userMetrics.length === 0 && roleMetrics.length === 0 && (
          <div className="text-center text-white/40 py-4">
            No response data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
