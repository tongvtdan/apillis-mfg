export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          actor_id: string | null
          details: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: unknown | null
          session_id: string | null
          success: boolean
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          details?: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          details?: Json | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          display_name: string
          id: string
          last_login: string | null
          locked_until: string | null
          login_attempts: number
          password_last_changed: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          display_name: string
          id?: string
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number
          password_last_changed?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          display_name?: string
          id?: string
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number
          password_last_changed?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          new_values: Json | null
          old_values: Json | null
          project_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          project_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          file_size: number | null
          file_type: string | null
          file_url: string | null
          filename: string
          id: string
          is_latest: boolean | null
          project_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename: string
          id?: string
          is_latest?: boolean | null
          project_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename?: string
          id?: string
          is_latest?: boolean | null
          project_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_metrics: {
        Row: {
          created_at: string
          id: string
          phase_end: string | null
          phase_name: string
          phase_start: string
          project_id: string
          time_spent: unknown | null
        }
        Insert: {
          created_at?: string
          id?: string
          phase_end?: string | null
          phase_name: string
          phase_start: string
          project_id: string
          time_spent?: unknown | null
        }
        Update: {
          created_at?: string
          id?: string
          phase_end?: string | null
          phase_name?: string
          phase_start?: string
          project_id?: string
          time_spent?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "project_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assignee_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          days_in_stage: number | null
          description: string | null
          due_date: string | null
          engineering_reviewer_id: string | null
          estimated_value: number | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["project_priority"]
          priority_score: number | null
          production_reviewer_id: string | null
          project_id: string
          qa_reviewer_id: string | null
          review_summary: Json | null
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          priority_score?: number | null
          production_reviewer_id?: string | null
          project_id: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          priority_score?: number | null
          production_reviewer_id?: string | null
          project_id?: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          new_values: Json | null
          old_values: Json | null
          rfq_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          rfq_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          rfq_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_activities_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_attachments: {
        Row: {
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          rfq_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          rfq_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          rfq_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_attachments_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_clarifications: {
        Row: {
          created_at: string
          description: string
          id: string
          project_id: string | null
          requested_by: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          rfq_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          project_id?: string | null
          requested_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rfq_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          project_id?: string | null
          requested_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rfq_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_clarifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_internal_reviews: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["user_role"]
          feedback: string | null
          id: string
          project_id: string | null
          reviewer_id: string | null
          rfq_id: string
          status: Database["public"]["Enums"]["review_status"]
          submitted_at: string | null
          submitted_by: string | null
          suggestions: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["user_role"]
          feedback?: string | null
          id?: string
          project_id?: string | null
          reviewer_id?: string | null
          rfq_id: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          suggestions?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["user_role"]
          feedback?: string | null
          id?: string
          project_id?: string | null
          reviewer_id?: string | null
          rfq_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          suggestions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_internal_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_risks: {
        Row: {
          category: Database["public"]["Enums"]["risk_category"]
          created_at: string
          created_by: string | null
          description: string
          id: string
          mitigation_plan: string | null
          project_id: string | null
          review_id: string | null
          rfq_id: string
          severity: Database["public"]["Enums"]["risk_severity"]
        }
        Insert: {
          category: Database["public"]["Enums"]["risk_category"]
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          mitigation_plan?: string | null
          project_id?: string | null
          review_id?: string | null
          rfq_id: string
          severity: Database["public"]["Enums"]["risk_severity"]
        }
        Update: {
          category?: Database["public"]["Enums"]["risk_category"]
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          mitigation_plan?: string | null
          project_id?: string | null
          review_id?: string | null
          rfq_id?: string
          severity?: Database["public"]["Enums"]["risk_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "rfq_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          assignee_id: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          days_in_stage: number | null
          description: string | null
          due_date: string | null
          engineering_reviewer_id: string | null
          estimated_value: number | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["rfq_priority"]
          production_reviewer_id: string | null
          project_name: string
          qa_reviewer_id: string | null
          review_summary: Json | null
          rfq_number: string
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["rfq_status"]
          tags: string[] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_id?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["rfq_priority"]
          production_reviewer_id?: string | null
          project_name: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          rfq_number: string
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["rfq_status"]
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_id?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["rfq_priority"]
          production_reviewer_id?: string | null
          project_name?: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          rfq_number?: string
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["rfq_status"]
          tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          stage_order: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          stage_order: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          stage_order?: number
        }
        Relationships: []
      }
      workflow_transitions: {
        Row: {
          allowed_roles: Database["public"]["Enums"]["user_role"][] | null
          created_at: string
          from_stage_id: string | null
          id: string
          to_stage_id: string | null
        }
        Insert: {
          allowed_roles?: Database["public"]["Enums"]["user_role"][] | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string | null
        }
        Update: {
          allowed_roles?: Database["public"]["Enums"]["user_role"][] | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_project_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_rfq_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      audit_event_type:
        | "login_success"
        | "login_failure"
        | "logout"
        | "role_change"
        | "password_change"
        | "account_locked"
        | "account_unlocked"
        | "profile_update"
      project_priority: "low" | "medium" | "high" | "urgent"
      project_status:
        | "inquiry"
        | "review"
        | "quoted"
        | "won"
        | "lost"
        | "production"
        | "completed"
        | "cancelled"
      review_status: "pending" | "approved" | "rejected" | "revision_requested"
      rfq_priority: "low" | "medium" | "high" | "urgent"
      rfq_status:
        | "inquiry"
        | "review"
        | "quote"
        | "production"
        | "completed"
        | "cancelled"
      risk_category: "technical" | "timeline" | "cost" | "quality"
      risk_severity: "low" | "medium" | "high"
      user_role:
        | "Customer"
        | "Procurement Owner"
        | "Engineering"
        | "QA"
        | "Production"
        | "Supplier"
        | "Management"
        | "Procurement"
      user_status: "Active" | "Inactive" | "Pending" | "Locked" | "Dormant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_event_type: [
        "login_success",
        "login_failure",
        "logout",
        "role_change",
        "password_change",
        "account_locked",
        "account_unlocked",
        "profile_update",
      ],
      project_priority: ["low", "medium", "high", "urgent"],
      project_status: [
        "inquiry",
        "review",
        "quoted",
        "won",
        "lost",
        "production",
        "completed",
        "cancelled",
      ],
      review_status: ["pending", "approved", "rejected", "revision_requested"],
      rfq_priority: ["low", "medium", "high", "urgent"],
      rfq_status: [
        "inquiry",
        "review",
        "quote",
        "production",
        "completed",
        "cancelled",
      ],
      risk_category: ["technical", "timeline", "cost", "quality"],
      risk_severity: ["low", "medium", "high"],
      user_role: [
        "Customer",
        "Procurement Owner",
        "Engineering",
        "QA",
        "Production",
        "Supplier",
        "Management",
        "Procurement",
      ],
      user_status: ["Active", "Inactive", "Pending", "Locked", "Dormant"],
    },
  },
} as const
