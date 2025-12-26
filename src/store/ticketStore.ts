import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Ticket, TicketStatus, TicketPriority, TicketType } from "@/types";

export interface TicketFilters {
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  type: TicketType | "all";
  department: string | "all";
  assignedTo: string | "all";
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface TicketPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TicketState {
  // Current ticket being viewed/edited
  currentTicket: Ticket | null;
  
  // Filters
  filters: TicketFilters;
  search: string;
  
  // Pagination
  pagination: TicketPagination;
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // View mode
  viewMode: "table" | "cards";
  
  // Actions
  setCurrentTicket: (ticket: Ticket | null) => void;
  setFilters: (filters: Partial<TicketFilters>) => void;
  setFilter: <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<TicketPagination>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setLoading: (isLoading: boolean) => void;
  setCreating: (isCreating: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
  setViewMode: (mode: "table" | "cards") => void;
  reset: () => void;
}

const defaultFilters: TicketFilters = {
  status: "all",
  priority: "all",
  type: "all",
  department: "all",
  assignedTo: "all",
  dateRange: {
    from: null,
    to: null,
  },
};

const defaultPagination: TicketPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
};

export const useTicketStore = create<TicketState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentTicket: null,
        filters: defaultFilters,
        search: "",
        pagination: defaultPagination,
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        viewMode: "table",

        // Actions
        setCurrentTicket: (ticket) => set({ currentTicket: ticket }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 },
          })),

        setFilter: (key, value) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value },
            pagination: { ...state.pagination, page: 1 },
          })),

        setSearch: (search) =>
          set((state) => ({
            search,
            pagination: { ...state.pagination, page: 1 },
          })),

        clearFilters: () =>
          set({
            filters: defaultFilters,
            search: "",
            pagination: { ...defaultPagination, page: 1 },
          }),

        setPagination: (newPagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...newPagination },
          })),

        setPage: (page) =>
          set((state) => ({
            pagination: { ...state.pagination, page },
          })),

        setPageSize: (pageSize) =>
          set((state) => ({
            pagination: { ...state.pagination, pageSize, page: 1 },
          })),

        setLoading: (isLoading) => set({ isLoading }),
        setCreating: (isCreating) => set({ isCreating }),
        setUpdating: (isUpdating) => set({ isUpdating }),
        setViewMode: (viewMode) => set({ viewMode }),

        reset: () =>
          set({
            currentTicket: null,
            filters: defaultFilters,
            search: "",
            pagination: defaultPagination,
            isLoading: false,
            isCreating: false,
            isUpdating: false,
          }),
      }),
      {
        name: "ticket-store",
        partialize: (state) => ({
          filters: state.filters,
          viewMode: state.viewMode,
          pagination: {
            pageSize: state.pagination.pageSize,
          },
        }),
      }
    ),
    { name: "TicketStore" }
  )
);
