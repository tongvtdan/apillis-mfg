export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
          project_id: string | null  // Added project_id column
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
          project_id?: string | null  // Added project_id column
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
          project_id?: string | null  // Added project_id column
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          ai_capabilities: string[] | null
          ai_category: Json | null
          ai_last_analyzed: string | null
          ai_risk_score: number | null
          city: string | null
          company_name: string
          contact_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          type: Database["public"]["Enums"]["contact_type"]
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          ai_capabilities?: string[] | null
          ai_category?: Json | null
          ai_last_analyzed?: string | null
          ai_risk_score?: number | null
          city?: string | null
          company_name: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          type: Database["public"]["Enums"]["contact_type"]
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          ai_capabilities?: string[] | null
          ai_category?: Json | null
          ai_last_analyzed?: string | null
          ai_risk_score?: number | null
          city?: string | null
          company_name?: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_level: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_current_version: boolean | null
          metadata: Json | null
          mime_type: string | null
          organization_id: string
          project_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          access_level?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id: string
          project_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          access_level?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string
          project_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          organization_id: string
          parent_message_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          project_id: string | null
          read_at: string | null
          recipient_id: string | null
          recipient_type: string | null
          sender_id: string
          status: string | null
          subject: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          organization_id: string
          parent_message_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          sender_id: string
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          organization_id?: string
          parent_message_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          sender_id?: string
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          subscription_plan:
          | Database["public"]["Enums"]["subscription_plan"]
          | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          subscription_plan?:
          | Database["public"]["Enums"]["subscription_plan"]
          | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_plan?:
          | Database["public"]["Enums"]["subscription_plan"]
          | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sub_stage_progress: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string
          project_id: string
          started_at: string | null
          status: string | null
          sub_stage_id: string
          updated_at: string | null
          workflow_stage_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          project_id: string
          started_at?: string | null
          status?: string | null
          sub_stage_id: string
          updated_at?: string | null
          workflow_stage_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          project_id?: string
          started_at?: string | null
          status?: string | null
          sub_stage_id?: string
          updated_at?: string | null
          workflow_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sub_stage_progress_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sub_stage_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sub_stage_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sub_stage_progress_sub_stage_id_fkey"
            columns: ["sub_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_sub_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sub_stage_progress_workflow_stage_id_fkey"
            columns: ["workflow_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_delivery_date: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          current_stage_id: string | null
          customer_id: string | null
          description: string | null
          estimated_delivery_date: string | null
          estimated_value: number | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          priority_score: number | null
          project_id: string
          project_type: string | null
          intake_type: Database["public"]["Enums"]["intake_type"] | null
          intake_source: string | null
          source: string | null
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          volume: Json | null
          target_price_per_unit: number | null
          project_reference: string | null
          desired_delivery_date: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage_id?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_delivery_date?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          priority_score?: number | null
          project_id: string
          project_type?: string | null
          intake_type?: Database["public"]["Enums"]["intake_type"] | null
          intake_source?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          volume?: Json | null
          target_price_per_unit?: number | null
          project_reference?: string | null
          desired_delivery_date?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage_id?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_delivery_date?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          priority_score?: number | null
          project_id?: string
          project_type?: string | null
          intake_type?: Database["public"]["Enums"]["intake_type"] | null
          intake_source?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          volume?: Json | null
          target_price_per_unit?: number | null
          project_reference?: string | null
          desired_delivery_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comments: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          decision: string | null
          decision_reason: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          recommendations: string | null
          review_type: string
          reviewer_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          decision?: string | null
          decision_reason?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          recommendations?: string | null
          review_type: string
          reviewer_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          decision?: string | null
          decision_reason?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string
          recommendations?: string | null
          review_type?: string
          reviewer_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quotes: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          lead_time_days: number | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          project_id: string
          quote_number: string | null
          status: string | null
          submitted_at: string | null
          supplier_id: string
          terms_and_conditions: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_time_days?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          project_id: string
          quote_number?: string | null
          status?: string | null
          submitted_at?: string | null
          supplier_id: string
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_time_days?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          project_id?: string
          quote_number?: string | null
          status?: string | null
          submitted_at?: string | null
          supplier_id?: string
          terms_and_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          direct_manager_id: string | null
          direct_reports: string[] | null
          email: string
          employee_id: string | null
          id: string
          last_login_at: string | null
          name: string
          organization_id: string
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          direct_manager_id?: string | null
          direct_reports?: string[] | null
          email: string
          employee_id?: string | null
          id: string
          last_login_at?: string | null
          name: string
          organization_id: string
          phone?: string | null
          preferences?: Json | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          direct_manager_id?: string | null
          direct_reports?: string[] | null
          email?: string
          employee_id?: string | null
          id?: string
          last_login_at?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_direct_manager_id_fkey"
            columns: ["direct_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          estimated_duration_days: number | null
          exit_criteria: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          responsible_roles: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          stage_order: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          responsible_roles?: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          stage_order: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          responsible_roles?: Database["public"]["Enums"]["user_role"][] | null
          slug?: string
          stage_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_sub_stages: {
        Row: {
          approval_roles: Database["public"]["Enums"]["user_role"][] | null
          auto_advance: boolean | null
          can_skip: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          exit_criteria: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          metadata: Json | null
          name: string
          organization_id: string
          requires_approval: boolean | null
          responsible_roles: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          sub_stage_order: number
          updated_at: string | null
          workflow_stage_id: string
        }
        Insert: {
          approval_roles?: Database["public"]["Enums"]["user_role"][] | null
          auto_advance?: boolean | null
          can_skip?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          metadata?: Json | null
          name: string
          organization_id: string
          requires_approval?: boolean | null
          responsible_roles?: Database["public"]["Enums"]["user_role"][] | null
          slug: string
          sub_stage_order: number
          updated_at?: string | null
          workflow_stage_id: string
        }
        Update: {
          approval_roles?: Database["public"]["Enums"]["user_role"][] | null
          auto_advance?: boolean | null
          can_skip?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          requires_approval?: boolean | null
          responsible_roles?: Database["public"]["Enums"]["user_role"][] | null
          slug?: string
          sub_stage_order?: number
          updated_at?: string | null
          workflow_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_sub_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_sub_stages_workflow_stage_id_fkey"
            columns: ["workflow_stage_id"]
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
      can_access_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_message: string
          p_priority?: Database["public"]["Enums"]["priority_level"]
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_internal_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_portal_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      contact_type: "customer" | "supplier" | "partner" | "internal"
      intake_type: "rfq" | "purchase_order" | "project_idea" | "direct_request"
      priority_level: "low" | "medium" | "high" | "critical"
      project_status: "active" | "completed" | "cancelled" | "on_hold"
      subscription_plan: "starter" | "growth" | "enterprise"
      user_role:
      | "admin"
      | "management"
      | "sales"
      | "engineering"
      | "qa"
      | "production"
      | "procurement"
      | "supplier"
      | "customer"
      user_status: "active" | "inactive" | "pending" | "suspended"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      contact_type: ["customer", "supplier", "partner", "internal"],
      priority_level: ["low", "medium", "high", "critical"],
      project_status: ["active", "completed", "cancelled", "on_hold"],
      subscription_plan: ["starter", "growth", "enterprise"],
      user_role: [
        "admin",
        "management",
        "sales",
        "engineering",
        "qa",
        "production",
        "procurement",
        "supplier",
        "customer",
      ],
      user_status: ["active", "inactive", "pending", "suspended"],
    },
  },
} as const

