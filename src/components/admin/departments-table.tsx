"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments } from "@/hooks/useUsers";
import { Building2 } from "lucide-react";

export function DepartmentsTable() {
  const { data: departments, isLoading } = useDepartments();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Department</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments?.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{dept.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{dept.code}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                Handles {dept.code} related tickets
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}