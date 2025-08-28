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
      activity_log: {
        Row: {
          action: string
          contact_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          project_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          contact_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          project_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          contact_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          project_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      ai_model_configs: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          model_name: string
          model_type: string
          organization_id: string | null
          performance_metrics: Json | null
          updated_at: string | null
          version: string
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          model_name: string
          model_type: string
          organization_id?: string | null
          performance_metrics?: Json | null
          updated_at?: string | null
          version: string
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          organization_id?: string | null
          performance_metrics?: Json | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_configs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_model_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_processing_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          input_data: Json
          max_retries: number | null
          organization_id: string | null
          output_data: Json | null
          priority: number | null
          processing_time_ms: number | null
          processing_type: string
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          input_data: Json
          max_retries?: number | null
          organization_id?: string | null
          output_data?: Json | null
          priority?: number | null
          processing_time_ms?: number | null
          processing_type: string
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          max_retries?: number | null
          organization_id?: string | null
          output_data?: Json | null
          priority?: number | null
          processing_time_ms?: number | null
          processing_type?: string
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_chains: {
        Row: {
          chain_name: string
          conditions: Json
          created_at: string | null
          created_by: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          steps: Json
          updated_at: string | null
        }
        Insert: {
          chain_name: string
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          steps: Json
          updated_at?: string | null
        }
        Update: {
          chain_name?: string
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          steps?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_chains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_chains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_role: string | null
          chain_id: string | null
          comments: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          status: string | null
          step_number: number
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_role?: string | null
          chain_id?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          status?: string | null
          step_number: number
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_role?: string | null
          chain_id?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          status?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "approval_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          ai_confidence: number | null
          ai_extracted: boolean | null
          ai_source_document_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_critical: boolean | null
          is_long_lead: boolean | null
          item_number: string
          lead_time_days: number | null
          material: string | null
          minimum_order_qty: number | null
          notes: string | null
          parent_item_id: string | null
          part_number: string | null
          project_id: string | null
          quantity: number
          specifications: Json | null
          supplier_id: string | null
          tolerances: Json | null
          total_cost: number | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_extracted?: boolean | null
          ai_source_document_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_critical?: boolean | null
          is_long_lead?: boolean | null
          item_number: string
          lead_time_days?: number | null
          material?: string | null
          minimum_order_qty?: number | null
          notes?: string | null
          parent_item_id?: string | null
          part_number?: string | null
          project_id?: string | null
          quantity?: number
          specifications?: Json | null
          supplier_id?: string | null
          tolerances?: Json | null
          total_cost?: number | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_extracted?: boolean | null
          ai_source_document_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_critical?: boolean | null
          is_long_lead?: boolean | null
          item_number?: string
          lead_time_days?: number | null
          material?: string | null
          minimum_order_qty?: number | null
          notes?: string | null
          parent_item_id?: string | null
          part_number?: string | null
          project_id?: string | null
          quantity?: number
          specifications?: Json | null
          supplier_id?: string | null
          tolerances?: Json | null
          total_cost?: number | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_ai_source_document_id_fkey"
            columns: ["ai_source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "bom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_storage_integrations: {
        Row: {
          created_at: string | null
          credentials: Json
          error_message: string | null
          id: string
          integration_name: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string | null
          provider: string
          settings: Json | null
          sync_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credentials: Json
          error_message?: string | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string | null
          provider: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credentials?: Json
          error_message?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string | null
          provider?: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloud_storage_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_storage_integrations_user_id_fkey"
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
          ai_capabilities: Json | null
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
          organization_id: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          ai_capabilities?: Json | null
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
          organization_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          ai_capabilities?: Json | null
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
          organization_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          type?: string
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
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sync_log: {
        Row: {
          document_id: string | null
          error_message: string | null
          file_size_bytes: number | null
          id: string
          integration_id: string | null
          status: string
          sync_action: string
          sync_duration_ms: number | null
          synced_at: string | null
        }
        Insert: {
          document_id?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          integration_id?: string | null
          status: string
          sync_action: string
          sync_duration_ms?: number | null
          synced_at?: string | null
        }
        Update: {
          document_id?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          integration_id?: string | null
          status?: string
          sync_action?: string
          sync_duration_ms?: number | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_sync_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_sync_log_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "cloud_storage_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_description: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          file_url: string
          id: string
          metadata: Json | null
          version_number: number
        }
        Insert: {
          change_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_url: string
          id?: string
          metadata?: Json | null
          version_number: number
        }
        Update: {
          change_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_url?: string
          id?: string
          metadata?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_level: string | null
          ai_confidence_score: number | null
          ai_extracted_data: Json | null
          ai_processed_at: string | null
          ai_processing_status: string | null
          approved_at: string | null
          approved_by: string | null
          checksum: string | null
          document_type: string | null
          external_id: string | null
          external_url: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_latest: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          mime_type: string | null
          original_file_name: string
          project_id: string | null
          storage_provider: string | null
          sync_status: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          access_level?: string | null
          ai_confidence_score?: number | null
          ai_extracted_data?: Json | null
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          checksum?: string | null
          document_type?: string | null
          external_id?: string | null
          external_url?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_latest?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name: string
          project_id?: string | null
          storage_provider?: string | null
          sync_status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          access_level?: string | null
          ai_confidence_score?: number | null
          ai_extracted_data?: Json | null
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          checksum?: string | null
          document_type?: string | null
          external_id?: string | null
          external_url?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_latest?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name?: string
          project_id?: string | null
          storage_provider?: string | null
          sync_status?: string | null
          uploaded_at?: string | null
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
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          subject: string
          template_key: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          subject: string
          template_key: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          subject?: string
          template_key?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          sender_contact_id: string | null
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
          sender_contact_id?: string | null
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
          sender_contact_id?: string | null
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
          {
            foreignKeyName: "messages_sender_contact_id_fkey"
            columns: ["sender_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          organization_id: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_settings_updated_by_fkey"
            columns: ["updated_by"]
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
          subscription_plan: string | null
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
          subscription_plan?: string | null
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
          subscription_plan?: string | null
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
          project_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          role?: string
          user_id?: string | null
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
      project_stage_history: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          entered_at: string | null
          entered_by: string | null
          exit_reason: string | null
          exited_at: string | null
          id: string
          notes: string | null
          project_id: string | null
          stage_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          entered_at?: string | null
          entered_by?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          stage_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          entered_at?: string | null
          entered_by?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stage_history_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stage_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stage_history_stage_id_fkey"
            columns: ["stage_id"]
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
          organization_id: string | null
          priority_level: string | null
          priority_score: number | null
          project_id: string
          source: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
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
          organization_id?: string | null
          priority_level?: string | null
          priority_score?: number | null
          project_id: string
          source?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
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
          organization_id?: string | null
          priority_level?: string | null
          priority_score?: number | null
          project_id?: string
          source?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
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
            foreignKeyName: "review_checklist_items_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_performance_metrics: {
        Row: {
          id: string
          measurement_period: string
          metric_type: string
          metric_value: number
          notes: string | null
          organization_id: string | null
          period_end: string
          period_start: string
          project_id: string | null
          recorded_at: string | null
          recorded_by: string | null
          supplier_id: string | null
          target_value: number | null
        }
        Insert: {
          id?: string
          measurement_period: string
          metric_type: string
          metric_value: number
          notes?: string | null
          organization_id?: string | null
          period_end: string
          period_start: string
          project_id?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          supplier_id?: string | null
          target_value?: number | null
        }
        Update: {
          id?: string
          measurement_period?: string
          metric_type?: string
          metric_value?: number
          notes?: string | null
          organization_id?: string | null
          period_end?: string
          period_start?: string
          project_id?: string | null
          recorded_at?: string | null
          recorded_by?: string | null
          supplier_id?: string | null
          target_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_performance_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_metrics_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_metrics_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_qualifications: {
        Row: {
          capabilities: Json | null
          certifications: Json | null
          communication_score: number | null
          compliance_score: number | null
          cost_score: number | null
          created_at: string | null
          delivery_score: number | null
          financial_stability_score: number | null
          id: string
          improvement_areas: Json | null
          next_review_date: string | null
          notes: string | null
          organization_id: string | null
          overall_score: number
          qualification_type: string
          qualified_at: string | null
          qualified_by: string | null
          quality_score: number | null
          risk_factors: Json | null
          status: string | null
          supplier_id: string | null
          technical_capability_score: number | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          certifications?: Json | null
          communication_score?: number | null
          compliance_score?: number | null
          cost_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          financial_stability_score?: number | null
          id?: string
          improvement_areas?: Json | null
          next_review_date?: string | null
          notes?: string | null
          organization_id?: string | null
          overall_score: number
          qualification_type: string
          qualified_at?: string | null
          qualified_by?: string | null
          quality_score?: number | null
          risk_factors?: Json | null
          status?: string | null
          supplier_id?: string | null
          technical_capability_score?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          certifications?: Json | null
          communication_score?: number | null
          compliance_score?: number | null
          cost_score?: number | null
          created_at?: string | null
          delivery_score?: number | null
          financial_stability_score?: number | null
          id?: string
          improvement_areas?: Json | null
          next_review_date?: string | null
          notes?: string | null
          organization_id?: string | null
          overall_score?: number
          qualification_type?: string
          qualified_at?: string | null
          qualified_by?: string | null
          quality_score?: number | null
          risk_factors?: Json | null
          status?: string | null
          supplier_id?: string | null
          technical_capability_score?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_qualifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_qualifications_qualified_by_fkey"
            columns: ["qualified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_qualifications_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
            foreignKeyName: "supplier_quotes_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "supplier_rfqs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          organization_id: string | null
          payload: Json
          processed_at: string | null
          retry_count: number | null
          source: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          source: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          source?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          organization_id: string | null
          phone: string | null
          preferences: Json | null
          role: string
          status: string | null
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
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role: string
          status?: string | null
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
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string
          status?: string | null
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
      users_backup: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          direct_manager_id: string | null
          direct_reports: string[] | null
          email: string | null
          employee_id: string | null
          id: string | null
          last_login_at: string | null
          name: string | null
          organization_id: string | null
          phone: string | null
          preferences: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          direct_manager_id?: string | null
          direct_reports?: string[] | null
          email?: string | null
          employee_id?: string | null
          id?: string | null
          last_login_at?: string | null
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          direct_manager_id?: string | null
          direct_reports?: string[] | null
          email?: string | null
          employee_id?: string | null
          id?: string | null
          last_login_at?: string | null
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_business_rules: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          priority: number | null
          rule_name: string
          rule_type: string
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          priority?: number | null
          rule_name: string
          rule_type: string
          trigger_conditions: Json
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_business_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_business_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rule_executions: {
        Row: {
          actions_taken: Json
          conditions_met: Json
          error_message: string | null
          executed_at: string | null
          execution_status: string | null
          execution_time_ms: number | null
          id: string
          project_id: string | null
          rule_id: string | null
          trigger_event: string
          triggered_by: string | null
        }
        Insert: {
          actions_taken: Json
          conditions_met: Json
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          rule_id?: string | null
          trigger_event: string
          triggered_by?: string | null
        }
        Update: {
          actions_taken?: Json
          conditions_met?: Json
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          rule_id?: string | null
          trigger_event?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_rule_executions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_rule_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "workflow_business_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_rule_executions_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stage_transitions: {
        Row: {
          conditions: Json | null
          created_at: string | null
          from_stage_id: string | null
          id: string
          is_allowed: boolean | null
          organization_id: string | null
          to_stage_id: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          from_stage_id?: string | null
          id?: string
          is_allowed?: boolean | null
          organization_id?: string | null
          to_stage_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          from_stage_id?: string | null
          id?: string
          is_allowed?: boolean | null
          organization_id?: string | null
          to_stage_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_stage_transitions_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_stage_transitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_stage_transitions_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          exit_criteria: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          responsible_roles: string[] | null
          slug: string
          stage_order: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          responsible_roles?: string[] | null
          slug: string
          stage_order: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          exit_criteria?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          responsible_roles?: string[] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
