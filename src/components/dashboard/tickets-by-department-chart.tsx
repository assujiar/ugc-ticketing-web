"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface TicketsByDepartmentChartProps {
  data: Array<{ department: string; department_code?: string; count: number }>;
}

export function TicketsByDepartmentChart({ data }: TicketsByDepartmentChartProps) {
  const chartData = data.map((item) => ({
    name: item.department_code || item.department?.slice(0, 10) || "Unknown",
    fullName: item.department,
    tickets: item.count,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tickets by Department
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-white/40">
          No department data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tickets by Department
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(15, 23, 42)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "white",
                }}
                formatter={(value: number, name: string, props: any) => [
                  value,
                  props.payload.fullName,
                ]}
                labelFormatter={() => ""}
              />
              <Bar
                dataKey="tickets"
                fill="#f97316"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
