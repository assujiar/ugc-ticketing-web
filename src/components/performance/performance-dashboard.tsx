"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Users, Building2, TrendingUp, Timer, Trophy, XCircle, ArrowRight, User, MessageSquare, DollarSign, Info, Shield, Eye } from "lucide-react";
import { useUserPerformance, useDepartmentPerformance, useTicketPerformance } from "@/hooks/usePerformance";
import { useDepartments } from "@/hooks/useDashboard";
import { useCurrentUser } from "@/hooks/useAuth";

function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return "-";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function getColor(hours: number | null, threshold: number): string {
  if (hours === null) return "text-white/40";
  if (hours <= threshold) return "text-green-400";
  if (hours <= threshold * 2) return "text-yellow-400";
  return "text-red-400";
}

function MetricBox({ label, value, subValue, color = "blue" }: { label: string; value: string; subValue?: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20",
    green: "bg-green-500/10 border-green-500/20",
    purple: "bg-purple-500/10 border-purple-500/20",
    orange: "bg-orange-500/10 border-orange-500/20",
    yellow: "bg-yellow-500/10 border-yellow-500/20",
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {subValue && <p className="text-xs text-white/40">{subValue}</p>}
    </div>
  );
}

function RoleInfoBanner({ isSuperAdmin, isManager, profile }: { isSuperAdmin: boolean; isManager: boolean; profile: any }) {
  if (isSuperAdmin) {
    return (
      <Alert className="bg-purple-500/10 border-purple-500/30">
        <Shield className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-purple-200">
          <span className="font-medium">Super Admin View:</span> Anda melihat data performa semua departemen dan semua user.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isManager) {
    return (
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Eye className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <span className="font-medium">Manager View:</span> Anda melihat data performa departemen <span className="font-semibold">{profile?.departments?.name || "Anda"}</span>.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-orange-500/10 border-orange-500/30">
      <Info className="h-4 w-4 text-orange-400" />
      <AlertDescription className="text-orange-200">
        <span className="font-medium">Personal View:</span> Anda hanya melihat data performa pribadi Anda. Hubungi manager untuk melihat data departemen.
      </AlertDescription>
    </Alert>
  );
}

export function PerformanceDashboard() {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const { profile, isSuperAdmin, isManager } = useCurrentUser();
  const { data: departments } = useDepartments();
  const { data: userPerf, isLoading: usersLoading } = useUserPerformance(
    isSuperAdmin && selectedDept !== "all" ? selectedDept : undefined
  );
  const { data: deptPerf, isLoading: deptLoading } = useDepartmentPerformance();
  const { data: ticketPerf, isLoading: ticketsLoading } = useTicketPerformance(
    isSuperAdmin && selectedDept !== "all" ? selectedDept : undefined
  );

  const canFilterDepartment = isSuperAdmin;
  const roleName = profile?.roles?.name || "user";

  return (
    <div className="space-y-6">
      {/* Header with Role Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Performance Metrics
            <Badge variant="outline" className="text-xs font-normal">
              {roleName.replace(/_/g, " ")}
            </Badge>
          </h2>
          <p className="text-white/60">Response time analytics dalam jam kerja (08:00-17:00, Senin-Jumat)</p>
        </div>
        
        {/* Department Filter - Only for Super Admin */}
        {canFilterDepartment && (
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Role Info Banner */}
      <RoleInfoBanner isSuperAdmin={isSuperAdmin} isManager={isManager} profile={profile} />

      <Tabs defaultValue={isSuperAdmin || isManager ? "departments" : "users"} className="space-y-4">
        <TabsList className="bg-white/5">
          {(isSuperAdmin || isManager) && (
            <TabsTrigger value="departments"><Building2 className="h-4 w-4 mr-2" />Departments</TabsTrigger>
          )}
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />
            {isSuperAdmin || isManager ? "Users" : "My Performance"}
          </TabsTrigger>
          <TabsTrigger value="tickets"><TrendingUp className="h-4 w-4 mr-2" />
            {isSuperAdmin || isManager ? "Tickets" : "My Tickets"}
          </TabsTrigger>
        </TabsList>

        {/* DEPARTMENTS TAB - Admin/Manager only */}
        {(isSuperAdmin || isManager) && (
          <TabsContent value="departments" className="space-y-4">
            {deptLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-[400px]" />)}
              </div>
            ) : deptPerf?.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-white/20 mb-4" />
                  <p className="text-white/60">Tidak ada data departemen</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptPerf?.map((dept: any) => (
                  <Card key={dept.department_id} className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5" />{dept.department_name}
                      </CardTitle>
                      <CardDescription>{dept.department_code} • {dept.total_tickets} tickets</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Win/Loss */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-blue-500/10">
                          <p className="text-lg font-bold">{dept.closed_tickets}</p>
                          <p className="text-xs text-white/40">Closed</p>
                        </div>
                        <div className="p-2 rounded bg-green-500/10">
                          <Trophy className="h-4 w-4 mx-auto text-green-400" />
                          <p className="text-lg font-bold text-green-400">{dept.won_tickets}</p>
                          <p className="text-xs text-white/40">Won</p>
                        </div>
                        <div className="p-2 rounded bg-red-500/10">
                          <XCircle className="h-4 w-4 mx-auto text-red-400" />
                          <p className="text-lg font-bold text-red-400">{dept.lost_tickets}</p>
                          <p className="text-xs text-white/40">Lost</p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-3">
                        {/* First Response */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/60 flex items-center gap-1"><Clock className="h-3 w-3" />First Response</span>
                            <span className={getColor(dept.median_first_response_hours, 4)}>{formatHours(dept.median_first_response_hours)} median</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${dept.first_response_sla_pct || 0}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-white/40 mt-1">
                            <span>{dept.first_response_sla_pct?.toFixed(0) || 0}% within 4h</span>
                            <span>P90: {formatHours(dept.p90_first_response_hours)}</span>
                          </div>
                        </div>

                        {/* First Quote */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/60 flex items-center gap-1"><DollarSign className="h-3 w-3" />First Quote</span>
                            <span className={getColor(dept.median_first_quote_hours, 24)}>{formatHours(dept.median_first_quote_hours)} median</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dept.first_quote_sla_pct || 0}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-white/40 mt-1">
                            <span>{dept.first_quote_sla_pct?.toFixed(0) || 0}% within 24h</span>
                            <span>P90: {formatHours(dept.p90_first_quote_hours)}</span>
                          </div>
                        </div>

                        {/* Resolution */}
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60 flex items-center gap-1"><Timer className="h-3 w-3" />Resolution</span>
                            <span className={getColor(dept.median_resolution_hours, 48)}>{formatHours(dept.median_resolution_hours)} median</span>
                          </div>
                        </div>

                        {/* Stage Response */}
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60 flex items-center gap-1"><MessageSquare className="h-3 w-3" />Avg Stage Response</span>
                            <span className={getColor(dept.avg_dept_stage_response_hours, 4)}>{formatHours(dept.avg_dept_stage_response_hours)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          {usersLoading ? <Skeleton className="h-[500px]" /> : (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isSuperAdmin || isManager ? "User Response Performance" : "My Response Performance"}
                  {!(isSuperAdmin || isManager) && (
                    <Badge className="bg-orange-500/20 text-orange-400">Personal</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isSuperAdmin 
                    ? "Data semua user - Semua waktu dalam business hours"
                    : isManager 
                      ? `Data user departemen ${profile?.departments?.name || ""} - Semua waktu dalam business hours`
                      : "Data performa Anda - Semua waktu dalam business hours"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userPerf?.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-white/20 mb-4" />
                    <p className="text-white/60">Belum ada data response</p>
                    <p className="text-white/40 text-sm mt-1">Data akan muncul setelah ada aktivitas response di tiket</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-left">
                            <th className="py-3 px-2 text-white/60">User</th>
                            <th className="py-3 px-2 text-white/60 text-center">Dept</th>
                            <th className="py-3 px-2 text-white/60 text-center" title="Total valid responses">Responses</th>
                            <th className="py-3 px-2 text-white/60 text-center" title="Average response time (all)">Avg All</th>
                            <th className="py-3 px-2 text-white/60 text-center" title="Median response time">Median</th>
                            <th className="py-3 px-2 text-white/60 text-center" title="90th percentile">P90</th>
                            <th className="py-3 px-2 text-white/60 text-center" title="Avg response ke creator (sebagai dept)">
                              <span className="flex items-center justify-center gap-1"><Building2 className="h-3 w-3" /><ArrowRight className="h-3 w-3" /><User className="h-3 w-3" /></span>
                            </th>
                            <th className="py-3 px-2 text-white/60 text-center" title="Avg response ke dept (sebagai creator)">
                              <span className="flex items-center justify-center gap-1"><User className="h-3 w-3" /><ArrowRight className="h-3 w-3" /><Building2 className="h-3 w-3" /></span>
                            </th>
                            <th className="py-3 px-2 text-white/60 text-center" title="First response (dept)">1st Resp</th>
                            <th className="py-3 px-2 text-white/60 text-center">Quotes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userPerf?.filter((u: any) => u.total_responses > 0 || u.total_quotes_submitted > 0).map((u: any) => (
                            <tr key={u.user_id} className={`border-b border-white/5 hover:bg-white/5 ${u.user_id === profile?.id ? "bg-orange-500/10" : ""}`}>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{u.full_name}</p>
                                  {u.user_id === profile?.id && (
                                    <Badge className="bg-orange-500/20 text-orange-400 text-xs">You</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-white/40">{u.role_display_name}</p>
                              </td>
                              <td className="py-3 px-2 text-center"><Badge variant="outline">{u.department_code || "-"}</Badge></td>
                              <td className="py-3 px-2 text-center font-medium">{u.total_responses}</td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.avg_response_hours, 4)}>{formatHours(u.avg_response_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.median_response_hours, 4)}>{formatHours(u.median_response_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.p90_response_hours, 8)}>{formatHours(u.p90_response_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.avg_response_to_creator_hours, 4)}>{formatHours(u.avg_response_to_creator_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.avg_response_to_dept_hours, 4)}>{formatHours(u.avg_response_to_dept_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className={getColor(u.avg_first_response_hours, 4)}>{formatHours(u.avg_first_response_hours)}</span></td>
                              <td className="py-3 px-2 text-center"><span className="text-purple-400">{u.total_quotes_submitted}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-3 rounded bg-white/5 text-xs text-white/60">
                      <p className="font-medium mb-1">Legend:</p>
                      <div className="flex flex-wrap gap-4">
                        <span><Building2 className="h-3 w-3 inline mr-1" />→<User className="h-3 w-3 inline ml-1" /> = Dept staff responding to creator</span>
                        <span><User className="h-3 w-3 inline mr-1" />→<Building2 className="h-3 w-3 inline ml-1" /> = Creator responding to dept</span>
                        <span>1st Resp = First response time (from ticket creation)</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TICKETS TAB */}
        <TabsContent value="tickets" className="space-y-4">
          {ticketsLoading ? <Skeleton className="h-[500px]" /> : (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isSuperAdmin || isManager ? "Ticket Response Details" : "My Ticket Response Details"}
                  {!(isSuperAdmin || isManager) && (
                    <Badge className="bg-orange-500/20 text-orange-400">Personal</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isSuperAdmin 
                    ? "Per-ticket response time breakdown - semua tiket"
                    : isManager 
                      ? `Per-ticket response time breakdown - departemen ${profile?.departments?.name || ""}`
                      : "Per-ticket response time breakdown - tiket yang Anda buat atau handle"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticketPerf?.length === 0 ? (
                  <div className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-white/20 mb-4" />
                    <p className="text-white/60">Belum ada data tiket</p>
                    <p className="text-white/40 text-sm mt-1">Data akan muncul setelah ada tiket dengan aktivitas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="py-3 px-2 text-white/60">Ticket</th>
                          <th className="py-3 px-2 text-white/60">Dept</th>
                          <th className="py-3 px-2 text-white/60 text-center">Status</th>
                          <th className="py-3 px-2 text-white/60 text-center" title="First response from dept">1st Response</th>
                          <th className="py-3 px-2 text-white/60 text-center" title="First quote submitted">1st Quote</th>
                          <th className="py-3 px-2 text-white/60 text-center" title="Avg dept stage response">Avg Dept</th>
                          <th className="py-3 px-2 text-white/60 text-center" title="Avg creator stage response">Avg Creator</th>
                          <th className="py-3 px-2 text-white/60 text-center" title="Total resolution time">Resolution</th>
                          <th className="py-3 px-2 text-white/60 text-center">Activities</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketPerf?.map((t: any) => (
                          <tr key={t.ticket_id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-2">
                              <p className="font-mono text-xs font-medium">{t.ticket_code}</p>
                              <p className="text-xs text-white/40">{t.creator_name}</p>
                            </td>
                            <td className="py-3 px-2"><Badge variant="outline">{t.department_code}</Badge></td>
                            <td className="py-3 px-2 text-center">
                              <Badge className={
                                t.close_outcome === "won" ? "bg-green-500/20 text-green-400" :
                                t.close_outcome === "lost" ? "bg-red-500/20 text-red-400" :
                                t.status === "closed" ? "bg-gray-500/20" : "bg-blue-500/20 text-blue-400"
                              }>{t.close_outcome || t.status}</Badge>
                            </td>
                            <td className="py-3 px-2 text-center"><span className={getColor(t.first_response_hours, 4)}>{formatHours(t.first_response_hours)}</span></td>
                            <td className="py-3 px-2 text-center"><span className={getColor(t.first_quote_hours, 24)}>{formatHours(t.first_quote_hours)}</span></td>
                            <td className="py-3 px-2 text-center"><span className={getColor(t.avg_dept_response_hours, 4)}>{formatHours(t.avg_dept_response_hours)}</span></td>
                            <td className="py-3 px-2 text-center"><span className={getColor(t.avg_creator_response_hours, 4)}>{formatHours(t.avg_creator_response_hours)}</span></td>
                            <td className="py-3 px-2 text-center"><span className={getColor(t.resolution_hours, 48)}>{formatHours(t.resolution_hours)}</span></td>
                            <td className="py-3 px-2 text-center text-white/60">{t.total_activities}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
