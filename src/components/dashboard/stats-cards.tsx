"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Timer,
} from "lucide-react";

interface StatsCardsProps {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "orange" | "green" | "red" | "purple" | "cyan";
}

const colorVariants = {
  blue: "bg-blue-500/10 text-blue-500",
  orange: "bg-orange-500/10 text-orange-500",
  green: "bg-green-500/10 text-green-500",
  red: "bg-red-500/10 text-red-500",
  purple: "bg-purple-500/10 text-purple-500",
  cyan: "bg-cyan-500/10 text-cyan-500",
};

function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  <TrendingUp
                    className={cn(
                      "h-3 w-3",
                      !trend.isPositive && "rotate-180"
                    )}
                  />
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", colorVariants[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({
  totalTickets,
  openTickets,
  inProgressTickets,
  resolvedTickets,
  avgResponseTime,
  avgResolutionTime,
}: StatsCardsProps) {
  const stats: StatCardProps[] = [
    {
      title: "Total Tickets",
      value: totalTickets,
      subtitle: "All time",
      icon: Ticket,
      color: "blue",
    },
    {
      title: "Open Tickets",
      value: openTickets,
      subtitle: "Awaiting response",
      icon: AlertCircle,
      color: "orange",
    },
    {
      title: "In Progress",
      value: inProgressTickets,
      subtitle: "Being worked on",
      icon: Clock,
      color: "purple",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      subtitle: "This month",
      icon: CheckCircle,
      color: "green",
    },
  ];

  // Add SLA stats for managers
  if (avgResponseTime > 0 || avgResolutionTime > 0) {
    stats.push(
      {
        title: "Response SLA",
        value: `${avgResponseTime}%`,
        subtitle: "First response compliance",
        icon: Timer,
        color: avgResponseTime >= 90 ? "green" : avgResponseTime >= 70 ? "orange" : "red",
      },
      {
        title: "Resolution SLA",
        value: `${avgResolutionTime}%`,
        subtitle: "Resolution compliance",
        icon: CheckCircle,
        color: avgResolutionTime >= 90 ? "green" : avgResolutionTime >= 70 ? "orange" : "red",
      }
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.slice(0, 4).map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}