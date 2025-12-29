"use client";

import { useState } from "react";
import { useDepartments } from "@/hooks/useDashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Department } from "@/types";

export function DepartmentsTable() {
  const queryClient = useQueryClient();
  const { data: departments, isLoading, error } = useDepartments();
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_sla_hours: 24,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("/api/admin/departments/" + id, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully");
      setEditDept(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update department");
    },
  });

  const openEdit = (dept: Department) => {
    setEditDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      default_sla_hours: dept.default_sla_hours || 24,
    });
  };

  const handleSave = () => {
    if (!editDept) return;
    updateMutation.mutate({
      id: editDept.id,
      data: formData,
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load departments</p>
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
        <p className="text-white/60">No departments found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/60">Name</TableHead>
              <TableHead className="text-white/60">Code</TableHead>
              <TableHead className="text-white/60">Description</TableHead>
              <TableHead className="text-white/60">Default SLA (hours)</TableHead>
              <TableHead className="text-white/60 w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept: Department) => (
              <TableRow key={dept.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-white/20">{dept.code}</Badge>
                </TableCell>
                <TableCell className="text-white/60">
                  {dept.description || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="font-medium">{dept.default_sla_hours || 24}h</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-white/10"
                    onClick={() => openEdit(dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDept} onOpenChange={(open) => !open && setEditDept(null)}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department settings and SLA configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/20"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                Default SLA (hours)
              </Label>
              <Input
                type="number"
                min={1}
                value={formData.default_sla_hours}
                onChange={(e) => setFormData({ ...formData, default_sla_hours: parseInt(e.target.value) || 24 })}
                className="bg-white/5 border-white/20"
              />
              <p className="text-xs text-white/40">
                Target response time for tickets assigned to this department
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDept(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
