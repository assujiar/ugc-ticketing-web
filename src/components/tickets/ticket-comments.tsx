"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  DollarSign, 
  Clock,
  Timer,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  User,
  Building2
} from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  type: "comment" | "response" | "quote" | "status_change";
  quoted_price?: number;
  response_time_seconds?: number;
  response_direction?: "to_creator" | "to_department";
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  metadata?: any;
}

interface TicketCommentsProps {
  ticketId: string;
  creatorId?: string;
}

function formatResponseTime(seconds: number): string {
  if (!seconds || seconds < 0) return "-";
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function getResponseTimeColor(seconds: number): string {
  if (!seconds) return "text-white/40";
  const hours = seconds / 3600;
  if (hours <= 1) return "text-green-400";
  if (hours <= 4) return "text-blue-400";
  if (hours <= 24) return "text-yellow-400";
  return "text-red-400";
}

export function TicketComments({ ticketId, creatorId }: TicketCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (window as any).refreshComments = fetchComments;
    return () => {
      delete (window as any).refreshComments;
    };
  }, [ticketId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "quote":
        return <DollarSign className="h-4 w-4 text-green-400" />;
      case "status_change":
        return <RotateCcw className="h-4 w-4 text-yellow-400" />;
      case "response":
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "quote":
        return <Badge className="bg-green-500/20 text-green-400 text-xs">Quote</Badge>;
      case "status_change":
        return <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Status Update</Badge>;
      case "response":
        return <Badge className="bg-purple-500/20 text-purple-400 text-xs">Response</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 text-xs">Comment</Badge>;
    }
  };

  const getDirectionBadge = (direction: string | undefined, isCreator: boolean) => {
    if (direction === "to_creator") {
      return (
        <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-400">
          <Building2 className="h-3 w-3" />
          <ArrowRight className="h-3 w-3" />
          <User className="h-3 w-3" />
        </Badge>
      );
    } else if (direction === "to_department") {
      return (
        <Badge variant="outline" className="text-xs gap-1 border-orange-500/30 text-orange-400">
          <User className="h-3 w-3" />
          <ArrowRight className="h-3 w-3" />
          <Building2 className="h-3 w-3" />
        </Badge>
      );
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate stats
  const stats = {
    totalComments: comments.length,
    deptResponses: comments.filter(c => c.response_direction === "to_creator").length,
    creatorResponses: comments.filter(c => c.response_direction === "to_department").length,
    avgDeptResponseTime: 0,
    avgCreatorResponseTime: 0,
  };

  const deptTimes = comments
    .filter(c => c.response_direction === "to_creator" && c.response_time_seconds)
    .map(c => c.response_time_seconds!);
  const creatorTimes = comments
    .filter(c => c.response_direction === "to_department" && c.response_time_seconds)
    .map(c => c.response_time_seconds!);

  if (deptTimes.length > 0) {
    stats.avgDeptResponseTime = Math.round(deptTimes.reduce((a, b) => a + b, 0) / deptTimes.length);
  }
  if (creatorTimes.length > 0) {
    stats.avgCreatorResponseTime = Math.round(creatorTimes.reduce((a, b) => a + b, 0) / creatorTimes.length);
  }

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        
        {/* Response Time Stats */}
        {comments.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-xs text-purple-400 mb-1">
                <Building2 className="h-3 w-3" />
                <ArrowRight className="h-3 w-3" />
                <User className="h-3 w-3" />
                <span>Dept Response</span>
              </div>
              <p className="text-lg font-bold text-purple-400">
                {formatResponseTime(stats.avgDeptResponseTime)}
              </p>
              <p className="text-xs text-white/40">{stats.deptResponses} responses</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 text-xs text-orange-400 mb-1">
                <User className="h-3 w-3" />
                <ArrowRight className="h-3 w-3" />
                <Building2 className="h-3 w-3" />
                <span>Creator Response</span>
              </div>
              <p className="text-lg font-bold text-orange-400">
                {formatResponseTime(stats.avgCreatorResponseTime)}
              </p>
              <p className="text-xs text-white/40">{stats.creatorResponses} responses</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">Be the first to respond to this ticket</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
            
            <div className="space-y-6">
              {comments.map((comment) => {
                const isFromCreator = comment.response_direction === "to_department";
                
                return (
                  <div key={comment.id} className="relative flex gap-4">
                    <div className="relative z-10">
                      <Avatar className={`h-10 w-10 border-2 border-slate-800 ${
                        isFromCreator ? "bg-orange-500/20" : "bg-purple-500/20"
                      }`}>
                        <AvatarFallback className={`text-sm ${
                          isFromCreator ? "text-orange-400" : "text-purple-400"
                        }`}>
                          {getInitials(comment.user?.full_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">
                          {comment.user?.full_name || "Unknown"}
                        </span>
                        {getTypeBadge(comment.type)}
                        {getDirectionBadge(comment.response_direction, isFromCreator)}
                        
                        {comment.response_time_seconds && comment.response_time_seconds > 0 && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs gap-1 ${getResponseTimeColor(comment.response_time_seconds)}`}
                          >
                            <Timer className="h-3 w-3" />
                            {formatResponseTime(comment.response_time_seconds)}
                          </Badge>
                        )}
                      </div>
                      
                      <span className="text-xs text-white/40">
                        {formatDateTime(comment.created_at)}
                      </span>
                      
                      {comment.type === "quote" && comment.quoted_price && (
                        <div className="mt-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-5 w-5 text-green-400" />
                            <span className="text-sm text-white/60">Quoted Price</span>
                          </div>
                          <p className="text-2xl font-bold text-green-400">
                            {formatCurrency(comment.quoted_price, "IDR")}
                          </p>
                        </div>
                      )}
                      
                      {comment.content && (
                        <div className={`mt-2 p-3 rounded-lg border ${
                          isFromCreator 
                            ? "bg-orange-500/5 border-orange-500/20" 
                            : "bg-purple-500/5 border-purple-500/20"
                        }`}>
                          <p className="text-sm text-white/80 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
