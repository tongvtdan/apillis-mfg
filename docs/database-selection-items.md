# Factory Pulse Database Enum Types

This document defines all **enumerated types (enums)** used throughout the Factory Pulse database schema. These types ensure data consistency, improve query performance, and provide a single source of truth for all selection items, statuses, and categories.

By defining these as PostgreSQL `ENUM` types (or constrained `VARCHAR` with `CHECK` constraints), we ensure:
- Data integrity at the database level
- Clear, consistent options across the system
- Easier frontend dropdown population
- Better API contract definition
- Support for future AI categorization and automation

---

## 1. Organizations & Users

### `enum_subscription_plan`
Used in: `organizations.subscription_plan`

```sql
'starter'      -- Default plan for new organizations
'growth'       -- Mid-tier plan with advanced features
'enterprise'   -- Full-featured plan with custom integrations
'trial'        -- Trial period
'suspended'    -- Account suspended
'cancelled'    -- Cancelled subscription
```

### `enum_user_role`
Used in: `users.role`

```sql
'customer'     -- External customer users
'sales'        -- Sales representatives and account managers
'procurement'  -- Procurement owners and buyers
'engineering'  -- Engineering team members
'qa'           -- Quality assurance team
'production'   -- Production and manufacturing team
'management'   -- Management and executives
'supplier'     -- External supplier users
'admin'        -- System administrators
```

### `enum_contact_type`
Used in: `contacts.type`

```sql
'customer'     -- Customer contacts
'supplier'     -- Supplier contacts
```

---

## 2. Projects & Workflow

### `enum_project_status`
Used in: `projects.status`

```sql
'active'       -- Project is active and progressing
'delayed'      -- Project is behind schedule
'on_hold'      -- Project temporarily paused
'cancelled'    -- Project cancelled
'completed'    -- Project successfully completed
'archived'     -- Project completed and archived
```

### `enum_project_priority_level`
Used in: `projects.priority_level`

```sql
'low'          -- Low priority (🟢 Green)
'medium'       -- Medium priority (🟡 Yellow) - Default
'high'         -- High priority (🔴 Red)
'urgent'       -- Urgent priority (🔴 Red with special handling)
```

### `enum_project_source`
Used in: `projects.source`

```sql
'manual'       -- Manually created by internal users - Default
'portal'       -- Submitted through customer portal
'email'        -- Created from email integration
'api'          -- Created via API integration
'import'       -- Bulk imported
'migration'    -- Migrated from legacy system
```

### `enum_workflow_stage_slug`
Used in: `workflow_stages.slug`

```sql
'inquiry_received'     -- Initial stage when RFQ is submitted
'technical_review'     -- Engineering, QA, Production review
'supplier_rfq_sent'    -- RFQs sent to suppliers
'quoted'               -- Quote generated and sent to customer
'order_confirmed'      -- Customer accepted quote
'procurement_planning' -- BOM, POs, inventory planning
'in_production'        -- Manufacturing and assembly
'shipped_closed'       -- Completed and delivered
```

### `enum_workflow_stage_color`
Used in: `workflow_stages.color`

```sql
'#3B82F6'     -- Blue (Inquiry Received)
'#F59E0B'     -- Amber (Technical Review)
'#F97316'     -- Orange (Supplier RFQ Sent)
'#10B981'     -- Emerald (Quoted)
'#6366F1'     -- Indigo (Order Confirmed)
'#8B5CF6'     -- Violet (In Production)
'#84CC16'     -- Lime (Shipped & Closed)
'#6B7280'     -- Gray (Default/Inactive)
```

---

## 3. Document Management

### `enum_document_type`
Used in: `documents.document_type`

```sql
'rfq'           -- Request for Quote documents
'drawing'       -- Technical drawings (PDF, DWG, STEP)
'specification' -- Technical specifications
'quote'         -- Generated quotes
'po'            -- Purchase orders
'invoice'       -- Invoices and billing documents
'certificate'   -- Certificates (material, quality, compliance)
'report'        -- Test reports, inspection reports
'bom'           -- Bill of Materials
'other'         -- Miscellaneous documents
```

### `enum_storage_provider`
Used in: `documents.storage_provider`

```sql
'supabase'      -- Supabase Storage (Default)
'google_drive'  -- Google Drive integration
'dropbox'       -- Dropbox integration
'onedrive'      -- Microsoft OneDrive
's3'            -- Amazon S3
'azure_blob'    -- Azure Blob Storage
```

### `enum_document_sync_status`
Used in: `documents.sync_status`

```sql
'synced'        -- Successfully synced - Default
'pending'       -- Sync pending
'failed'        -- Sync failed
'conflict'      -- Sync conflict needs resolution
```

### `enum_ai_processing_status`
Used in: `documents.ai_processing_status`

```sql
'pending'       -- AI processing pending - Default
'processing'    -- Currently being processed by AI
'completed'     -- AI processing completed
'failed'        -- AI processing failed
'skipped'       -- AI processing skipped
```

### `enum_document_access_level`
Used in: `documents.access_level`

```sql
'public'        -- Publicly accessible (rare)
'customer'      -- Customer can view
'supplier'      -- Supplier can view
'internal'      -- Internal team only - Default
'restricted'    -- Admin/Management only
```

### `enum_document_action`
Used in: `document_access_log.action`

```sql
'view'          -- Document viewed
'download'      -- Document downloaded
'upload'        -- Document uploaded
'delete'        -- Document deleted
'share'         -- Document shared
'comment'       -- Comment added
'approve'       -- Document approved
```

---

## 4. Reviews & Approvals

### `enum_review_type`
Used in: `reviews.review_type`

```sql
'standard'      -- Standard review process - Default
'technical'     -- Technical/Engineering review
'quality'       -- Quality assurance review
'production'    -- Manufacturing feasibility review
'cost'          -- Cost analysis review
'compliance'    -- Regulatory compliance review
'safety'        -- Safety assessment review
```

### `enum_review_status`
Used in: `reviews.status`

```sql
'pending'       -- Review not started - Default
'in_progress'   -- Review in progress
'approved'      -- Review approved
'rejected'      -- Review rejected
'needs_info'    -- More information required
'on_hold'       -- Review temporarily paused
```

### `enum_review_priority`
Used in: `reviews.priority`

```sql
'low'           -- Low priority review
'medium'        -- Medium priority review - Default
'high'          -- High priority review
'urgent'        -- Urgent review required
```

---

## 5. Supplier Management

### `enum_supplier_rfq_status`
Used in: `supplier_rfqs.status`

```sql
'draft'         -- RFQ being prepared - Default
'sent'          -- RFQ sent to supplier
'viewed'        -- Supplier viewed the RFQ
'quoted'        -- Supplier submitted quote
'declined'      -- Supplier declined to quote
'expired'       -- RFQ deadline passed
'cancelled'     -- RFQ cancelled
```

### `enum_currency_code`
Used in: `supplier_quotes.currency`

```sql
'USD'           -- US Dollar - Default
'EUR'           -- Euro
'GBP'           -- British Pound
'CAD'           -- Canadian Dollar
'JPY'           -- Japanese Yen
'CNY'           -- Chinese Yuan
'KRW'           -- Korean Won
'SGD'           -- Singapore Dollar
'AUD'           -- Australian Dollar
'MXN'           -- Mexican Peso
'VND'           -- Vietnamese Dong
'THB'           -- Thai Baht
'MYR'           -- Malaysian Ringgit
'IDR'           -- Indonesian Rupiah
'PHP'           -- Philippine Peso
```

---

## 6. Communication System

### `enum_message_type`
Used in: `messages.message_type`

```sql
'message'       -- Regular message - Default
'notification'  -- System notification
'alert'         -- Important alert
'reminder'      -- Reminder message
'system'        -- System-generated message
'announcement'  -- Company announcement
```

### `enum_message_priority`
Used in: `messages.priority`

```sql
'low'           -- Low priority message
'normal'        -- Normal priority - Default
'high'          -- High priority message
'urgent'        -- Urgent message (triggers SMS/push)
```

### `enum_sender_recipient_type`
Used in: `messages.sender_type`, `messages.recipient_type`

```sql
'user'          -- Internal user
'contact'       -- External contact (customer/supplier)
'system'        -- System-generated
'department'    -- Department-wide message
'role'          -- Role-based message
```

### `enum_notification_delivery_method`
Used in: `notifications.delivery_method`

```sql
'in_app'        -- In-application notification - Default
'email'         -- Email notification
'sms'           -- SMS notification
'push'          -- Push notification
'webhook'       -- Webhook notification
```

---

## 7. Activity & Audit Trail

### `enum_activity_action`
Used in: `activity_log.action`

```sql
'INSERT'        -- Record created
'UPDATE'        -- Record updated
'DELETE'        -- Record deleted
'VIEW'          -- Record viewed
'DOWNLOAD'      -- File downloaded
'UPLOAD'        -- File uploaded
'APPROVE'       -- Item approved
'REJECT'        -- Item rejected
'ASSIGN'        -- Item assigned
'COMMENT'       -- Comment added
'SHARE'         -- Item shared
'EXPORT'        -- Data exported
'LOGIN'         -- User logged in
'LOGOUT'        -- User logged out
```

### `enum_entity_type`
Used in: `activity_log.entity_type`

```sql
'projects'      -- Project records
'documents'     -- Document records
'reviews'       -- Review records
'messages'      -- Message records
'users'         -- User records
'contacts'      -- Contact records
'supplier_rfqs' -- Supplier RFQ records
'supplier_quotes' -- Supplier quote records
'notifications' -- Notification records
'workflow_stages' -- Workflow stage records
```

### `enum_system_event_status`
Used in: `system_events.status`

```sql
'pending'       -- Event pending processing - Default
'processed'     -- Event successfully processed
'failed'        -- Event processing failed
'retrying'      -- Event being retried
'cancelled'     -- Event cancelled
```

### `enum_system_event_source`
Used in: `system_events.source`

```sql
'system'        -- Internal system event
'api'           -- API-triggered event
'webhook'       -- Webhook-triggered event
'scheduler'     -- Scheduled event
'user'          -- User-triggered event
'integration'   -- External integration event
```

---

## 8. Workflow Configuration

### `enum_workflow_rule_type`
Used in: `workflow_business_rules.rule_type`

```sql
'auto_advance'     -- Automatically advance to next stage
'approval_required' -- Require approval before proceeding
'notification'     -- Send notifications
'assignment'       -- Auto-assign tasks/projects
'validation'       -- Validate data before proceeding
'escalation'       -- Escalate overdue items
'reminder'         -- Send reminder notifications
```

### `enum_workflow_rule_execution_status`
Used in: `workflow_rule_executions.execution_status`

```sql
'success'      -- Rule executed successfully - Default
'failed'       -- Rule execution failed
'partial'      -- Rule partially executed
'skipped'      -- Rule skipped (conditions not met)
```

### `enum_approval_request_status`
Used in: `approval_requests.status`

```sql
'pending'      -- Approval pending - Default
'approved'     -- Request approved
'rejected'     -- Request rejected
'delegated'    -- Approval delegated to another user
'expired'      -- Approval request expired
'cancelled'    -- Approval request cancelled
```

---

## 9. File and Media Types

### `enum_file_type`
Used in: `documents.file_type`

```sql
'pdf'          -- application/pdf
'xlsx'         -- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
'xls'          -- application/vnd.ms-excel
'docx'         -- application/vnd.openxmlformats-officedocument.wordprocessingml.document
'doc'          -- application/msword
'dwg'          -- application/acad (AutoCAD)
'step'         -- application/step (3D CAD)
'stp'          -- application/step (3D CAD)
'iges'         -- application/iges (3D CAD)
'igs'          -- application/iges (3D CAD)
'sldprt'       -- application/sldworks (SolidWorks)
'sldasm'       -- application/sldworks (SolidWorks Assembly)
'png'          -- image/png
'jpg'          -- image/jpeg
'jpeg'         -- image/jpeg
'gif'          -- image/gif
'txt'          -- text/plain
'csv'          -- text/csv
'zip'          -- application/zip
'rar'          -- application/x-rar-compressed
```

---

## 10. Supplier Qualification System

### `enum_supplier_qualification_type`
Used in: `supplier_qualifications.qualification_type`

```sql
'initial'       -- Initial supplier qualification
'annual'        -- Annual review
'project_specific' -- Project-specific qualification
'audit'         -- Audit-based qualification
'certification' -- Certification-based qualification
```

### `enum_supplier_status`
Used in: `supplier_qualifications.status`

```sql
'active'        -- Active supplier - Default
'probation'     -- On probation (performance issues)
'suspended'     -- Temporarily suspended
'blacklisted'   -- Permanently blacklisted
'pending_review' -- Pending qualification review
```

### `enum_supplier_tier`
Used in: `supplier_qualifications.tier`

```sql
'preferred'     -- Preferred supplier (highest tier)
'standard'      -- Standard supplier - Default
'conditional'   -- Conditional approval (limited use)
'restricted'    -- Restricted use (specific conditions)
```

### `enum_performance_metric_type`
Used in: `supplier_performance_metrics.metric_type`

```sql
'on_time_delivery'    -- On-time delivery percentage
'quality_rating'      -- Quality rating score
'cost_variance'       -- Cost variance from target
'response_time'       -- Response time to RFQs
'defect_rate'         -- Defect rate percentage
'lead_time_accuracy'  -- Lead time accuracy
'communication_rating' -- Communication effectiveness
```

### `enum_measurement_period`
Used in: `supplier_performance_metrics.measurement_period`

```sql
'daily'         -- Daily measurements
'weekly'        -- Weekly measurements
'monthly'       -- Monthly measurements
'quarterly'     -- Quarterly measurements
'yearly'        -- Annual measurements
```

---

## 11. AI Processing System

### `enum_ai_entity_type`
Used in: `ai_processing_queue.entity_type`

```sql
'document'      -- Document processing
'supplier'      -- Supplier analysis
'project'       -- Project analysis
'bom'           -- BOM generation/analysis
'quote'         -- Quote analysis
```

### `enum_ai_processing_type`
Used in: `ai_processing_queue.processing_type`

```sql
'document_extraction'    -- Extract data from documents
'supplier_categorization' -- Categorize suppliers
'bom_generation'         -- Generate BOM from drawings
'quote_analysis'         -- Analyze quotes
'risk_assessment'        -- Assess risks
'compliance_check'       -- Check compliance
```

### `enum_ai_processing_status`
Used in: `ai_processing_queue.status`

```sql
'queued'        -- Queued for processing - Default
'processing'    -- Currently processing
'completed'     -- Processing completed
'failed'        -- Processing failed
'cancelled'     -- Processing cancelled
```

### `enum_ai_model_type`
Used in: `ai_model_configs.model_type`

```sql
'document_extraction' -- Document data extraction
'classification'      -- Classification models
'scoring'             -- Scoring models
'prediction'          -- Prediction models
'nlp'                 -- Natural language processing
```

---

## 12. Cloud Storage Integration

### `enum_cloud_storage_provider`
Used in: `cloud_storage_integrations.provider`

```sql
'google_drive'  -- Google Drive
'dropbox'       -- Dropbox
'onedrive'      -- Microsoft OneDrive
's3'            -- Amazon S3
'azure_blob'    -- Azure Blob Storage
```

### `enum_cloud_sync_status`
Used in: `cloud_storage_integrations.sync_status`

```sql
'active'        -- Active and syncing - Default
'error'         -- Sync error occurred
'disabled'      -- Sync disabled
'expired'       -- Credentials expired
```

### `enum_document_sync_action`
Used in: `document_sync_log.sync_action`

```sql
'upload'        -- Upload to cloud
'download'      -- Download from cloud
'update'        -- Update existing file
'delete'        -- Delete from cloud
'conflict_resolution' -- Resolve sync conflict
```

### `enum_sync_result_status`
Used in: `document_sync_log.status`

```sql
'success'       -- Sync successful
'failed'        -- Sync failed
'pending'       -- Sync pending
'conflict'      -- Sync conflict
```

---

## 13. BOM Management

### `enum_unit_of_measure`
Used in: `bom_items.unit_of_measure`

```sql
'pcs'           -- Pieces - Default
'kg'            -- Kilograms
'g'             -- Grams
'lb'            -- Pounds
'oz'            -- Ounces
'm'             -- Meters
'cm'            -- Centimeters
'mm'            -- Millimeters
'in'            -- Inches
'ft'            -- Feet
'l'             -- Liters
'ml'            -- Milliliters
'gal'           -- Gallons
'sqm'           -- Square meters
'sqft'          -- Square feet
'set'           -- Sets
'lot'           -- Lots
'roll'          -- Rolls
'sheet'         -- Sheets
```

---

## 14. Localization

### `enum_language_code`
Used in: `user_preferences.language`

```sql
'en'            -- English (Default)
'es'            -- Spanish
'fr'            -- French
'de'            -- German
'it'            -- Italian
'pt'            -- Portuguese
'ja'            -- Japanese
'ko'            -- Korean
'zh'            -- Chinese (Simplified)
'zh-TW'         -- Chinese (Traditional)
'vi'            -- Vietnamese
'th'            -- Thai
'ms'            -- Malay
'id'            -- Indonesian
'tl'            -- Filipino/Tagalog
```

### `enum_time_zone`
Used in: `user_preferences.timezone`

```sql
'America/New_York'     -- Eastern Time
'America/Chicago'      -- Central Time
'America/Denver'       -- Mountain Time
'America/Los_Angeles'  -- Pacific Time
'Europe/London'        -- GMT/BST
'Europe/Paris'         -- CET/CEST
'Europe/Berlin'        -- CET/CEST
'Asia/Tokyo'           -- JST
'Asia/Shanghai'        -- CST
'Asia/Singapore'       -- SGT
'Asia/Ho_Chi_Minh'     -- Vietnam Time (ICT)
'Asia/Bangkok'         -- Thailand Time (ICT)
'Asia/Kuala_Lumpur'    -- Malaysia Time (MYT)
'Asia/Jakarta'         -- Indonesia Time (WIB)
'Asia/Manila'          -- Philippines Time (PHT)
'Asia/Hong_Kong'       -- Hong Kong Time (HKT)
'Australia/Sydney'     -- AEST/AEDT
```

---

## ✅ Usage Guidelines

### 1. Database Implementation
```sql
-- Example: Create ENUM type
CREATE TYPE enum_project_status AS ENUM (
  'active', 'delayed', 'on_hold', 'cancelled', 'completed', 'archived'
);

-- Use in table
CREATE TABLE projects (
  status enum_project_status NOT NULL DEFAULT 'active'
);
```

### 2. Frontend Implementation
```ts
// TypeScript enum for frontend
enum ProjectStatus {
  Active = 'active',
  Delayed = 'delayed',
  OnHold = 'on_hold',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Archived = 'archived'
}
```

### 3. API Validation
```json
{
  "status": {
    "type": "string",
    "enum": ["active", "delayed", "on_hold", "cancelled", "completed", "archived"]
  }
}
```

### 4. Migration & Updates
- Always update this document first
- Sync with database `CHECK` constraints or `ENUM` types
- Update frontend dropdowns and API schemas
- Add new values with `ALTER TYPE` or update `CHECK` constraints

This `database-enum-types.md` serves as the **single source of truth** for all controlled vocabularies in the Factory Pulse system, ensuring consistency across database, API, and UI layers.