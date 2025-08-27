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
      document_access_log: {
        Row: {
          accessed_at: string | null
          action: string
          document_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          action: string
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          comment: string
          coordinates: Json | null
          created_at: string | null
          document_id: string | null
          id: string
          is_resolved: boolean | null
          page_number: number | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          coordinates?: Json | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          page_number?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          coordinates?: Json | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          page_number?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "project_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          description: string | null
          id: string
          item_code: string
          item_name: string
          last_restocked: string | null
          location: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          status: string
          supplier_id: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          item_code: string
          item_name: string
          last_restocked?: string | null
          location?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          status?: string
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          item_code?: string
          item_name?: string
          last_restocked?: string | null
          location?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          status?: string
          supplier_id?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          priority: string | null
          project_id: string | null
          read_at: string | null
          recipient_department: string | null
          recipient_id: string | null
          recipient_role: string | null
          recipient_type: string
          sender_id: string | null
          sender_type: string
          subject: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          recipient_department?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          recipient_type: string
          sender_id?: string | null
          sender_type: string
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          recipient_department?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          recipient_type?: string
          sender_id?: string | null
          sender_type?: string
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_method: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          priority: string | null
          project_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          assigned_to: string | null
          completed_quantity: number | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          planned_end_date: string | null
          planned_start_date: string | null
          priority: string
          production_number: string
          project_id: string | null
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          completed_quantity?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: string
          production_number: string
          project_id?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          completed_quantity?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: string
          production_number?: string
          project_id?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
          access_level: string | null
          checksum: string | null
          document_type: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          filename: string
          id: string
          is_latest: boolean | null
          metadata: Json | null
          mime_type: string | null
          original_file_name: string | null
          project_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          access_level?: string | null
          checksum?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename: string
          id?: string
          is_latest?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name?: string | null
          project_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          access_level?: string | null
          checksum?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename?: string
          id?: string
          is_latest?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name?: string | null
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
          actual_completion: string | null
          assignee_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          current_stage: string
          customer_id: string | null
          days_in_stage: number | null
          description: string | null
          due_date: string | null
          engineering_reviewer_id: string | null
          estimated_completion: string | null
          estimated_value: number | null
          id: string
          metadata: Json | null
          notes: string | null
          priority: string
          priority_score: number | null
          production_reviewer_id: string | null
          project_id: string
          project_type: string
          qa_reviewer_id: string | null
          review_summary: Json | null
          stage_entered_at: string | null
          status: string
          supplier_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_completion?: string | null
          assignee_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string
          customer_id?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_completion?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          priority?: string
          priority_score?: number | null
          production_reviewer_id?: string | null
          project_id: string
          project_type?: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          stage_entered_at?: string | null
          status?: string
          supplier_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_completion?: string | null
          assignee_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string
          customer_id?: string | null
          days_in_stage?: number | null
          description?: string | null
          due_date?: string | null
          engineering_reviewer_id?: string | null
          estimated_completion?: string | null
          estimated_value?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          priority?: string
          priority_score?: number | null
          production_reviewer_id?: string | null
          project_id?: string
          project_type?: string
          qa_reviewer_id?: string | null
          review_summary?: Json | null
          stage_entered_at?: string | null
          status?: string
          supplier_id?: string | null
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
          {
            foreignKeyName: "projects_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_name: string
          po_id: string
          quantity: number
          total_price: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          po_id: string
          quantity?: number
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          po_id?: string
          quantity?: number
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          due_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          priority: string
          project_id: string | null
          status: string
          supplier_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          priority?: string
          project_id?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          priority?: string
          project_id?: string | null
          status?: string
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      review_checklist_items: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          id: string
          is_checked: boolean | null
          is_required: boolean | null
          item_text: string
          notes: string | null
          review_id: string | null
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          id?: string
          is_checked?: boolean | null
          is_required?: boolean | null
          item_text: string
          notes?: string | null
          review_id?: string | null
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          id?: string
          is_checked?: boolean | null
          is_required?: boolean | null
          item_text?: string
          notes?: string | null
          review_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_checklist_items_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comments: string | null
          created_at: string | null
          due_date: string | null
          estimated_cost: number | null
          estimated_lead_time: number | null
          id: string
          priority: string | null
          project_id: string | null
          recommendations: string | null
          review_type: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_role: string
          risks: Json | null
          status: string | null
          tooling_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_lead_time?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          recommendations?: string | null
          review_type?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_role: string
          risks?: Json | null
          status?: string | null
          tooling_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_lead_time?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          recommendations?: string | null
          review_type?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_role?: string
          risks?: Json | null
          status?: string | null
          tooling_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quotes: {
        Row: {
          currency: string | null
          evaluated_at: string | null
          evaluated_by: string | null
          evaluation_notes: string | null
          evaluation_score: number | null
          id: string
          is_selected: boolean | null
          lead_time_days: number | null
          notes: string | null
          payment_terms: string | null
          quantity: number | null
          quote_file_url: string | null
          quote_number: string | null
          shipping_terms: string | null
          submitted_at: string | null
          supplier_rfq_id: string | null
          total_price: number | null
          unit_price: number | null
          valid_until: string | null
        }
        Insert: {
          currency?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          id?: string
          is_selected?: boolean | null
          lead_time_days?: number | null
          notes?: string | null
          payment_terms?: string | null
          quantity?: number | null
          quote_file_url?: string | null
          quote_number?: string | null
          shipping_terms?: string | null
          submitted_at?: string | null
          supplier_rfq_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          valid_until?: string | null
        }
        Update: {
          currency?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          id?: string
          is_selected?: boolean | null
          lead_time_days?: number | null
          notes?: string | null
          payment_terms?: string | null
          quantity?: number | null
          quote_file_url?: string | null
          quote_number?: string | null
          shipping_terms?: string | null
          submitted_at?: string | null
          supplier_rfq_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quotes_supplier_rfq_id_fkey"
            columns: ["supplier_rfq_id"]
            isOneToOne: false
            referencedRelation: "supplier_rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_rfqs: {
        Row: {
          created_at: string | null
          created_by: string | null
          due_date: string | null
          expected_response_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          requirements: string | null
          rfq_number: string
          sent_at: string | null
          special_instructions: string | null
          status: string | null
          supplier_id: string | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          expected_response_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          requirements?: string | null
          rfq_number: string
          sent_at?: string | null
          special_instructions?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          expected_response_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          requirements?: string | null
          rfq_number?: string
          sent_at?: string | null
          special_instructions?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_rfqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_rfqs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          capabilities: string[] | null
          company: string
          cost_rating: number | null
          country: string | null
          created_at: string
          delivery_rating: number | null
          email: string | null
          id: string
          industry_type: string | null
          name: string
          phone: string | null
          quality_rating: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          capabilities?: string[] | null
          company: string
          cost_rating?: number | null
          country?: string | null
          created_at?: string
          delivery_rating?: number | null
          email?: string | null
          id?: string
          industry_type?: string | null
          name: string
          phone?: string | null
          quality_rating?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          capabilities?: string[] | null
          company?: string
          cost_rating?: number | null
          country?: string | null
          created_at?: string
          delivery_rating?: number | null
          email?: string | null
          id?: string
          industry_type?: string | null
          name?: string
          phone?: string | null
          quality_rating?: number | null
          status?: string | null
          updated_at?: string
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
          description: string | null
          exit_criteria: string | null
          id: string
          is_active: boolean | null
          name: string
          responsible_roles: string[] | null
          slug: string | null
          stage_order: number
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          responsible_roles?: string[] | null
          slug?: string | null
          stage_order: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          responsible_roles?: string[] | null
          slug?: string | null
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
      get_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      project_lifecycle_status:
        | "active"
        | "delayed"
        | "on_hold"
        | "cancelled"
        | "completed"
        | "archived"
      project_priority: "low" | "medium" | "high" | "urgent"
      project_stage:
        | "inquiry"
        | "review"
        | "quoted"
        | "won"
        | "lost"
        | "production"
        | "completed"
        | "cancelled"
        | "supplier_rfq"
        | "procurement"
        | "inquiry_received"
        | "technical_review"
        | "supplier_rfq_sent"
        | "order_confirmed"
        | "procurement_planning"
        | "in_production"
        | "shipped_closed"
      project_type: "system_build" | "fabrication" | "manufacturing"
      review_status: "pending" | "approved" | "rejected" | "revision_requested"
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
      project_lifecycle_status: [
        "active",
        "delayed",
        "on_hold",
        "cancelled",
        "completed",
        "archived",
      ],
      project_priority: ["low", "medium", "high", "urgent"],
      project_stage: [
        "inquiry",
        "review",
        "quoted",
        "won",
        "lost",
        "production",
        "completed",
        "cancelled",
        "supplier_rfq",
        "procurement",
        "inquiry_received",
        "technical_review",
        "supplier_rfq_sent",
        "order_confirmed",
        "procurement_planning",
        "in_production",
        "shipped_closed",
      ],
      project_type: ["system_build", "fabrication", "manufacturing"],
      review_status: ["pending", "approved", "rejected", "revision_requested"],
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
