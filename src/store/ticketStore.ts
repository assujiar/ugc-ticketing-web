import { create } from "zustand";
import type { TicketStatus, DepartmentCode, TicketType } from "@/lib/constants";

interface TicketFilters {
  status: TicketStatus | "all";
  department: DepartmentCode | "all";
  type: TicketType | "all";
  search: string;
  dateFrom: string | null;
  dateTo: string | null;
  assignedToMe: boolean;
  createdByMe: boolean;
}

interface TicketState {
  filters: TicketFilters;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
  setFilters: (filters: Partial<TicketFilters>) => void;
  resetFilters: () => void;
  setSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

const defaultFilters: TicketFilters = {
  status: "all",
  department: "all",
  type: "all",
  search: "",
  dateFrom: null,
  dateTo: null,
  assignedToMe: false,
  createdByMe: false,
};

export const useTicketStore = create<TicketState>((set) => ({
  filters: defaultFilters,
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset page when filters change
    })),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}));