# Factory Pulse Database Schema - Initial Foundation

This document describes the initial database schema for Factory Pulse, a Manufacturing Execution System (MES) designed for multi-tenant SaaS deployment with Vietnam localization support.

## Schema Overview

The initial schema establishes the foundational structure for:
- Multi-tenant organization management
- User authentication and role-based access control  
- Configurable workflow stages for manufacturing processes
- Customer and supplier contact management
- Project lifecycle management with workflow tracking

---

## Current Implementation Status

| Component                | Status        | Description                                                   |
| ------------------------ | ------------- | ------------------------------------------------------------- |
| **Core Tables**          | ✅ Implemented | Organizations, users, contacts, workflow_stages, projects     |
| **Extended Tables**      | ✅ Implemented | Documents, reviews, messages, notifications, activity_log     |
| **Custom Types**         | ✅ Implemented | User roles, statuses, contact types, priority levels          |
| **Multi-Tenancy**        | ✅ Implemented | Organization-based data isolation with RLS policies           |
| **Authentication**       | ✅ Ready       | Extends Supabase auth.users with organizational context       |
| **Workflow Engine**      | ✅ Foundation  | Configurable stages with role assignments                     |
| **Functions & Triggers** | ✅ Enhanced    | Auto-timestamps, project IDs, activity logging, notifications |

---

## Database Schema Structure

### Custom Types

The schema defines several custom PostgreSQL types for data consistency:

```sql
-- User roles covering all manufacturing workflow participants
CREATE TYPE user_role AS ENUM (
    'admin', 'management', 'sales', 'engineering', 
    'qa', 'production', 'procurement', 'supplier', 'customer'
);

-- User account status for access control
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Contact classification for external entities
CREATE TYPE contact_type AS ENUM ('customer', 'supplier', 'partner', 'internal');

-- Project lifecycle status (separate from workflow stages)
CREATE TYPE project_status AS ENUM ('active', 'completed', 'cancelled', 'on_hold');

-- Priority levels for projects and tasks
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Subscription tiers for SaaS model
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'enterprise');
```

### Core Tables

#### 1. Organizations (Multi-Tenancy Root)

The organizations table serves as the foundation for multi-tenant architecture:

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    industry VARCHAR(100),
    settings JSONB DEFAULT '{}',
    subscription_plan subscription_plan DEFAULT 'starter',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- **Multi-Tenant Root**: All other tables reference organization_id for data isolation
- **Flexible Settings**: JSONB field for organization-specific configuration
- **SaaS Ready**: Subscription plan tracking for billing and feature access
- **URL-Friendly**: Slug field for clean URLs and API endpoints

#### 2. Workflow Stages (Configurable Process Flow)

Defines the manufacturing workflow stages that projects progress through:

```sql
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[] DEFAULT '{}',
    sub_stages_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, slug),
    UNIQUE(organization_id, stage_order)
);
```

**Key Features:**
- **Configurable Workflow**: Organizations can customize their manufacturing process
- **Visual Coding**: Color field for UI representation
- **Role Assignment**: Array of responsible roles for each stage
- **Exit Criteria**: Textual description of requirements to advance to next stage
- **Ordering**: Numeric ordering for proper workflow sequence
- **Sub-Stages Support**: Count of sub-stages for quick reference

#### 2a. Workflow Sub-Stages (Granular Process Steps)

Defines detailed sub-stages within each workflow stage for granular process tracking:

```sql
CREATE TABLE workflow_sub_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    sub_stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[] DEFAULT '{}',
    estimated_duration_hours INTEGER,
    is_required BOOLEAN DEFAULT true,
    can_skip BOOLEAN DEFAULT false,
    auto_advance BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approval_roles user_role[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_stage_id, slug),
    UNIQUE(workflow_stage_id, sub_stage_order)
);
```

**Key Features:**
- **Granular Tracking**: Detailed steps within each workflow stage
- **Duration Management**: Estimated hours for each sub-stage
- **Flexible Requirements**: Optional sub-stages that can be skipped
- **Auto-Advancement**: Automatic progression based on time or conditions
- **Approval Workflows**: Some sub-stages require specific role approvals
- **Role Assignment**: Specific responsible roles for each sub-stage
- **Metadata Support**: JSONB field for extensible configuration

#### 2b. Project Sub-Stage Progress (Progress Tracking)

Tracks the progress of sub-stages for each project:

```sql
CREATE TABLE project_sub_stage_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, sub_stage_id)
);
```

**Key Features:**
- **Status Tracking**: Complete lifecycle from pending to completed
- **Time Tracking**: Start and completion timestamps
- **Assignment Management**: Track who is working on each sub-stage
- **Notes Support**: Progress notes and comments
- **Metadata**: Extensible data storage for custom fields

#### 3. Users (Internal Employees)

Extends Supabase authentication with organizational context and role-based access:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    status user_status DEFAULT 'active',
    description TEXT,
    employee_id VARCHAR(50),
    direct_manager_id UUID REFERENCES users(id),
    direct_reports UUID[] DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- **Supabase Integration**: Extends auth.users with business context
- **Organizational Hierarchy**: Manager-report relationships
- **Role-Based Access**: Manufacturing-specific roles (engineering, qa, production, etc.)
- **Flexible Preferences**: JSONB field for user-specific settings

#### 4. Contacts (External Entities)

Manages customers, suppliers, and other external business contacts:

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    website VARCHAR(255),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    ai_category JSONB DEFAULT '{}',
    ai_capabilities TEXT[] DEFAULT '{}',
    ai_risk_score DECIMAL(5,2),
    ai_last_analyzed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

**Key Features:**
- **External Entity Management**: Separate from internal users table
- **Business Information**: Complete company and contact details
- **AI Integration Ready**: Fields for automated categorization and risk assessment
- **Financial Tracking**: Credit limits and payment terms
- **Audit Trail**: Created by tracking for accountability

#### 5. Projects (Core Business Entity)

Central table for managing manufacturing projects through the workflow:

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES contacts(id),
    current_stage_id UUID REFERENCES workflow_stages(id),
    status project_status DEFAULT 'active',
    priority_score INTEGER DEFAULT 50,
    priority_level priority_level DEFAULT 'medium',
    estimated_value DECIMAL(15,2),
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id)
);
```

**Key Features:**
- **Unique Project IDs**: Human-readable project identifiers (P-YYMMDDXX format)
- **Workflow Integration**: Links to current workflow stage
- **Dual Status System**: Project status (active/cancelled) separate from workflow stage
- **Priority Management**: Both numeric score and categorical priority levels
- **Customer Relationship**: Links to customer contacts
- **Assignment Tracking**: Created by and assigned to users
- **Flexible Metadata**: JSONB for project-specific data

### 2. Projects & Workflow

```sql
-- Workflow stages (configurable per org)
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280' 
      CHECK (color ~* '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
    stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles TEXT[] DEFAULT '{}',
    sub_stages_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug),
    UNIQUE(organization_id, stage_order)
);

-- Workflow sub-stages (granular process steps)
CREATE TABLE workflow_sub_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    sub_stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[] DEFAULT '{}',
    estimated_duration_hours INTEGER,
    is_required BOOLEAN DEFAULT true,
    can_skip BOOLEAN DEFAULT false,
    auto_advance BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approval_roles user_role[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_stage_id, slug),
    UNIQUE(workflow_stage_id, sub_stage_order)
);

-- Project sub-stage progress tracking
CREATE TABLE project_sub_stage_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, sub_stage_id)
);

-- Main projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id VARCHAR(20) UNIQUE NOT NULL, -- P-25082001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES contacts(id),
    current_stage_id UUID REFERENCES workflow_stages(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' 
      CHECK (status IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed')),
    priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    priority_level VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority_level IN ('low', 'medium', 'high', 'urgent', 'critical')),
    estimated_value DECIMAL(15,2),
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    source VARCHAR(20) DEFAULT 'manual' 
      CHECK (source IN ('manual', 'portal', 'email', 'api', 'import', 'migration')),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    project_type VARCHAR(50) 
      CHECK (project_type IN ('system_build', 'fabrication', 'manufacturing')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id)
);

-- Project stage history
CREATE TABLE project_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES workflow_stages(id),
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    entered_by UUID REFERENCES users(id),
    exit_reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project assignments
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(project_id, user_id, role)
);
```

### 3. Document Management

```sql
-- Documents with version control
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_latest BOOLEAN DEFAULT true,
    document_type VARCHAR(50) 
      CHECK (document_type IN ('rfq', 'drawing', 'specification', 'quote', 'po', 'invoice', 'certificate', 'report', 'bom', 'other')),
    access_level VARCHAR(20) DEFAULT 'internal' 
      CHECK (access_level IN ('public', 'customer', 'supplier', 'internal', 'restricted')),
    checksum VARCHAR(64),
    metadata JSONB DEFAULT '{}',
    storage_provider VARCHAR(50) DEFAULT 'supabase' 
      CHECK (storage_provider IN ('supabase', 'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob')),
    external_id VARCHAR(255),
    external_url TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced' 
      CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
    last_synced_at TIMESTAMPTZ,
    ai_extracted_data JSONB DEFAULT '{}',
    ai_processing_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    ai_confidence_score DECIMAL(5,2),
    ai_processed_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

-- Document versions (improved from parent-child)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    change_description TEXT,
    metadata JSONB DEFAULT '{}',
    UNIQUE(document_id, version_number)
);

-- Document comments
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    page_number INTEGER,
    coordinates JSONB,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES document_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document access log
CREATE TABLE document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL 
      CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'comment', 'approve')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Reviews & Approvals

```sql
-- Internal reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewer_role VARCHAR(50) NOT NULL,
    review_type VARCHAR(50) DEFAULT 'standard' 
      CHECK (review_type IN ('standard', 'technical', 'quality', 'production', 'cost', 'compliance', 'safety')),
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'needs_info', 'on_hold')),
    priority VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    comments TEXT,
    risks JSONB DEFAULT '[]',
    recommendations TEXT,
    tooling_required BOOLEAN DEFAULT false,
    estimated_cost DECIMAL(15,2),
    estimated_lead_time INTEGER,
    due_date DATE,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review checklist items
CREATE TABLE review_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ
);
```

### 5. Supplier Management & Quotes

```sql
-- Supplier RFQs
CREATE TABLE supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES contacts(id),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' 
      CHECK (status IN ('draft', 'sent', 'viewed', 'quoted', 'declined', 'expired', 'cancelled')),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    expected_response_date DATE,
    priority VARCHAR(10) DEFAULT 'medium',
    requirements TEXT,
    special_instructions TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier quotes
CREATE TABLE supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_rfq_id UUID REFERENCES supplier_rfqs(id) ON DELETE CASCADE,
    quote_number VARCHAR(50),
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND' 
      CHECK (currency IN ('USD', 'EUR', 'VND', 'THB', 'MYR', 'IDR', 'PHP', 'CNY', 'JPY', 'KRW', 'SGD', 'AUD', 'CAD', 'GBP')),
    quantity INTEGER,
    lead_time_days INTEGER,
    valid_until DATE,
    payment_terms VARCHAR(100),
    shipping_terms VARCHAR(100),
    notes TEXT,
    quote_file_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES users(id),
    evaluation_score INTEGER CHECK (evaluation_score BETWEEN 1 AND 10),
    evaluation_notes TEXT
);
```

### 6. Communication System

```sql
-- Messages (simplified thread model)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    thread_id UUID DEFAULT uuid_generate_v4(), -- All messages in same thread share ID
    sender_id UUID REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL 
      CHECK (sender_type IN ('user', 'contact', 'system')),
    sender_contact_id UUID REFERENCES contacts(id),
    recipient_type VARCHAR(20) NOT NULL 
      CHECK (recipient_type IN ('user', 'contact', 'department', 'role')),
    recipient_id UUID, -- user_id or contact_id
    recipient_role VARCHAR(50),
    recipient_department VARCHAR(100),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' 
      CHECK (message_type IN ('message', 'notification', 'alert', 'reminder', 'system', 'announcement')),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'in_app' 
      CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push', 'webhook')),
    delivered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Activity & Audit Trail

```sql
-- Activity log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System events and integrations
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'system', 'api', 'webhook', etc.
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'retrying')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Configuration & Settings

```sql
-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- Organization-wide settings
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    UNIQUE(organization_id, setting_key)
);

-- Email templates for notifications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, template_key)
);

-- Workflow stage transitions (configurable)
CREATE TABLE workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    to_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}', -- JSON conditions for transition
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, from_stage_id, to_stage_id)
);

-- Business rules for workflow automation
CREATE TABLE workflow_business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'auto_advance', 'approval_required', 'notification', 'assignment', 'validation'
    )),
    trigger_conditions JSONB NOT NULL, -- When to trigger the rule
    actions JSONB NOT NULL, -- What actions to take
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Rule execution log for audit and debugging
CREATE TABLE workflow_rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES workflow_business_rules(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    trigger_event VARCHAR(100) NOT NULL,
    conditions_met JSONB NOT NULL,
    actions_taken JSONB NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'success' CHECK (execution_status IN (
        'success', 'failed', 'partial', 'skipped'
    )),
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurable approval chains
CREATE TABLE approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    chain_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'quote', 'document', etc.
    conditions JSONB NOT NULL, -- When this chain applies
    steps JSONB NOT NULL, -- Array of approval steps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Individual approval requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID REFERENCES approval_chains(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id),
    approver_role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'delegated', 'expired'
    )),
    comments TEXT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier qualification and scoring system
CREATE TABLE supplier_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN (
        'initial', 'annual', 'project_specific', 'audit', 'certification'
    )),
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
    delivery_score DECIMAL(5,2) CHECK (delivery_score >= 0 AND delivery_score <= 100),
    cost_score DECIMAL(5,2) CHECK (cost_score >= 0 AND cost_score <= 100),
    communication_score DECIMAL(5,2) CHECK (communication_score >= 0 AND communication_score <= 100),
    technical_capability_score DECIMAL(5,2) CHECK (technical_capability_score >= 0 AND technical_capability_score <= 100),
    financial_stability_score DECIMAL(5,2) CHECK (financial_stability_score >= 0 AND financial_stability_score <= 100),
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'probation', 'suspended', 'blacklisted', 'pending_review'
    )),
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN (
        'preferred', 'standard', 'conditional', 'restricted'
    )),
    capabilities JSONB DEFAULT '[]', -- Array of capabilities
    certifications JSONB DEFAULT '[]', -- Array of certifications
    risk_factors JSONB DEFAULT '[]', -- Array of identified risks
    improvement_areas JSONB DEFAULT '[]', -- Areas needing improvement
    notes TEXT,
    next_review_date DATE,
    qualified_by UUID REFERENCES users(id),
    qualified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier performance tracking
CREATE TABLE supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'on_time_delivery', 'quality_rating', 'cost_variance', 'response_time',
        'defect_rate', 'lead_time_accuracy', 'communication_rating'
    )),
    metric_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4),
    measurement_period VARCHAR(20) NOT NULL CHECK (measurement_period IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    project_id UUID REFERENCES projects(id), -- Optional: project-specific metrics
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of Materials (BOM) management
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES bom_items(id), -- For hierarchical BOM
    item_number VARCHAR(100) NOT NULL,
    part_number VARCHAR(100),
    description TEXT NOT NULL,
    material VARCHAR(255),
    quantity DECIMAL(10,4) NOT NULL DEFAULT 1,
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,2),
    supplier_id UUID REFERENCES contacts(id),
    lead_time_days INTEGER,
    minimum_order_qty DECIMAL(10,4),
    specifications JSONB DEFAULT '{}',
    tolerances JSONB DEFAULT '{}',
    notes TEXT,
    is_critical BOOLEAN DEFAULT false,
    is_long_lead BOOLEAN DEFAULT false,
    -- AI-extracted fields
    ai_extracted BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(5,2),
    ai_source_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- AI processing queue and results
CREATE TABLE ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'document', 'supplier', 'project', 'bom', 'quote'
    )),
    entity_id UUID NOT NULL,
    processing_type VARCHAR(50) NOT NULL CHECK (processing_type IN (
        'document_extraction', 'supplier_categorization', 'bom_generation',
        'quote_analysis', 'risk_assessment', 'compliance_check'
    )),
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )),
    input_data JSONB NOT NULL,
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    processing_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI model configurations and versions
CREATE TABLE ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'document_extraction', 'classification', 'scoring', 'prediction', 'nlp'
    )),
    version VARCHAR(20) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, model_name, version)
);

-- Cloud storage integrations
CREATE TABLE cloud_storage_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- User who set up the integration
    provider VARCHAR(50) NOT NULL CHECK (provider IN (
        'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob'
    )),
    integration_name VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL, -- Encrypted credentials
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN (
        'active', 'error', 'disabled', 'expired'
    )),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document sync log for cloud storage
CREATE TABLE document_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES cloud_storage_integrations(id) ON DELETE CASCADE,
    sync_action VARCHAR(20) NOT NULL CHECK (sync_action IN (
        'upload', 'download', 'update', 'delete', 'conflict_resolution'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'success', 'failed', 'pending', 'conflict'
    )),
    error_message TEXT,
    file_size_bytes BIGINT,
    sync_duration_ms INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_project_id ON projects(project_id);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_is_latest ON documents(is_latest);

CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE INDEX idx_supplier_rfqs_project_id ON supplier_rfqs(project_id);
CREATE INDEX idx_supplier_rfqs_supplier_id ON supplier_rfqs(supplier_id);
CREATE INDEX idx_supplier_rfqs_status ON supplier_rfqs(status);

-- Additional indexes for workflow configuration
CREATE INDEX idx_workflow_stage_transitions_from_stage ON workflow_stage_transitions(from_stage_id);
CREATE INDEX idx_workflow_stage_transitions_to_stage ON workflow_stage_transitions(to_stage_id);
CREATE INDEX idx_workflow_business_rules_organization ON workflow_business_rules(organization_id);
CREATE INDEX idx_workflow_business_rules_active ON workflow_business_rules(is_active);
CREATE INDEX idx_workflow_rule_executions_rule_id ON workflow_rule_executions(rule_id);
CREATE INDEX idx_workflow_rule_executions_project_id ON workflow_rule_executions(project_id);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_requests_approver ON approval_requests(approver_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);

-- Indexes for new tables
CREATE INDEX idx_supplier_qualifications_supplier ON supplier_qualifications(supplier_id);
CREATE INDEX idx_supplier_qualifications_organization ON supplier_qualifications(organization_id);
CREATE INDEX idx_supplier_qualifications_status ON supplier_qualifications(status);
CREATE INDEX idx_supplier_qualifications_tier ON supplier_qualifications(tier);
CREATE INDEX idx_supplier_performance_metrics_supplier ON supplier_performance_metrics(supplier_id);
CREATE INDEX idx_supplier_performance_metrics_type ON supplier_performance_metrics(metric_type);
CREATE INDEX idx_supplier_performance_metrics_period ON supplier_performance_metrics(period_start, period_end);
CREATE INDEX idx_bom_items_project ON bom_items(project_id);
CREATE INDEX idx_bom_items_parent ON bom_items(parent_item_id);
CREATE INDEX idx_bom_items_part_number ON bom_items(part_number);
CREATE INDEX idx_bom_items_supplier ON bom_items(supplier_id);
CREATE INDEX idx_ai_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX idx_ai_processing_queue_priority ON ai_processing_queue(priority);
CREATE INDEX idx_ai_processing_queue_type ON ai_processing_queue(processing_type);
CREATE INDEX idx_ai_processing_queue_scheduled ON ai_processing_queue(scheduled_at);
CREATE INDEX idx_ai_model_configs_active ON ai_model_configs(is_active);
CREATE INDEX idx_cloud_storage_integrations_provider ON cloud_storage_integrations(provider);
CREATE INDEX idx_cloud_storage_integrations_active ON cloud_storage_integrations(is_active);
CREATE INDEX idx_document_sync_log_document ON document_sync_log(document_id);
CREATE INDEX idx_document_sync_log_integration ON document_sync_log(integration_id);
CREATE INDEX idx_document_sync_log_status ON document_sync_log(status);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sync_log ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (organization-based isolation)
CREATE POLICY "Users can only see their organization's data" ON projects
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can only see their notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Customer access policy for projects
CREATE POLICY "Customers can see their own projects" ON projects
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM contacts 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
```

## Triggers for Automation

```sql
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate project IDs
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_project_id TEXT;
BEGIN
    -- Generate date part (YYMMDD)
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(RIGHT(project_id, 2) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM projects
    WHERE project_id LIKE 'P-' || date_part || '%';
    
    -- Generate new project ID
    new_project_id := 'P-' || date_part || LPAD(sequence_num::TEXT, 2, '0');
    
    NEW.project_id := new_project_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_project_id_trigger
    BEFORE INSERT ON projects
    FOR EACH ROW
    WHEN (NEW.project_id IS NULL)
    EXECUTE FUNCTION generate_project_id();

-- Activity logging trigger
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (
        organization_id, project_id, user_id, action, entity_type, entity_id, 
        old_values, new_values
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        COALESCE(NEW.project_id, OLD.project_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
             WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
             ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply activity logging to key tables
CREATE TRIGGER log_projects_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_documents_activity
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION log_activity();
```

## Real-time Subscriptions Setup

```sql
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE project_stage_history;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE supplier_quotes;
```

## Key Features Supported

### 1. **Multi-Role Access Control**
- Organization-based isolation with RLS
- Role-based permissions and UI filtering
- External contact management for customers and suppliers

### 2. **Complete Workflow Tracking**
- Configurable workflow stages with sub-stages
- Granular process tracking with detailed sub-stages
- Stage history with duration tracking
- Multi-user project assignments
- Auto-advancement based on time or conditions
- Approval workflows for critical sub-stages

### 3. **Real-time Communication**
- Messages between all stakeholders
- Thread-based conversations
- Multi-channel notifications (in-app, email, SMS)
- Department and role-based messaging

### 4. **Document Management**
- Version control with parent-child relationships
- Access level controls (public, customer, supplier, internal, restricted)
- Comments and annotations
- Complete access audit trail

### 5. **Supplier Integration**
- RFQ management with status tracking
- Quote comparison and evaluation
- Supplier portal access

### 6. **Audit & Compliance**
- Complete activity logging
- Immutable audit trail
- System event tracking
- User action logging with IP and session tracking

### 7. **Real-time Synchronization**
- Supabase realtime subscriptions
- Cross-stakeholder notifications
- Live status updates

This schema provides a solid foundation for the Factory Pulse MES system with room for future enhancements and SaaS scaling.

---

## ✅ Summary of Key Fixes

1. **Fixed Project Status vs Stage**  
   - `status`: `active`, `delayed`, `on_hold`, `cancelled`, `completed`  
   - `current_stage_id`: workflow step reference (UUID to workflow_stages table)

2. **Standardized UUID Generation**  
   - All `uuid_generate_v4()` for consistency

3. **Enhanced Document Versioning**  
   - Added `document_versions` table for cleaner version history

4. **Vietnam & SEA Support**  
   - Default `country = 'Vietnam'`  
   - Added `VND` currency  
   - Supported `vi`, `th`, `ms`, `id` languages in preferences

5. **Simplified Messaging**  
   - Unified `thread_id` model for conversations

6. **Improved AI Extensibility**  
   - Centralized `ai_processing_queue` for all AI tasks

7. **Full RLS & Realtime Ready**  
   - All tables have `organization_id` for multi-tenancy  
   - Triggers and indexes optimized for Supabase realtime

## Database Relationship Diagram

```
erDiagram
    organizations ||--o{ users : "belongs to"
    organizations ||--o{ contacts : "manages"
    organizations ||--o{ workflow_stages : "configures"
    organizations ||--o{ workflow_sub_stages : "configures"
    organizations ||--o{ project_sub_stage_progress : "tracks"
    workflow_stages ||--o{ workflow_sub_stages : "contains"
    workflow_stages ||--o{ project_sub_stage_progress : "tracks progress"
    workflow_sub_stages ||--o{ project_sub_stage_progress : "has progress"
    projects ||--o{ project_sub_stage_progress : "tracks sub-stages"
    organizations ||--o{ projects : "owns"
    organizations ||--o{ organization_settings : "has"
    organizations ||--o{ email_templates : "uses"
    
    users ||--o{ users : "manages"
    users ||--o{ projects : "creates/assigns"
    users ||--o{ project_assignments : "assigned to"
    users ||--o{ documents : "uploads"
    users ||--o{ reviews : "performs"
    users ||--o{ messages : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ activity_log : "performs actions"
    users ||--o{ user_preferences : "has"
    
    contacts ||--o{ projects : "customer"
    contacts ||--o{ supplier_rfqs : "supplier"
    
    workflow_stages ||--o{ projects : "current stage"
    workflow_stages ||--o{ project_stage_history : "tracks"
    
    projects ||--o{ documents : "contains"
    projects ||--o{ reviews : "requires"
    projects ||--o{ messages : "related to"
    projects ||--o{ notifications : "generates"
    projects ||--o{ supplier_rfqs : "sends to suppliers"
    projects ||--o{ project_stage_history : "tracks progression"
    projects ||--o{ project_assignments : "has assignments"
    projects ||--o{ activity_log : "logs activities"
    
    documents ||--o{ document_comments : "has comments"
    documents ||--o{ document_access_log : "tracks access"
    documents ||--o{ document_versions : "has versions"
    
    reviews ||--o{ review_checklist_items : "contains items"
    
    supplier_rfqs ||--o{ supplier_quotes : "receives quotes"
    
    messages ||--|| messages : "thread relationship"
    
    organizations {
        uuid id PK
        varchar name
        varchar slug UK
        varchar domain
        text logo_url
        text description
        varchar industry
        jsonb settings
        varchar subscription_plan
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    users {
        uuid id PK
        uuid organization_id FK
        varchar email UK
        varchar name
        varchar role
        varchar department
        varchar phone
        text avatar_url
        boolean is_active
        text description
        varchar employee_id
        uuid direct_manager_id FK
        uuid_array direct_reports
        timestamp last_login_at
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }
    
    contacts {
        uuid id PK
        uuid organization_id FK
        varchar type
        varchar company_name
        varchar contact_name
        varchar email
        varchar phone
        text address
        varchar city
        varchar state
        varchar country
        varchar postal_code
        varchar website
        varchar tax_id
        varchar payment_terms
        decimal credit_limit
        boolean is_active
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
    }
    
    projects {
        uuid id PK
        uuid organization_id FK
        varchar project_id UK
        varchar title
        text description
        uuid customer_id FK
        uuid current_stage_id FK
        varchar status
        integer priority_score
        varchar priority_level
        decimal estimated_value
        date estimated_delivery_date
        date actual_delivery_date
        varchar source
        text_array tags
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        uuid assigned_to FK
    }
    
    workflow_stages {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar slug
        text description
        varchar color
        integer stage_order
        boolean is_active
        text exit_criteria
        text_array responsible_roles
        integer sub_stages_count
        integer estimated_duration_days
        jsonb required_approvals
        jsonb auto_advance_conditions
        timestamp created_at
        timestamp updated_at
    }
    
    workflow_sub_stages {
        uuid id PK
        uuid organization_id FK
        uuid workflow_stage_id FK
        varchar name
        varchar slug
        text description
        varchar color
        integer sub_stage_order
        boolean is_active
        text exit_criteria
        text_array responsible_roles
        integer estimated_duration_hours
        boolean is_required
        boolean can_skip
        boolean auto_advance
        boolean requires_approval
        text_array approval_roles
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    project_sub_stage_progress {
        uuid id PK
        uuid organization_id FK
        uuid project_id FK
        uuid workflow_stage_id FK
        uuid sub_stage_id FK
        varchar status
        timestamp started_at
        timestamp completed_at
        uuid assigned_to FK
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    documents {
        uuid id PK
        uuid project_id FK
        varchar file_name
        varchar original_file_name
        varchar file_type
        bigint file_size
        text file_url
        varchar mime_type
        integer version
        boolean is_latest
        varchar document_type
        varchar access_level
        varchar checksum
        jsonb metadata
        timestamp uploaded_at
        uuid uploaded_by FK
        timestamp approved_at
        uuid approved_by FK
    }
    
    reviews {
        uuid id PK
        uuid project_id FK
        uuid reviewer_id FK
        varchar reviewer_role
        varchar review_type
        varchar status
        varchar priority
        text comments
        jsonb risks
        text recommendations
        boolean tooling_required
        decimal estimated_cost
        integer estimated_lead_time
        date due_date
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    messages {
        uuid id PK
        uuid project_id FK
        uuid thread_id
        uuid sender_id FK
        varchar sender_type
        uuid sender_contact_id FK
        varchar recipient_type
        uuid recipient_id
        varchar recipient_role
        varchar recipient_department
        varchar subject
        text content
        varchar message_type
        varchar priority
        boolean is_read
        timestamp read_at
        jsonb attachments
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar title
        text message
        varchar link
        uuid project_id FK
        varchar priority
        boolean is_read
        timestamp read_at
        varchar delivery_method
        timestamp delivered_at
        jsonb metadata
        timestamp created_at
    }
    
    supplier_rfqs {
        uuid id PK
        uuid project_id FK
        uuid supplier_id FK
        varchar rfq_number UK
        varchar status
        timestamp sent_at
        timestamp viewed_at
        timestamp due_date
        date expected_response_date
        varchar priority
        text requirements
        text special_instructions
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    supplier_quotes {
        uuid id PK
        uuid supplier_rfq_id FK
        varchar quote_number
        decimal unit_price
        decimal total_price
        varchar currency
        integer quantity
        integer lead_time_days
        date valid_until
        varchar payment_terms
        varchar shipping_terms
        text notes
        text quote_file_url
        boolean is_selected
        timestamp submitted_at
        timestamp evaluated_at
        uuid evaluated_by FK
        integer evaluation_score
        text evaluation_notes
    }
```

## Data Flow Sequence Diagrams

### 1. RFQ Submission and Processing Flow

```
sequenceDiagram
    participant C as Customer
    participant P as Portal
    participant S as Sales
    participant E as Engineering
    participant Q as QA
    participant PR as Production
    participant PC as Procurement
    participant SP as Supplier
    participant SYS as System

    C->>P: Submit RFQ with documents
    P->>SYS: Auto-generate Project ID (P-YYMMDDXX)
    SYS->>projects: Create new project record
    SYS->>documents: Store uploaded files
    SYS->>S: Notify sales team
    
    S->>projects: Assign to procurement owner
    SYS->>PC: Send assignment notification
    
    PC->>reviews: Request technical reviews
    SYS->>E: Notify engineering team
    SYS->>Q: Notify QA team
    SYS->>PR: Notify production team
    
    par Engineering Review
        E->>reviews: Submit engineering review
        E->>documents: Add technical comments
    and QA Review
        Q->>reviews: Submit quality review
        Q->>documents: Add quality requirements
    and Production Review
        PR->>reviews: Submit production review
        PR->>documents: Add manufacturing notes
    end
    
    SYS->>PC: All reviews completed notification
    PC->>supplier_rfqs: Create supplier RFQs
    PC->>SP: Send RFQ notifications
    
    SP->>supplier_quotes: Submit quotes
    SYS->>PC: Quote received notification
    
    PC->>projects: Update to "Quoted" stage
    PC->>S: Generate customer quote
    S->>C: Send quote to customer
    
    C->>projects: Accept quote
    SYS->>projects: Update to "Order Confirmed"
    SYS->>activity_log: Log all activities
```

### 2. Communication and Notification Flow

```
sequenceDiagram
    participant U1 as User/Contact
    participant MSG as Message System
    participant NOT as Notification System
    participant U2 as Target User(s)
    participant EMAIL as Email Service
    participant SMS as SMS Service
    participant RT as Realtime System

    U1->>MSG: Send message
    MSG->>messages: Store message
    
    par Notification Creation
        MSG->>NOT: Create notifications
        NOT->>notifications: Store notifications
    and Activity Logging
        MSG->>activity_log: Log message activity
    end
    
    par Multi-channel Delivery
        NOT->>RT: Send realtime notification
        RT->>U2: Push notification to active users
    and Email Notification
        NOT->>EMAIL: Send email notification
        EMAIL->>U2: Deliver email
    and SMS Notification (if urgent)
        NOT->>SMS: Send SMS for urgent messages
        SMS->>U2: Deliver SMS
    end
    
    U2->>MSG: Read message
    MSG->>messages: Update read status
    MSG->>notifications: Mark as read
    MSG->>activity_log: Log read activity
```

### 3. Document Management and Version Control Flow

```
sequenceDiagram
    participant U as User
    participant DOC as Document System
    participant STORE as File Storage
    participant VER as Version Control
    participant AUDIT as Audit System
    participant COMM as Comment System

    U->>DOC: Upload new document
    DOC->>STORE: Store file
    STORE-->>DOC: Return file URL
    DOC->>documents: Create document record
    DOC->>document_access_log: Log upload activity
    
    alt Document Revision
        U->>DOC: Upload revised version
        DOC->>documents: Set previous version is_latest=false
        DOC->>documents: Create new version record
        DOC->>VER: Create document_versions entry
    end
    
    U->>COMM: Add comment/annotation
    COMM->>document_comments: Store comment
    COMM->>notifications: Notify relevant users
    
    par Access Tracking
        U->>DOC: View/Download document
        DOC->>document_access_log: Log access
        DOC->>AUDIT: Record audit trail
    and Permission Check
        DOC->>users: Check user role
        DOC->>documents: Verify access_level
        DOC-->>U: Grant/Deny access
    end
```

### 4. Workflow Stage Progression Flow

```
sequenceDiagram
    participant U as User
    participant WF as Workflow System
    participant PROJ as Projects
    participant HIST as Stage History
    participant SUB as Sub-Stages
    participant PROG as Sub-Stage Progress
    participant NOT as Notifications
    participant METRICS as Metrics System

    U->>WF: Move project to next stage
    WF->>workflow_stages: Validate stage transition
    WF->>PROJ: Check exit criteria
    
    alt Criteria Met
        WF->>HIST: Close current stage record
        HIST->>project_stage_history: Set exited_at, calculate duration
        WF->>PROJ: Update current_stage_id
        WF->>HIST: Create new stage entry
        HIST->>project_stage_history: Record stage entry
        
        WF->>SUB: Get sub-stages for new stage
        SUB->>workflow_sub_stages: Fetch active sub-stages
        WF->>PROG: Create sub-stage progress records
        PROG->>project_sub_stage_progress: Create progress entries
        
        WF->>NOT: Generate stage change notifications
        NOT->>workflow_stages: Get responsible_roles
        NOT->>users: Find users with matching roles
        NOT->>notifications: Create notifications for responsible users
        
        WF->>METRICS: Update stage metrics
        METRICS->>project_metrics: Record stage timing
        
        WF->>activity_log: Log stage change activity
    else Criteria Not Met
        WF-->>U: Return validation error
    end
    
    Note over SUB,PROG: Sub-stage Progress Tracking
    loop For each sub-stage
        U->>PROG: Update sub-stage status
        PROG->>project_sub_stage_progress: Update progress
        PROG->>NOT: Notify assigned users
        PROG->>METRICS: Track sub-stage timing
    end
```

### 5. Supplier Quote Evaluation Flow

```
sequenceDiagram
    participant PC as Procurement
    participant RFQ as RFQ System
    participant SP as Supplier
    participant QUOTE as Quote System
    participant EVAL as Evaluation System
    participant NOT as Notifications

    PC->>RFQ: Create supplier RFQ
    RFQ->>supplier_rfqs: Store RFQ record
    RFQ->>NOT: Send RFQ to supplier
    NOT->>SP: Notify supplier of new RFQ
    
    SP->>RFQ: View RFQ
    RFQ->>supplier_rfqs: Update viewed_at timestamp
    RFQ->>NOT: Notify procurement of view
    
    SP->>QUOTE: Submit quote
    QUOTE->>supplier_quotes: Store quote
    QUOTE->>NOT: Notify procurement of new quote
    NOT->>PC: Send quote received notification
    
    PC->>EVAL: Evaluate quotes
    EVAL->>supplier_quotes: Update evaluation scores
    EVAL->>supplier_quotes: Add evaluation notes
    
    PC->>QUOTE: Select winning quote
    QUOTE->>supplier_quotes: Set is_selected=true
    QUOTE->>NOT: Notify selected supplier
    QUOTE->>NOT: Notify non-selected suppliers
    
    QUOTE->>activity_log: Log evaluation activities
```

## System Architecture Data Flow

```
flowchart TD
    A[Customer Portal] --> B[Project Creation]
    B --> C[Document Upload]
    C --> D[Internal Review Process]
    
    D --> E{All Reviews Complete?}
    E -->|No| F[Request More Info]
    F --> G[Notification System]
    G --> H[Stakeholder Communication]
    H --> D
    
    E -->|Yes| I[Supplier RFQ Process]
    I --> J[Quote Collection]
    J --> K[Quote Evaluation]
    K --> L[Customer Quote Generation]
    
    L --> M{Customer Decision}
    M -->|Accept| N[Order Confirmation]
    M -->|Reject| O[Project Archive]
    M -->|Negotiate| P[Quote Revision]
    P --> L
    
    N --> Q[Production Planning]
    Q --> R[Procurement]
    R --> S[Manufacturing]
    S --> T[Quality Control]
    T --> U[Shipping]
    U --> V[Project Completion]
    
    subgraph "Sub-Stages Management"
        SUB1[Sub-Stage Creation]
        SUB2[Progress Tracking]
        SUB3[Auto-Advancement]
        SUB4[Approval Workflows]
    end
    
    subgraph "Data Layer"
        W[Organizations]
        X[Users & Contacts]
        Y[Projects]
        Z[Documents]
        AA[Messages]
        BB[Notifications]
        CC[Activity Log]
        DD[Workflow Stages]
        EE[Workflow Sub-Stages]
        FF[Sub-Stage Progress]
    end
    
    subgraph "Real-time Layer"
        GG[Supabase Realtime]
        HH[WebSocket Connections]
        II[Push Notifications]
    end
    
    B --> Y
    C --> Z
    D --> CC
    G --> AA
    G --> BB
    H --> GG
    GG --> HH
    HH --> II
    
    DD --> EE
    EE --> FF
    FF --> SUB2
    SUB2 --> SUB3
    SUB3 --> SUB4
    
    style A fill:#e1f5fe
    style N fill:#c8e6c9
    style O fill:#ffcdd2
    style V fill:#4caf50
    style SUB1 fill:#fff3e0
    style SUB2 fill:#fff3e0
    style SUB3 fill:#fff3e0
    style SUB4 fill:#fff3e0
```

This comprehensive set of diagrams provides a complete visual understanding of the Factory Pulse database schema, relationships, and data flows throughout the system.

## Database Functions

### Overview
The Factory Pulse database includes several custom functions that provide business logic, data aggregation, and security features. These functions are implemented in PL/pgSQL and are designed to work with the Row Level Security (RLS) policies.

### Core Functions

#### 1. `get_dashboard_summary()`
**Purpose**: Provides aggregated dashboard data for the main application dashboard
**Returns**: JSONB containing project statistics and recent activity
**Security**: SECURITY DEFINER - runs with elevated privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
```

**Return Structure**:
```json
{
  "projects": {
    "total": 17,
    "by_status": {
      "active": 14,
      "delayed": 2,
      "on_hold": 1
    }
  },
  "recent_projects": [
    {
      "id": "uuid",
      "project_id": "P-25012701",
      "title": "Project Title",
      "status": "active",
      "priority": "high",
      "created_at": "timestamp",
      "customer_name": "Company Name"
    }
  ],
  "generated_at": 1756481316.780059
}
```

**Implementation Details**:
- Uses PL/pgSQL loops to avoid complex SQL aggregation issues
- Efficiently queries projects table for counts and recent activity
- Joins with contacts table to provide customer information
- Returns timestamp for cache invalidation purposes

#### 2. `is_internal_user()`
**Purpose**: Determines if the current authenticated user is an internal Factory Pulse employee
**Returns**: Boolean indicating internal user status
**Security**: SECURITY DEFINER - runs with elevated privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
```

**Logic**: Checks if user role is in the internal roles list:
- admin, management, sales, procurement, engineering, production, qa

#### 3. `is_portal_user()`
**Purpose**: Determines if the current authenticated user is a portal user (customer/supplier)
**Returns**: Boolean indicating portal user status
**Security**: SECURITY DEFINER - runs with elevated privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.is_portal_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
```

**Logic**: Checks if user role is in the portal roles list:
- customer, supplier

#### 4. `get_current_user_org_id()`
**Purpose**: Retrieves the organization ID of the currently authenticated user
**Returns**: UUID of the user's organization
**Security**: SECURITY DEFINER - runs with elevated privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
```

**Usage**: Primarily used in RLS policies for multi-tenant data isolation

#### 5. `get_current_user_role()`
**Purpose**: Retrieves the role of the currently authenticated user
**Returns**: Text string representing the user's role
**Security**: SECURITY DEFINER - runs with elevated privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
```

**Usage**: Used in RLS policies for role-based access control

#### 6. `update_updated_at_column()`
**Purpose**: Trigger function to automatically update the `updated_at` timestamp
**Returns**: Trigger (NEW record)
**Security**: Standard function - no special privileges

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
```

**Usage**: Applied as a trigger to all tables with `updated_at` columns

### Utility Functions

#### 7. `disable_fk_checks_temporarily()`
**Purpose**: Temporarily disables foreign key constraint checks during data operations
**Returns**: void
**Security**: SECURITY DEFINER - runs with elevated privileges

**Usage**: Used during data migration and bulk import operations

#### 8. `enable_fk_checks_temporarily()`
**Purpose**: Re-enables foreign key constraint checks after temporary disable
**Returns**: void
**Security**: SECURITY DEFINER - runs with elevated privileges

**Usage**: Called after data operations to restore referential integrity

#### 9. `fix_user_id_mismatch(old_user_id, new_user_id)`
**Purpose**: Fixes user ID mismatches between auth.users and public.users tables
**Parameters**: 
- `old_user_id`: UUID of the old user ID
- `new_user_id`: UUID of the new user ID
**Returns**: void
**Security**: SECURITY DEFINER - runs with elevated privileges

**Usage**: Used during user ID synchronization operations

### Function Security Model

**SECURITY DEFINER Functions**:
- `get_dashboard_summary()`
- `is_internal_user()`
- `is_portal_user()`
- `get_current_user_org_id()`
- `get_current_user_role()`
- `disable_fk_checks_temporarily()`
- `enable_fk_checks_temporarily()`
- `fix_user_id_mismatch()`

**Trigger Functions**:
- `log_activity()` - Enhanced activity logging with multi-tenant safety
- `generate_project_id()` - Automatic project ID generation
- `handle_project_stage_change()` - Stage transition management
- `create_notification()` - Notification creation helper
- `update_updated_at_column()` - Automatic timestamp updates

**Standard Functions**:
- `update_updated_at_column()`

### Trigger Functions

#### 10. `log_activity()` - Enhanced Activity Logging
**Purpose**: Automatically logs all database changes for audit trail and compliance
**Returns**: Trigger (NEW or OLD record)
**Security**: Standard function with enhanced error handling

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $
DECLARE
    user_org_id UUID;
    entity_org_id UUID;
BEGIN
    -- Enhanced organization ID resolution with fallback logic
    SELECT organization_id INTO user_org_id 
    FROM users WHERE id = auth.uid();
    
    entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);
    
    -- Only log if we have an organization ID (prevents logging failures)
    IF entity_org_id IS NOT NULL THEN
        INSERT INTO activity_log (...);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ language 'plpgsql';
```

**Enhanced Features**:
- **Multi-Tenant Safety**: Robust organization ID resolution with fallback chain
- **Null Safety**: Conditional logging prevents failures when organization context is missing
- **Error Resilience**: Database operations continue even if activity logging encounters issues
- **Comprehensive Coverage**: Tracks INSERT, UPDATE, and DELETE operations

**Organization ID Resolution Logic**:
1. **Primary**: Uses entity's `organization_id` field (NEW or OLD record)
2. **Fallback**: Uses current user's organization ID from users table
3. **Safety Check**: Only logs when organization ID is available

**Applied to Tables**:
- `projects` - Project lifecycle tracking
- `contacts` - Customer/supplier management tracking
- `reviews` - Review process audit trail

#### 11. `generate_project_id()`
**Purpose**: Automatically generates unique project IDs in P-YYMMDDXX format
**Returns**: Trigger (NEW record with generated project_id)
**Security**: Standard function

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TRIGGER AS $
BEGIN
    IF NEW.project_id IS NULL THEN
        NEW.project_id := 'P-' || TO_CHAR(NOW(), 'YYMMDD') || 
                         LPAD((SELECT COALESCE(MAX(...), 0) + 1)::TEXT, 2, '0');
    END IF;
    RETURN NEW;
END;
$ language 'plpgsql';
```

#### 12. `handle_project_stage_change()`
**Purpose**: Manages project stage transitions and creates notifications
**Returns**: Trigger (NEW record with updated stage_entered_at)
**Security**: Standard function

**Features**:
- Updates `stage_entered_at` timestamp when stage changes
- Creates notifications for assigned users
- Integrates with notification system for real-time updates

#### 13. `create_notification()`
**Purpose**: Helper function to create user notifications
**Parameters**: user_id, title, message, type, priority, action_url, etc.
**Returns**: UUID of created notification
**Security**: Standard function

**Usage**: Called by other triggers and functions to create user notifications

**Permissions**:
- All functions are granted EXECUTE permission to authenticated users
- SECURITY DEFINER functions run with elevated privileges for security operations
- Functions respect RLS policies when querying data

### Performance Considerations

**Dashboard Function**:
- Uses efficient COUNT queries for statistics
- Limits recent projects to 10 records
- Returns JSONB for efficient data transfer
- Includes timestamp for client-side caching

**Security Functions**:
- Minimal database queries for user type detection
- Cached results where possible
- Optimized for frequent RLS policy evaluation

### Maintenance and Updates

**Function Updates**:
- Functions are updated through migration files
- Version control maintained for all function changes
- Backward compatibility considered for existing integrations

**Monitoring**:
- Function performance can be monitored through PostgreSQL statistics
- Query execution plans available for optimization
- Error logging through standard PostgreSQL mechanisms

This functions layer provides the business logic foundation for the Factory Pulse application, ensuring secure, efficient, and maintainable database operations.## 
Sample Data Integration

The schema is designed to work seamlessly with the sample data structure:

### Organizations Sample Data
- **Factory Pulse Vietnam**: Primary organization with enterprise subscription
- **Customer Organizations**: Toyota Vietnam, Honda Vietnam, Boeing Vietnam
- **Supplier Organizations**: Precision Machining Co.

### Workflow Stages Sample Data
The schema supports the standard 8-stage manufacturing workflow:
1. **Inquiry Received** - Initial customer inquiry
2. **Under Review** - Internal technical review
3. **Quoted** - Quote provided to customer
4. **Order Confirmed** - Customer accepts quote
5. **In Production** - Manufacturing in progress
6. **Quality Check** - QA inspection and testing
7. **Ready for Delivery** - Completed and packaged
8. **Delivered** - Shipped to customer

### User Roles Sample Data
- **Management**: Directors and managers
- **Sales**: Account managers and sales representatives
- **Engineering**: Design engineers and technical specialists
- **QA**: Quality assurance engineers and inspectors
- **Production**: Production supervisors and operators
- **Procurement**: Purchasing and supplier management

## Future Extensions

The initial schema provides a solid foundation for additional tables:

### Planned Extensions
- **Documents**: File management with versioning
- **Reviews**: Internal approval workflows
- **Messages**: Communication and notifications
- **Activity Log**: Audit trail and system events
- **Supplier RFQs**: Request for quote management
- **AI Processing**: Automated document processing

### Integration Points
- **Supabase Auth**: Seamless authentication integration
- **Real-time Subscriptions**: Live updates for collaborative workflows
- **Storage Integration**: Document and file management
- **API Ready**: RESTful and GraphQL API support

## Migration Information

**Migration File**: `supabase/migrations/20250831000001_initial_schema.sql`
**Status**: Initial foundation implemented
**Next Steps**: Add extended tables for complete business functionality