"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuditLogs } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface AuditLogTableProps {
  tableName?: string;
  action?: string;
}

const actionColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  create: "success",
  update: "warning",
  delete: "destructive",
};

export function AuditLogTable({ tableName, action }: AuditLogTableProps) {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading } = useAuditLogs({ page, table_name: tableName, action });

  const logs = data?.data || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead className="w-[80px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">{formatDateTime(log.created_at)}</TableCell>
                  <TableCell>{log.users?.full_name || "System"}</TableCell>
                  <TableCell><Badge variant="outline">{log.table_name}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={actionColors[log.action] || "default"}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.record_id?.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Table:</span> {selectedLog.table_name}</div>
                <div><span className="text-muted-foreground">Action:</span> {selectedLog.action}</div>
                <div><span className="text-muted-foreground">User:</span> {selectedLog.users?.full_name}</div>
                <div><span className="text-muted-foreground">IP:</span> {selectedLog.ip_address || "N/A"}</div>
              </div>
              {selectedLog.old_data && (
                <div>
                  <h4 className="font-medium mb-2">Previous Data</h4>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.new_data && (
                <div>
                  <h4 className="font-medium mb-2">New Data</h4>
                  <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}