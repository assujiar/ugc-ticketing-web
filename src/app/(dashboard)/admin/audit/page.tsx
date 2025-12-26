"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

const tableOptions = [
  { value: "all", label: "All Tables" },
  { value: "tickets", label: "Tickets" },
  { value: "users", label: "Users" },
  { value: "rate_quotes", label: "Quotes" },
  { value: "ticket_comments", label: "Comments" },
];

const actionOptions = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

export default function AdminAuditPage() {
  const { isSuperAdmin, isManager, isLoading } = useCurrentUser();
  const [tableName, setTableName] = useState("all");
  const [action, setAction] = useState("all");

  if (!isLoading && !isSuperAdmin && !isManager) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={tableName} onValueChange={setTableName}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by table" />
          </SelectTrigger>
          <SelectContent>
            {tableOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audit Table */}
      <AuditLogTable
        tableName={tableName !== "all" ? tableName : undefined}
        action={action !== "all" ? action : undefined}
      />
    </div>
  );
}