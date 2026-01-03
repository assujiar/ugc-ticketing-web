"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useAuth";
import { Search, Plus, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default function AdminUsersPage() {
  const { isSuperAdmin, isLoading } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!isLoading && !isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
        actions={
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <UsersTable search={search} />

      {/* Create Dialog */}
      <CreateUserDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}