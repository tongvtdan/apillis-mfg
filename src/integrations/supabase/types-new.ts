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
          project_id: string | null
          user_agent: string | null
          user_id: string | null
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
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_details_view"
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
      approval_attachments: {
        Row: {
          approval_id: string
          attachment_type: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          mime_type: string | null
          organization_id: string
          original_file_name: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          approval_id: string
          attachment_type?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          mime_type?: string | null
          organization_id: string
          original_file_name: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          approval_id?: string
          attachment_type?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          mime_type?: string | null
          organization_id?: string
          original_file_name?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_attachments_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      approval_delegation_mappings: {
        Row: {
          approval_id: string
          created_at: string | null
          delegation_id: string
          id: string
        }
        Insert: {
          approval_id: string
          created_at?: string | null
          delegation_id: string
          id?: string
        }
        Update: {
          approval_id?: string
          created_at?: string | null
          delegation_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_delegation_mappings_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_delegation_mappings_delegation_id_fkey"
            columns: ["delegation_id"]
            isOneToOne: false
            referencedRelation: "approval_delegations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_delegations: {
        Row: {
          created_at: string | null
          delegate_id: string
          delegator_id: string
          end_date: string
          id: string
          include_new_approvals: boolean | null
          organization_id: string
          reason: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delegate_id: string
          delegator_id: string
          end_date: string
          id?: string
          include_new_approvals?: boolean | null
          organization_id: string
          reason: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delegate_id?: string
          delegator_id?: string
          end_date?: string
          id?: string
          include_new_approvals?: boolean | null
          organization_id?: string
          reason?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      approval_history: {
        Row: {
          action_at: string | null
          action_by: string
          action_type: string
          approval_id: string
          comments: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["approval_status"] | null
          old_status: Database["public"]["Enums"]["approval_status"] | null
          organization_id: string
        }
        Insert: {
          action_at?: string | null
          action_by: string
          action_type: string
          approval_id: string
          comments?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["approval_status"] | null
          old_status?: Database["public"]["Enums"]["approval_status"] | null
          organization_id: string
        }
        Update: {
          action_at?: string | null
          action_by?: string
          action_type?: string
          approval_id?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["approval_status"] | null
          old_status?: Database["public"]["Enums"]["approval_status"] | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_history_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_notifications: {
        Row: {
          approval_id: string
          created_at: string | null
          delivered_at: string | null
          delivery_method: string | null
          delivery_status: string | null
          id: string
          message: string
          notification_data: Json | null
          notification_type: string
          organization_id: string
          read_at: string | null
          recipient_id: string
          recipient_type: string | null
          sent_at: string | null
          subject: string
        }
        Insert: {
          approval_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message: string
          notification_data?: Json | null
          notification_type: string
          organization_id: string
          read_at?: string | null
          recipient_id: string
          recipient_type?: string | null
          sent_at?: string | null
          subject: string
        }
        Update: {
          approval_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string
          notification_data?: Json | null
          notification_type?: string
          organization_id?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string | null
          sent_at?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_notifications_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approval_chain_id: string | null
          approval_type: Database["public"]["Enums"]["approval_type"]
          auto_approval_reason: string | null
          auto_approval_rules: Json | null
          auto_approved_at: string | null
          created_at: string | null
          created_by: string | null
          current_approver_department: string | null
          current_approver_id: string | null
          current_approver_role: string | null
          decided_at: string | null
          decided_by: string | null
          decision_comments: string | null
          decision_metadata: Json | null
          decision_reason: string | null
          delegated_at: string | null
          delegated_from: string | null
          delegated_to: string | null
          delegation_end_date: string | null
          delegation_reason: string | null
          description: string | null
          due_date: string | null
          entity_id: string
          entity_type: string
          escalated_at: string | null
          escalated_from: string | null
          escalated_to: string | null
          escalation_reason: string | null
          expires_at: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["approval_priority"] | null
          reference_id: string | null
          request_metadata: Json | null
          request_reason: string | null
          requested_at: string | null
          requested_by: string
          status: Database["public"]["Enums"]["approval_status"] | null
          step_number: number | null
          title: string
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          approval_chain_id?: string | null
          approval_type: Database["public"]["Enums"]["approval_type"]
          auto_approval_reason?: string | null
          auto_approval_rules?: Json | null
          auto_approved_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_approver_department?: string | null
          current_approver_id?: string | null
          current_approver_role?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_comments?: string | null
          decision_metadata?: Json | null
          decision_reason?: string | null
          delegated_at?: string | null
          delegated_from?: string | null
          delegated_to?: string | null
          delegation_end_date?: string | null
          delegation_reason?: string | null
          description?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          escalated_at?: string | null
          escalated_from?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["approval_priority"] | null
          reference_id?: string | null
          request_metadata?: Json | null
          request_reason?: string | null
          requested_at?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_number?: number | null
          title: string
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          approval_chain_id?: string | null
          approval_type?: Database["public"]["Enums"]["approval_type"]
          auto_approval_reason?: string | null
          auto_approval_rules?: Json | null
          auto_approved_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_approver_department?: string | null
          current_approver_id?: string | null
          current_approver_role?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_comments?: string | null
          decision_metadata?: Json | null
          decision_reason?: string | null
          delegated_at?: string | null
          delegated_from?: string | null
          delegated_to?: string | null
          delegation_end_date?: string | null
          delegation_reason?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          escalated_at?: string | null
          escalated_from?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["approval_priority"] | null
          reference_id?: string | null
          request_metadata?: Json | null
          request_reason?: string | null
          requested_at?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_number?: number | null
          title?: string
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approval_chain_id_fkey"
            columns: ["approval_chain_id"]
            isOneToOne: false
            referencedRelation: "approval_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_current_approver_id_fkey"
            columns: ["current_approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_delegated_from_fkey"
            columns: ["delegated_from"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_delegated_to_fkey"
            columns: ["delegated_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_escalated_from_fkey"
            columns: ["escalated_from"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_requested_by_fkey"
            columns: ["requested_by"]
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
          client_organization_id: string | null
          company_name: string
          contact_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_primary_contact: boolean | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          role: string | null
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
          client_organization_id?: string | null
          company_name: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary_contact?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
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
          client_organization_id?: string | null
          company_name?: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary_contact?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          state?: string | null
          tax_id?: string | null
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_organization_id_fkey"
            columns: ["client_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
      document_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          description: string | null
          document_id: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_current: boolean | null
          metadata: Json | null
          mime_type: string | null
          organization_id: string
          title: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          description?: string | null
          document_id: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id: string
          title: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string
          title?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          category: string | null
          created_at: string | null
          description: string | null
          external_id: string | null
          external_url: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_current_version: boolean | null
          last_synced_at: string | null
          link_access_count: number | null
          link_expires_at: string | null
          link_last_accessed: string | null
          link_permissions: Json | null
          link_type: string | null
          metadata: Json | null
          mime_type: string | null
          organization_id: string
          project_id: string | null
          storage_provider: string | null
          sync_status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
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
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_url?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          last_synced_at?: string | null
          link_access_count?: number | null
          link_expires_at?: string | null
          link_last_accessed?: string | null
          link_permissions?: Json | null
          link_type?: string | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id: string
          project_id?: string | null
          storage_provider?: string | null
          sync_status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
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
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_url?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          last_synced_at?: string | null
          link_access_count?: number | null
          link_expires_at?: string | null
          link_last_accessed?: string | null
          link_permissions?: Json | null
          link_type?: string | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string
          project_id?: string | null
          storage_provider?: string | null
          sync_status?: string | null
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
            referencedRelation: "project_details_view"
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
            referencedRelation: "project_details_view"
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
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          postal_code: string | null
          settings: Json | null
          slug: string
          state: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          postal_code?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          postal_code?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          website?: string | null
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
            referencedRelation: "project_details_view"
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
      project_contact_points_backup: {
        Row: {
          backup_created_at: string | null
          contact_id: string | null
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          project_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          backup_created_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          backup_created_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string | null
          is_primary?: boolean | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "project_details_view"
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
          customer_organization_id: string | null
          description: string | null
          desired_delivery_date: string | null
          estimated_delivery_date: string | null
          estimated_value: number | null
          id: string
          intake_source: string | null
          intake_type: Database["public"]["Enums"]["intake_type"] | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          point_of_contacts: string[] | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          priority_score: number | null
          project_id: string
          project_reference: string | null
          project_type: string | null
          source: string | null
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          target_price_per_unit: number | null
          title: string
          updated_at: string | null
          volume: Json | null
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage_id?: string | null
          customer_organization_id?: string | null
          description?: string | null
          desired_delivery_date?: string | null
          estimated_delivery_date?: string | null
          estimated_value?: number | null
          id?: string
          intake_source?: string | null
          intake_type?: Database["public"]["Enums"]["intake_type"] | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          point_of_contacts?: string[] | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          priority_score?: number | null
          project_id: string
          project_reference?: string | null
          project_type?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          target_price_per_unit?: number | null
          title: string
          updated_at?: string | null
          volume?: Json | null
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_stage_id?: string | null
          customer_organization_id?: string | null
          description?: string | null
          desired_delivery_date?: string | null
          estimated_delivery_date?: string | null
          estimated_value?: number | null
          id?: string
          intake_source?: string | null
          intake_type?: Database["public"]["Enums"]["intake_type"] | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          point_of_contacts?: string[] | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          priority_score?: number | null
          project_id?: string
          project_reference?: string | null
          project_type?: string | null
          source?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          target_price_per_unit?: number | null
          title?: string
          updated_at?: string | null
          volume?: Json | null
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
            foreignKeyName: "projects_customer_organization_id_fkey"
            columns: ["customer_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "project_details_view"
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
            referencedRelation: "project_details_view"
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
            referencedRelation: "project_details_view"
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
      project_details_view: {
        Row: {
          actual_delivery_date: string | null
          assigned_to: string | null
          contact_count: number | null
          created_at: string | null
          created_by: string | null
          current_stage_id: string | null
          customer_address: string | null
          customer_city: string | null
          customer_country: string | null
          customer_organization_id: string | null
          customer_organization_name: string | null
          customer_organization_slug: string | null
          customer_website: string | null
          description: string | null
          desired_delivery_date: string | null
          estimated_delivery_date: string | null
          estimated_value: number | null
          id: string | null
          intake_source: string | null
          intake_type: Database["public"]["Enums"]["intake_type"] | null
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          point_of_contacts: string[] | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          priority_score: number | null
          project_id: string | null
          project_reference: string | null
          project_type: string | null
          source: string | null
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          target_price_per_unit: number | null
          title: string | null
          updated_at: string | null
          volume: Json | null
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
            foreignKeyName: "projects_customer_organization_id_fkey"
            columns: ["customer_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
    }
    Functions: {
      add_contact_to_project: {
        Args: {
          contact_uuid: string
          make_primary?: boolean
          project_uuid: string
        }
        Returns: boolean
      }
      auto_expire_overdue_approvals: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      can_access_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      cleanup_old_document_versions: {
        Args: { p_document_id: string; p_keep_versions?: number }
        Returns: number
      }
      create_approval: {
        Args: {
          p_approval_type: Database["public"]["Enums"]["approval_type"]
          p_current_approver_id: string
          p_current_approver_role: string
          p_description: string
          p_due_date?: string
          p_entity_id: string
          p_entity_type: string
          p_organization_id: string
          p_priority?: Database["public"]["Enums"]["approval_priority"]
          p_request_metadata?: Json
          p_request_reason?: string
          p_requested_by: string
          p_title: string
        }
        Returns: string
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
      expire_approval_delegations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      get_document_version_history: {
        Args: { p_document_id: string }
        Returns: {
          change_summary: string
          description: string
          file_name: string
          file_size: number
          is_current: boolean
          mime_type: string
          title: string
          uploaded_at: string
          uploaded_by: string
          uploader_email: string
          uploader_name: string
          version_id: string
          version_number: number
        }[]
      }
      get_pending_approvals_for_user: {
        Args: { p_user_id: string }
        Returns: {
          approval_id: string
          approval_type: Database["public"]["Enums"]["approval_type"]
          created_at: string
          days_overdue: number
          description: string
          due_date: string
          entity_id: string
          entity_type: string
          priority: Database["public"]["Enums"]["approval_priority"]
          requested_by_name: string
          title: string
        }[]
      }
      get_project_contacts: {
        Args: { project_uuid: string }
        Returns: {
          company_name: string
          contact_id: string
          contact_name: string
          email: string
          is_primary_contact: boolean
          is_project_primary: boolean
          phone: string
          role: string
        }[]
      }
      get_project_primary_contact: {
        Args: { project_uuid: string }
        Returns: {
          company_name: string
          contact_id: string
          contact_name: string
          email: string
          phone: string
          role: string
        }[]
      }
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_approval_overdue: {
        Args: { p_approval_id: string }
        Returns: boolean
      }
      is_internal_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_portal_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      remove_contact_from_project: {
        Args: { contact_uuid: string; project_uuid: string }
        Returns: boolean
      }
      submit_approval_decision: {
        Args: {
          p_approval_id: string
          p_comments?: string
          p_decision: Database["public"]["Enums"]["approval_status"]
          p_metadata?: Json
          p_reason?: string
        }
        Returns: boolean
      }
      validate_contact_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          count_value: number
          status: string
          validation_type: string
        }[]
      }
      validate_customer_organization_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          count_value: number
          status: string
          validation_type: string
        }[]
      }
      validate_migration_before_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: {
          count_value: number
          details: string
          status: string
          validation_type: string
        }[]
      }
    }
    Enums: {
      approval_priority: "low" | "normal" | "high" | "urgent" | "critical"
      approval_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "delegated"
        | "expired"
        | "cancelled"
        | "auto_approved"
        | "escalated"
      approval_type:
        | "stage_transition"
        | "document_approval"
        | "engineering_change"
        | "supplier_qualification"
        | "purchase_order"
        | "cost_approval"
        | "quality_review"
        | "production_release"
        | "shipping_approval"
        | "contract_approval"
        | "budget_approval"
        | "safety_review"
        | "custom"
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
      approval_priority: ["low", "normal", "high", "urgent", "critical"],
      approval_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "delegated",
        "expired",
        "cancelled",
        "auto_approved",
        "escalated",
      ],
      approval_type: [
        "stage_transition",
        "document_approval",
        "engineering_change",
        "supplier_qualification",
        "purchase_order",
        "cost_approval",
        "quality_review",
        "production_release",
        "shipping_approval",
        "contract_approval",
        "budget_approval",
        "safety_review",
        "custom",
      ],
      contact_type: ["customer", "supplier", "partner", "internal"],
      intake_type: ["rfq", "purchase_order", "project_idea", "direct_request"],
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

