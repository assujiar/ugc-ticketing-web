"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Ticket, Clock, CheckCircle2, AlertCircle, UserCheck,
  FileText, DollarSign, ThumbsUp, ThumbsDown, TrendingDown
} from "lucide-react";

interface LostReasonCount {
  reason: string;
  label: string;
  count: number;
}

interface StatsCardsProps {
  totalTickets: number;
  openTickets: number;
  needResponseTickets: number;
  waitingCustomerTickets: number;
  closedTickets: number;
  // Ticket types
  rfqTickets: number;
  genTickets: number;
  // RFQ outcomes
  wonTickets: number;
  lostTickets: number;
  // Lost reasons
  lostReasons: LostReasonCount[];
}

export function StatsCards({
  totalTickets,
  openTickets,
  needResponseTickets,
  waitingCustomerTickets,
  closedTickets,
  rfqTickets,
  genTickets,
  wonTickets,
  lostTickets,
  lostReasons,
}: StatsCardsProps) {
  const router = useRouter();

  const statusStats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      href: "/tickets",
    },
    {
      title: "Open",
      value: openTickets,
      icon: AlertCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      href: "/tickets?status=open",
    },
    {
      title: "Need Response",
      value: needResponseTickets,
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      href: "/tickets?status=need_response",
    },
    {
      title: "Waiting Customer",
      value: waitingCustomerTickets,
      icon: UserCheck,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      href: "/tickets?status=waiting_customer",
    },
    {
      title: "Closed",
      value: closedTickets,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      href: "/tickets?status=closed",
    },
  ];

  const typeStats = [
    {
      title: "Rate Inquiry (RFQ)",
      value: rfqTickets,
      icon: DollarSign,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      href: "/tickets?type=RFQ",
    },
    {
      title: "General Request",
      value: genTickets,
      icon: FileText,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      href: "/tickets?type=GEN",
    },
  ];

  const outcomeStats = [
    {
      title: "Won",
      value: wonTickets,
      icon: ThumbsUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      percentage: rfqTickets > 0 ? Math.round((wonTickets / (wonTickets + lostTickets || 1)) * 100) : 0,
    },
    {
      title: "Lost",
      value: lostTickets,
      icon: ThumbsDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      percentage: rfqTickets > 0 ? Math.round((lostTickets / (wonTickets + lostTickets || 1)) * 100) : 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3">By Status</h3>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statusStats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => router.push(stat.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Type & Outcome Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ticket Types */}
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">By Type</h3>
          <div className="grid gap-4 grid-cols-2">
            {typeStats.map((stat) => (
              <Card
                key={stat.title}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => router.push(stat.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RFQ Outcomes */}
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">RFQ Outcomes</h3>
          <div className="grid gap-4 grid-cols-2">
            {outcomeStats.map((stat) => (
              <Card
                key={stat.title}
                className="bg-white/5 border-white/10"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.color}`}>{stat.percentage}%</p>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Lost Reasons */}
      {lostReasons && lostReasons.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            Lost Reasons Breakdown
          </h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {lostReasons.map((reason) => (
              <Card
                key={reason.reason}
                className="bg-white/5 border-white/10"
              >
                <CardContent className="p-3">
                  <p className="text-xs text-white/60 truncate" title={reason.label}>
                    {reason.label}
                  </p>
                  <p className="text-xl font-bold mt-1 text-red-400">{reason.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
