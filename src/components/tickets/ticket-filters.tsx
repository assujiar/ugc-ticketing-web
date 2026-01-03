"use client";

import { useCallback } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketStore } from "@/store/ticketStore";
import { useDepartments } from "@/hooks/useDashboard";
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_TYPES } from "@/lib/constants";

export function TicketFilters() {
  const { filters, search, setFilter, clearFilters, setSearch } = useTicketStore();
  const { data: departments } = useDepartments();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [setSearch]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setFilter("status", value as typeof filters.status);
    },
    [setFilter]
  );

  const handlePriorityChange = useCallback(
    (value: string) => {
      setFilter("priority", value as typeof filters.priority);
    },
    [setFilter]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setFilter("type", value as typeof filters.type);
    },
    [setFilter]
  );

  const handleDepartmentChange = useCallback(
    (value: string) => {
      setFilter("department", value);
    },
    [setFilter]
  );

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.type !== "all" ||
    filters.department !== "all" ||
    search.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(TICKET_STATUS).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(TICKET_PRIORITY).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TICKET_TYPES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.department} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
