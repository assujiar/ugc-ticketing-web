"use client";

import { useState, useCallback } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDepartments } from "@/hooks/useUsers";
import { useTicketStore } from "@/store/ticketStore";
import { debounce } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "RFQ", label: "Rate Inquiry (RFQ)" },
  { value: "GEN", label: "General (GEN)" },
];

interface TicketFiltersProps {
  showAdvanced?: boolean;
}

export function TicketFilters({ showAdvanced = true }: TicketFiltersProps) {
  const { data: departments } = useDepartments();
  const {
    filters,
    setFilter,
    clearFilters,
    setSearch,
  } = useTicketStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    [setSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== "all"
  ).length;

  const handleClearFilters = () => {
    clearFilters();
    setSearchInput("");
  };

  return (
    <div className="space-y-4">
      {/* Search and filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by code or subject..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {showAdvanced && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && showFilters && (
        <div className="glass-card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => setFilter("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={filters.department || "all"}
                onValueChange={(value) => setFilter("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.assignedToMe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("assignedToMe", !filters.assignedToMe)}
                >
                  Assigned to me
                </Button>
                <Button
                  variant={filters.createdByMe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("createdByMe", !filters.createdByMe)}
                >
                  Created by me
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter("status", "all")}
              />
            </Badge>
          )}
          {filters.type && filters.type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter("type", "all")}
              />
            </Badge>
          )}
          {filters.department && filters.department !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Dept: {filters.department}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter("department", "all")}
              />
            </Badge>
          )}
          {filters.assignedToMe && (
            <Badge variant="secondary" className="gap-1">
              Assigned to me
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter("assignedToMe", false)}
              />
            </Badge>
          )}
          {filters.createdByMe && (
            <Badge variant="secondary" className="gap-1">
              Created by me
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter("createdByMe", false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}