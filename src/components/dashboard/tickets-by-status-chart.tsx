"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface TicketsByStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  Open: "#3b82f6",
  "Need Response": "#f97316",
  "In Progress": "#a855f7",
  "Waiting Customer": "#eab308",
  Closed: "#22c55e",
  open: "#3b82f6",
  need_response: "#f97316",
  in_progress: "#a855f7",
  waiting_customer: "#eab308",
  closed: "#22c55e",
};

export function TicketsByStatusChart({ data }: TicketsByStatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || "#6b7280",
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Tickets by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-white/40">
          No ticket data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Tickets by Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(15, 23, 42)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "white",
                }}
                formatter={(value: number) => [value, "Tickets"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-white/60">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center total - fixed positioning */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: "-18px" }}>
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
