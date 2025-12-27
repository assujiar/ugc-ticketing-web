"use client";

import { useDepartments } from "@/hooks/useDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Department } from "@/types";

export function DepartmentsTable() {
  const { data: departments, isLoading, error } = useDepartments();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load departments</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!departments?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No departments found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Default SLA (hours)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept: Department) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium">{dept.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{dept.code}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {dept.description || "-"}
              </TableCell>
              <TableCell>{dept.default_sla_hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
