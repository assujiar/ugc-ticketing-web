export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role_id: string;
          department_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role_id: string;
          department_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role_id?: string;
          department_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          }
        ];
      };

      roles: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      departments: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          default_sla_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          default_sla_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          default_sla_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      tickets: {
        Row: {
          id: string;
          ticket_code: string;
          ticket_type: "RFQ" | "GEN";
          status: "open" | "need_response" | "in_progress" | "waiting_customer" | "need_adjustment" | "pending" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          subject: string;
          description: string | null;
          department_id: string;
          created_by: string;
          assigned_to: string | null;
          rfq_data: Json | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          closed_at: string | null;
          close_outcome: "won" | "lost" | null;
          close_reason: string | null;
          competitor_name: string | null;
          competitor_cost: number | null;
        };
        Insert: {
          id?: string;
          ticket_code: string;
          ticket_type: "RFQ" | "GEN";
          status?: "open" | "need_response" | "in_progress" | "waiting_customer" | "need_adjustment" | "pending" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          subject: string;
          description?: string | null;
          department_id: string;
          created_by: string;
          assigned_to?: string | null;
          rfq_data?: Json | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
          close_outcome?: "won" | "lost" | null;
          close_reason?: string | null;
          competitor_name?: string | null;
          competitor_cost?: number | null;
        };
        Update: {
          id?: string;
          ticket_code?: string;
          ticket_type?: "RFQ" | "GEN";
          status?: "open" | "need_response" | "in_progress" | "waiting_customer" | "need_adjustment" | "pending" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          subject?: string;
          description?: string | null;
          department_id?: string;
          created_by?: string;
          assigned_to?: string | null;
          rfq_data?: Json | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          closed_at?: string | null;
          close_outcome?: "won" | "lost" | null;
          close_reason?: string | null;
          competitor_name?: string | null;
          competitor_cost?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      ticket_comments: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          content: string;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          content: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          content?: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey";
            columns: ["ticket_id"];
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      ticket_attachments: {
        Row: {
          id: string;
          ticket_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey";
            columns: ["ticket_id"];
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey";
            columns: ["uploaded_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      ticket_assignments: {
        Row: {
          id: string;
          ticket_id: string;
          assigned_to: string;
          assigned_by: string;
          assigned_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          assigned_to: string;
          assigned_by: string;
          assigned_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          assigned_to?: string;
          assigned_by?: string;
          assigned_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey";
            columns: ["ticket_id"];
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_assignments_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      rate_quotes: {
        Row: {
          id: string;
          ticket_id: string;
          quote_number: string;
          amount: number;
          currency: string;
          valid_until: string;
          terms: string | null;
          status: "draft" | "sent" | "accepted" | "rejected";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          quote_number: string;
          amount: number;
          currency?: string;
          valid_until: string;
          terms?: string | null;
          status?: "draft" | "sent" | "accepted" | "rejected";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          quote_number?: string;
          amount?: number;
          currency?: string;
          valid_until?: string;
          terms?: string | null;
          status?: "draft" | "sent" | "accepted" | "rejected";
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rate_quotes_ticket_id_fkey";
            columns: ["ticket_id"];
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rate_quotes_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      sla_tracking: {
        Row: {
          id: string;
          ticket_id: string;
          first_response_at: string | null;
          first_response_sla_hours: number;
          first_response_met: boolean | null;
          resolution_at: string | null;
          resolution_sla_hours: number;
          resolution_met: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          first_response_at?: string | null;
          first_response_sla_hours?: number;
          first_response_met?: boolean | null;
          resolution_at?: string | null;
          resolution_sla_hours?: number;
          resolution_met?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          first_response_at?: string | null;
          first_response_sla_hours?: number;
          first_response_met?: boolean | null;
          resolution_at?: string | null;
          resolution_sla_hours?: number;
          resolution_met?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sla_tracking_ticket_id_fkey";
            columns: ["ticket_id"];
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: "create" | "update" | "delete";
          old_data: Json | null;
          new_data: Json | null;
          user_id: string;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: "create" | "update" | "delete";
          old_data?: Json | null;
          new_data?: Json | null;
          user_id: string;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: "create" | "update" | "delete";
          old_data?: Json | null;
          new_data?: Json | null;
          user_id?: string;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      assign_ticket: {
        Args: {
          p_ticket_id: string;
          p_assigned_to: string;
          p_assigned_by: string;
          p_notes: string;
        };
        Returns: Database["public"]["Tables"]["tickets"]["Row"];
      };

      calculate_volume: {
        Args: {
          p_length: number;
          p_width: number;
          p_height: number;
          p_quantity: number;
        };
        Returns: Json;
      };

      close_ticket: {
        Args: {
          p_ticket_id: string;
          p_status: string;
          p_outcome?: string;
          p_reason?: string;
          p_competitor_name?: string;
          p_competitor_cost?: number;
        };
        Returns: Database["public"]["Tables"]["tickets"]["Row"];
      };

      create_audit_log: {
        Args: {
          p_table_name: string;
          p_record_id: string;
          p_action: string;
          p_old_data: Json;
          p_new_data: Json;
          p_user_id: string;
          p_ip_address: string;
        };
        Returns: Database["public"]["Tables"]["audit_logs"]["Row"];
      };

      create_ticket: {
        Args: {
          p_ticket_type: string;
          p_subject: string;
          p_description: string;
          p_department_id: string;
          p_created_by: string;
          p_priority: string;
          p_rfq_data: Json;
        };
        Returns: Database["public"]["Tables"]["tickets"]["Row"];
      };

      generate_quote_number: {
        Args: {
          p_ticket_id: string;
        };
        Returns: string;
      };

      generate_ticket_code: {
        Args: {
          p_ticket_type: string;
          p_department_code: string;
        };
        Returns: string;
      };

      get_dashboard_summary: {
        Args: {
          p_user_id: string;
          p_department_id: string;
        };
        Returns: Json;
      };

      get_sla_metrics: {
        Args: {
          p_user_id: string;
          p_department_id: string;
          p_days: number;
        };
        Returns: Json;
      };

      get_user_department: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };

      get_user_role: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };

      is_manager: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };

      is_staff: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };

      is_super_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };

      log_audit: {
        Args: {
          p_table_name: string;
          p_record_id: string;
          p_action: string;
          p_old_data: Json;
          p_new_data: Json;
          p_user_id: string;
          p_ip_address: string;
        };
        Returns: void;
      };

      update_sla_tracking: {
        Args: {
          p_ticket_id: string;
          p_event_type: string;
        };
        Returns: Database["public"]["Tables"]["sla_tracking"]["Row"];
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];

// Common derived app types
export type TicketType = Tables<"tickets">["ticket_type"];
export type TicketStatus = Tables<"tickets">["status"];
export type TicketPriority = Tables<"tickets">["priority"];
export type CloseOutcome = Tables<"tickets">["close_outcome"];

export type RoleLite = Pick<Tables<"roles">, "id" | "name" | "display_name">;
export type DepartmentLite = Pick<Tables<"departments">, "id" | "code" | "name">;

export type UserProfileComplete = Tables<"users"> & {
  roles?: RoleLite | null;
  departments?: DepartmentLite | null;
};
