# Factory Pulse Database Selection Items

## Overview

This document lists all predefined selection items, enums, and dropdown options used throughout the Factory Pulse database schema. These items ensure data consistency and provide clear options for users across the system.

---

## 1. Organizations & Users

### Subscription Plans
```sql
-- organizations.subscription_plan
'starter'     -- Default plan for new organizations
'growth'      -- Mid-tier plan with advanced features
'enterprise'  -- Full-featured plan with custom integrations
'trial'       -- Trial period
'suspended'   -- Account suspended
'cancelled'   -- Cancelled subscription
```

### User Roles
```sql
-- users.role
'customer'     -- External customer users
'sales'        -- Sales representatives and account managers
'procurement'  -- Procurement owners and buyers
'engineering'  -- Engineering team members
'qa'          -- Quality assurance team
'production'   -- Production and manufacturing team
'management'   -- Management and executives
'supplier'     -- External supplier users
'admin'       -- System administrators
```

### Contact Types
```sql
-- contacts.type
'customer'    -- Customer contacts
'supplier'    -- Supplier contacts
```

---

## 2. Projects & Workflow

### Project Priority Levels
```sql
-- projects.priority_level
'low'         -- Low priority (🟢 Green)
'medium'      -- Medium priority (🟡 Yellow) - Default
'high'        -- High priority (🔴 Red)
'urgent'      -- Urgent priority (🔴 Red with special handling)
```

### Project Sources
```sql
-- projects.source
'manual'      -- Manually created by internal users - Default
'portal'      -- Submitted through customer portal
'email'       -- Created from email integration
'api'         -- Created via API integration
'import'      -- Bulk imported
'migration'   -- Migrated from legacy system
```

### Default Workflow Stages
```sql
-- workflow_stages.slug (configurable per organization)
'inquiry_received'     -- Initial stage when RFQ is submitted
'technical_review'     -- Engineering, QA, Production review
'supplier_rfq_sent'    -- RFQs sent to suppliers
'quoted'              -- Quote generated and sent to customer
'order_confirmed'     -- Customer accepted quote
'procurement_planning' -- BOM, POs, inventory planning
'in_production'       -- Manufacturing and assembly
'shipped_closed'      -- Completed and delivered
```

### Stage Colors (Hex Codes)
```sql
-- workflow_stages.color
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

### Document Types
```sql
-- documents.document_type
'rfq'           -- Request for Quote documents
'drawing'       -- Technical drawings (PDF, DWG, STEP)
'specification' -- Technical specifications
'quote'         -- Generated quotes
'po'           -- Purchase orders
'invoice'      -- Invoices and billing documents
'certificate'  -- Certificates (material, quality, compliance)
'report'       -- Test reports, inspection reports
'bom'          -- Bill of Materials
'other'        -- Miscellaneous documents
```

### Storage Providers
```sql
-- documents.storage_provider
'supabase'      -- Supabase Storage (Default)
'google_drive'  -- Google Drive integration
'dropbox'       -- Dropbox integration
'onedrive'      -- Microsoft OneDrive
's3'           -- Amazon S3
'azure_blob'   -- Azure Blob Storage
```

### Document Sync Status
```sql
-- documents.sync_status
'synced'        -- Successfully synced - Default
'pending'       -- Sync pending
'failed'        -- Sync failed
'conflict'      -- Sync conflict needs resolution
```

### AI Processing Status
```sql
-- documents.ai_processing_status
'pending'       -- AI processing pending - Default
'processing'    -- Currently being processed by AI
'completed'     -- AI processing completed
'failed'        -- AI processing failed
'skipped'       -- AI processing skipped
```

### Document Access Levels
```sql
-- documents.access_level
'public'       -- Publicly accessible (rare)
'customer'     -- Customer can view
'supplier'     -- Supplier can view
'internal'     -- Internal team only - Default
'restricted'   -- Admin/Management only
```

### Document Actions (Audit Log)
```sql
-- document_access_log.action
'view'         -- Document viewed
'download'     -- Document downloaded
'upload'       -- Document uploaded
'delete'       -- Document deleted
'share'        -- Document shared
'comment'      -- Comment added
'approve'      -- Document approved
```

---

## 4. Reviews & Approvals

### Review Types
```sql
-- reviews.review_type
'standard'     -- Standard review process - Default
'technical'    -- Technical/Engineering review
'quality'      -- Quality assurance review
'production'   -- Manufacturing feasibility review
'cost'         -- Cost analysis review
'compliance'   -- Regulatory compliance review
'safety'       -- Safety assessment review
```

### Review Status
```sql
-- reviews.status
'pending'      -- Review not started - Default
'in_progress'  -- Review in progress
'approved'     -- Review approved
'rejected'     -- Review rejected
'needs_info'   -- More information required
'on_hold'      -- Review temporarily paused
```

### Review Priority
```sql
-- reviews.priority
'low'          -- Low priority review
'medium'       -- Medium priority review - Default
'high'         -- High priority review
'urgent'       -- Urgent review required
```

---

## 5. Supplier Management

### Supplier RFQ Status
```sql
-- supplier_rfqs.status
'draft'        -- RFQ being prepared - Default
'sent'         -- RFQ sent to supplier
'viewed'       -- Supplier viewed the RFQ
'quoted'       -- Supplier submitted quote
'declined'     -- Supplier declined to quote
'expired'      -- RFQ deadline passed
'cancelled'    -- RFQ cancelled
```

### Quote Evaluation Scores
```sql
-- supplier_quotes.evaluation_score
1-10           -- Numeric scale (1 = Poor, 10 = Excellent)
-- Typical meanings:
-- 1-2: Poor (major issues)
-- 3-4: Below average
-- 5-6: Average/Acceptable
-- 7-8: Good
-- 9-10: Excellent
```

### Currency Codes
```sql
-- supplier_quotes.currency
'USD'          -- US Dollar - Default
'EUR'          -- Euro
'GBP'          -- British Pound
'CAD'          -- Canadian Dollar
'JPY'          -- Japanese Yen
'CNY'          -- Chinese Yuan
'KRW'          -- Korean Won
'SGD'          -- Singapore Dollar
'AUD'          -- Australian Dollar
'MXN'          -- Mexican Peso
'VND'          -- Vietnamese Dong
'THB'          -- Thai Baht
'MYR'          -- Malaysian Ringgit
'IDR'          -- Indonesian Rupiah
'PHP'          -- Philippine Peso
```

---

## 6. Communication System

### Message Types
```sql
-- messages.message_type
'message'      -- Regular message - Default
'notification' -- System notification
'alert'        -- Important alert
'reminder'     -- Reminder message
'system'       -- System-generated message
'announcement' -- Company announcement
```

### Message Priority
```sql
-- messages.priority
'low'          -- Low priority message
'normal'       -- Normal priority - Default
'high'         -- High priority message
'urgent'       -- Urgent message (triggers SMS/push)
```

### Sender/Recipient Types
```sql
-- messages.sender_type / recipient_type
'user'         -- Internal user
'contact'      -- External contact (customer/supplier)
'system'       -- System-generated
'department'   -- Department-wide message
'role'         -- Role-based message
```

### Notification Delivery Methods
```sql
-- notifications.delivery_method
'in_app'       -- In-application notification - Default
'email'        -- Email notification
'sms'          -- SMS notification
'push'         -- Push notification
'webhook'      -- Webhook notification
```

---

## 7. Activity & Audit Trail

### Activity Actions
```sql
-- activity_log.action
'INSERT'       -- Record created
'UPDATE'       -- Record updated
'DELETE'       -- Record deleted
'VIEW'         -- Record viewed
'DOWNLOAD'     -- File downloaded
'UPLOAD'       -- File uploaded
'APPROVE'      -- Item approved
'REJECT'       -- Item rejected
'ASSIGN'       -- Item assigned
'COMMENT'      -- Comment added
'SHARE'        -- Item shared
'EXPORT'       -- Data exported
'LOGIN'        -- User logged in
'LOGOUT'       -- User logged out
```

### Entity Types
```sql
-- activity_log.entity_type
'projects'     -- Project records
'documents'    -- Document records
'reviews'      -- Review records
'messages'     -- Message records
'users'        -- User records
'contacts'     -- Contact records
'supplier_rfqs' -- Supplier RFQ records
'supplier_quotes' -- Supplier quote records
'notifications' -- Notification records
'workflow_stages' -- Workflow stage records
```

### System Event Status
```sql
-- system_events.status
'pending'      -- Event pending processing - Default
'processed'    -- Event successfully processed
'failed'       -- Event processing failed
'retrying'     -- Event being retried
'cancelled'    -- Event cancelled
```

### System Event Sources
```sql
-- system_events.source
'system'       -- Internal system event
'api'          -- API-triggered event
'webhook'      -- Webhook-triggered event
'scheduler'    -- Scheduled event
'user'         -- User-triggered event
'integration'  -- External integration event
```

---

## 8. Workflow Configuration (New)

### Business Rule Types
```sql
-- workflow_business_rules.rule_type
'auto_advance'     -- Automatically advance to next stage
'approval_required' -- Require approval before proceeding
'notification'     -- Send notifications
'assignment'       -- Auto-assign tasks/projects
'validation'       -- Validate data before proceeding
'escalation'       -- Escalate overdue items
'reminder'         -- Send reminder notifications
```

### Rule Execution Status
```sql
-- workflow_rule_executions.execution_status
'success'      -- Rule executed successfully - Default
'failed'       -- Rule execution failed
'partial'      -- Rule partially executed
'skipped'      -- Rule skipped (conditions not met)
```

### Approval Request Status
```sql
-- approval_requests.status
'pending'      -- Approval pending - Default
'approved'     -- Request approved
'rejected'     -- Request rejected
'delegated'    -- Approval delegated to another user
'expired'      -- Approval request expired
'cancelled'    -- Approval request cancelled
```

---

## 9. File and Media Types

### Supported File Types
```sql
-- documents.file_type / mime_type mappings
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

## 10. Countries and Regions

### Common Countries
```sql
-- contacts.country (expandable list)
'United States'
'Canada'
'United Kingdom'
'Germany'
'France'
'Italy'
'Spain'
'Netherlands'
'Belgium'
'Switzerland'
'Austria'
'Sweden'
'Norway'
'Denmark'
'Finland'
'Japan'
'South Korea'
'China'
'Taiwan'
'Singapore'
'Australia'
'New Zealand'
'Mexico'
'Brazil'
'India'
'Vietnam'       -- Vietnam added
'Thailand'
'Malaysia'
'Indonesia'
'Philippines'
'Hong Kong'
-- ... (full ISO country list can be implemented)
```

---

## 11. Time Zones
```sql
-- user_preferences.timezone
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
-- ... (full timezone list)
```

---

## 12. Language Codes
```sql
-- user_preferences.language
'en'           -- English (Default)
'es'           -- Spanish
'fr'           -- French
'de'           -- German
'it'           -- Italian
'pt'           -- Portuguese
'ja'           -- Japanese
'ko'           -- Korean
'zh'           -- Chinese (Simplified)
'zh-TW'        -- Chinese (Traditional)
'vi'           -- Vietnamese
'th'           -- Thai
'ms'           -- Malay
'id'           -- Indonesian
'tl'           -- Filipino/Tagalog
```

---

## Usage Notes

### Adding New Selection Items
1. **Database First**: Add new values to CHECK constraints in SQL
2. **Frontend Sync**: Update frontend dropdown components
3. **API Validation**: Update API validation schemas
4. **Documentation**: Update this document

### Customization
- Most selection items can be extended per organization
- Workflow stages are fully customizable
- Business rules can be configured per organization
- Some items (like currencies, countries) should remain standardized

### Validation
- All selection items should be validated at both database and application levels
- Use CHECK constraints for critical enums
- Implement frontend validation for user experience
- Log validation errors for debugging

---

## 13. Supplier Qualification System

### Qualification Types
```sql
-- supplier_qualifications.qualification_type
'initial'       -- Initial supplier qualification
'annual'        -- Annual review
'project_specific' -- Project-specific qualification
'audit'         -- Audit-based qualification
'certification' -- Certification-based qualification
```

### Supplier Status
```sql
-- supplier_qualifications.status
'active'        -- Active supplier - Default
'probation'     -- On probation (performance issues)
'suspended'     -- Temporarily suspended
'blacklisted'   -- Permanently blacklisted
'pending_review' -- Pending qualification review
```

### Supplier Tiers
```sql
-- supplier_qualifications.tier
'preferred'     -- Preferred supplier (highest tier)
'standard'      -- Standard supplier - Default
'conditional'   -- Conditional approval (limited use)
'restricted'    -- Restricted use (specific conditions)
```

### Performance Metric Types
```sql
-- supplier_performance_metrics.metric_type
'on_time_delivery'    -- On-time delivery percentage
'quality_rating'      -- Quality rating score
'cost_variance'       -- Cost variance from target
'response_time'       -- Response time to RFQs
'defect_rate'         -- Defect rate percentage
'lead_time_accuracy'  -- Lead time accuracy
'communication_rating' -- Communication effectiveness
```

### Measurement Periods
```sql
-- supplier_performance_metrics.measurement_period
'daily'         -- Daily measurements
'weekly'        -- Weekly measurements
'monthly'       -- Monthly measurements
'quarterly'     -- Quarterly measurements
'yearly'        -- Annual measurements
```

---

## 14. AI Processing System

### AI Entity Types
```sql
-- ai_processing_queue.entity_type
'document'      -- Document processing
'supplier'      -- Supplier analysis
'project'       -- Project analysis
'bom'          -- BOM generation/analysis
'quote'        -- Quote analysis
```

### AI Processing Types
```sql
-- ai_processing_queue.processing_type
'document_extraction'    -- Extract data from documents
'supplier_categorization' -- Categorize suppliers
'bom_generation'        -- Generate BOM from drawings
'quote_analysis'        -- Analyze quotes
'risk_assessment'       -- Assess risks
'compliance_check'      -- Check compliance
```

### AI Processing Status
```sql
-- ai_processing_queue.status
'queued'        -- Queued for processing - Default
'processing'    -- Currently processing
'completed'     -- Processing completed
'failed'        -- Processing failed
'cancelled'     -- Processing cancelled
```

### AI Model Types
```sql
-- ai_model_configs.model_type
'document_extraction' -- Document data extraction
'classification'      -- Classification models
'scoring'            -- Scoring models
'prediction'         -- Prediction models
'nlp'               -- Natural language processing
```

---

## 15. Cloud Storage Integration

### Cloud Storage Providers
```sql
-- cloud_storage_integrations.provider
'google_drive'  -- Google Drive
'dropbox'       -- Dropbox
'onedrive'      -- Microsoft OneDrive
's3'           -- Amazon S3
'azure_blob'   -- Azure Blob Storage
```

### Cloud Sync Status
```sql
-- cloud_storage_integrations.sync_status
'active'        -- Active and syncing - Default
'error'         -- Sync error occurred
'disabled'      -- Sync disabled
'expired'       -- Credentials expired
```

### Document Sync Actions
```sql
-- document_sync_log.sync_action
'upload'        -- Upload to cloud
'download'      -- Download from cloud
'update'        -- Update existing file
'delete'        -- Delete from cloud
'conflict_resolution' -- Resolve sync conflict
```

### Sync Result Status
```sql
-- document_sync_log.status
'success'       -- Sync successful
'failed'        -- Sync failed
'pending'       -- Sync pending
'conflict'      -- Sync conflict
```

---

## 16. BOM Management

### Units of Measure
```sql
-- bom_items.unit_of_measure
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

## 17. Extended Localization (Vietnam Focus)

### Vietnam-Specific Currencies
```sql
-- Additional currency support
'VND'           -- Vietnamese Dong (₫)
'THB'           -- Thai Baht (฿)
'MYR'           -- Malaysian Ringgit (RM)
'IDR'           -- Indonesian Rupiah (Rp)
'PHP'           -- Philippine Peso (₱)
```

### Vietnam Time Zone
```sql
-- Vietnam and Southeast Asia timezones
'Asia/Ho_Chi_Minh'     -- Vietnam Time (UTC+7)
'Asia/Bangkok'         -- Thailand Time (UTC+7)
'Asia/Kuala_Lumpur'    -- Malaysia Time (UTC+8)
'Asia/Jakarta'         -- Indonesia Time (UTC+7)
'Asia/Manila'          -- Philippines Time (UTC+8)
```

### Southeast Asian Languages
```sql
-- Additional language support
'vi'            -- Vietnamese (Tiếng Việt)
'th'            -- Thai (ไทย)
'ms'            -- Malay (Bahasa Melayu)
'id'            -- Indonesian (Bahasa Indonesia)
'tl'            -- Filipino/Tagalog
```

---

## Production Readiness Checklist

### Database Schema Stability
- ✅ All tables use UUID primary keys for scalability
- ✅ JSONB fields for flexible, future-proof data storage
- ✅ Comprehensive indexing for performance
- ✅ Row Level Security (RLS) for multi-tenancy
- ✅ Audit trails and activity logging
- ✅ Soft deletes where appropriate
- ✅ Timestamp tracking (created_at, updated_at)

### AI-Ready Architecture
- ✅ AI processing queue for async operations
- ✅ Flexible AI model configuration system
- ✅ Confidence scoring for AI results
- ✅ AI-extracted data stored separately from manual data
- ✅ Retry mechanisms for failed AI processing
- ✅ Performance metrics tracking for AI models

### Cloud Integration Ready
- ✅ Multi-provider cloud storage support
- ✅ Sync status tracking and conflict resolution
- ✅ Encrypted credential storage
- ✅ Comprehensive sync logging

### Supplier Management
- ✅ Multi-dimensional supplier scoring
- ✅ Performance metrics tracking
- ✅ Qualification workflow support
- ✅ Risk assessment capabilities
- ✅ Tier-based supplier management

### Scalability Features
- ✅ Organization-based multi-tenancy
- ✅ Configurable workflows per organization
- ✅ Extensible metadata fields (JSONB)
- ✅ Queue-based processing for heavy operations
- ✅ Comprehensive caching strategy via indexes

This comprehensive list ensures consistency across the Factory Pulse platform and provides clear options for users while maintaining flexibility for customization and future AI automation features.