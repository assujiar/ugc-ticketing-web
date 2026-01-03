"use client";

import { PageHeader } from "@/components/common/page-header";
import { DepartmentsTable } from "@/components/admin/departments-table";
import { useCurrentUser } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function AdminDepartmentsPage() {
  const { isSuperAdmin, isLoading } = useCurrentUser();

  if (!isLoading && !isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="View department configuration and SLA settings"
      />
      <DepartmentsTable />
    </div>
  );
}