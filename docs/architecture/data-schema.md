# Factory Pulse - Data Schema Documentation

## Overview

Factory Pulse is a comprehensive Manufacturing Execution System (MES) built with React, TypeScript, and Supabase. This document provides detailed information about the current database schema, relationships, and data structures.

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Supabase Client
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### Schema Design Principles
- Multi-tenant architecture with organization-based data isolation
- Dynamic workflow stages for flexible business processes
- Comprehensive audit logging for compliance
- Role-based access control (RBAC)
- Document management with version control

## Core Tables

### 1. Organizations
**Purpose**: Multi-tenant organization management

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  domain TEXT,
  industry TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  subscription_plan subscription_plan_enum DEFAULT 'starter',
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Fields**:
- `slug`: URL-friendly identifier for organization routing
- `subscription_plan`: Tier-based feature access control
- `settings`: Flexible configuration storage

### 2. Users
**Purpose**: User management and authentication

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- References auth.users.id
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role_enum NOT NULL,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  status user_status_enum DEFAULT 'active',
  description TEXT,
  employee_id TEXT,
  direct_manager_id UUID REFERENCES users(id),
  direct_reports UUID[] DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Relationships**:
- Links directly to Supabase Auth users
- Hierarchical reporting structure via `direct_manager_id`
- Multi-role support for complex organizational structures

### 3. Contacts
**Purpose**: Customer, supplier, and partner management

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type contact_type_enum NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  website TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  credit_limit NUMERIC,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  -- AI and metadata fields
  metadata JSONB,
  ai_category JSONB,
  ai_capabilities TEXT[],
  ai_risk_score NUMERIC,
  ai_last_analyzed TIMESTAMPTZ
);
```

**Contact Types**:
- `customer`: External customers
- `supplier`: Supply chain partners
- `partner`: Business partners
- `internal`: Internal contacts

### 4. Projects
**Purpose**: Core project management with dynamic workflows

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id TEXT NOT NULL, -- Format: P-25082001
  title TEXT NOT NULL,
  description TEXT,
  customer_organization_id UUID REFERENCES organizations(id),
  point_of_contacts UUID[] DEFAULT '{}', -- Contact IDs
  current_stage_id UUID REFERENCES workflow_stages(id),
  status project_status_enum DEFAULT 'active',
  priority_level priority_level_enum,
  priority_score NUMERIC,
  source TEXT,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  estimated_value NUMERIC,
  tags TEXT[],
  metadata JSONB,
  stage_entered_at TIMESTAMPTZ,
  project_type TEXT,
  intake_type intake_type_enum,
  intake_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  estimated_delivery_date DATE,
  actual_delivery_date DATE
);
```

**Project Statuses**:
- `active`: Currently in progress
- `completed`: Successfully finished
- `cancelled`: Terminated before completion
- `on_hold`: Temporarily paused

### 5. Workflow Stages
**Purpose**: Dynamic workflow configuration

```sql
CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT,
  stage_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  exit_criteria TEXT,
  responsible_roles TEXT[], -- User roles that can work on this stage
  estimated_duration_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. Workflow Sub-Stages
**Purpose**: Granular workflow steps within stages

```sql
CREATE TABLE workflow_sub_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sub_stage_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  exit_criteria TEXT,
  responsible_roles TEXT[],
  estimated_duration_hours INTEGER,
  is_required BOOLEAN DEFAULT true,
  can_skip BOOLEAN DEFAULT false,
  auto_advance BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_roles TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. Project Sub-Stage Progress
**Purpose**: Track detailed progress within workflows

```sql
CREATE TABLE project_sub_stage_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id),
  sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id),
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Supporting Tables

### 8. Documents
**Purpose**: File and document management with version control

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  file_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_size NUMERIC,
  file_type TEXT,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  is_current_version BOOLEAN DEFAULT true,
  category TEXT,
  access_level TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id)
);
```

### 9. Messages
**Purpose**: Internal communication and notifications

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  recipient_type TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT,
  priority priority_level_enum,
  status TEXT,
  thread_id TEXT,
  parent_message_id UUID REFERENCES messages(id),
  project_id UUID REFERENCES projects(id),
  attachments JSONB,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 10. Notifications
**Purpose**: User notifications and alerts

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority priority_level_enum,
  status TEXT,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 11. Activity Log
**Purpose**: Comprehensive audit trail

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id), -- Added project_id column
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Updates**:
- Added `project_id` column for better project-specific audit tracking
- Enhanced relationship with projects table for comprehensive logging

### 12. Project Assignments
**Purpose**: Project team management

```sql
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true
);
```

### 13. Reviews
**Purpose**: Project review and approval system

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  review_type TEXT NOT NULL,
  status TEXT,
  priority priority_level_enum,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decision TEXT,
  decision_reason TEXT,
  comments TEXT,
  recommendations TEXT,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 14. Supplier Quotes
**Purpose**: Supplier quotation management

```sql
CREATE TABLE supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  supplier_id UUID NOT NULL REFERENCES contacts(id),
  quote_number TEXT,
  total_amount NUMERIC,
  currency TEXT,
  lead_time_days INTEGER,
  valid_until TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  status TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Enums and Types

### Database Enums
```sql
-- Contact types
CREATE TYPE contact_type AS ENUM ('customer', 'supplier', 'partner', 'internal');

-- User roles
CREATE TYPE user_role AS ENUM (
  'admin', 'management', 'sales', 'engineering',
  'qa', 'production', 'procurement', 'supplier', 'customer'
);

-- User status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Project status
CREATE TYPE project_status AS ENUM ('active', 'completed', 'cancelled', 'on_hold');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Intake types
CREATE TYPE intake_type AS ENUM ('rfq', 'purchase_order', 'project_idea', 'direct_request');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'enterprise');
```

## Database Functions

### Security Functions
```sql
-- Get current user's organization ID
CREATE FUNCTION get_current_user_org_id() RETURNS UUID
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get current user's role
CREATE FUNCTION get_current_user_role() RETURNS TEXT
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user can access a project
CREATE FUNCTION can_access_project(project_id UUID) RETURNS BOOLEAN
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.organization_id = get_current_user_org_id()
      OR p.assigned_to = auth.uid()
      OR p.created_by = auth.uid()
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is internal (not customer/supplier)
CREATE FUNCTION is_internal_user() RETURNS BOOLEAN
AS $$
  SELECT role NOT IN ('customer', 'supplier') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is portal user (customer/supplier)
CREATE FUNCTION is_portal_user() RETURNS BOOLEAN
AS $$
  SELECT role IN ('customer', 'supplier') FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```

### Notification Functions
```sql
-- Create notification for user
CREATE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority priority_level DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id TEXT DEFAULT NULL
) RETURNS UUID
AS $$
  INSERT INTO notifications (
    user_id, type, title, message, priority,
    action_url, action_label, related_entity_type, related_entity_id,
    organization_id
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_priority,
    p_action_url, p_action_label, p_related_entity_type, p_related_entity_id,
    get_current_user_org_id()
  ) RETURNING id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

### Dashboard Functions
```sql
-- Get dashboard summary data
CREATE FUNCTION get_dashboard_summary() RETURNS JSON
AS $$
  SELECT json_build_object(
    'total_projects', (SELECT COUNT(*) FROM projects WHERE organization_id = get_current_user_org_id()),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE organization_id = get_current_user_org_id() AND status = 'active'),
    'completed_projects', (SELECT COUNT(*) FROM projects WHERE organization_id = get_current_user_org_id() AND status = 'completed'),
    'pending_reviews', (SELECT COUNT(*) FROM reviews WHERE organization_id = get_current_user_org_id() AND status = 'pending')
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Key Relationships

### Organization-Centric Design
- All major tables reference `organization_id` for multi-tenant isolation
- Organizations contain users, projects, contacts, and workflows
- Data is partitioned by organization for security and performance

### Project-Centric Workflow
```
Projects → Workflow Stages → Sub-Stages → Progress Tracking
    ↓           ↓              ↓
Contacts    Stage Config   Detailed Progress
    ↓           ↓              ↓
Assignments   Transitions   Time Tracking
```

### User Management Hierarchy
```
Organizations
    ↓
Users (with roles and hierarchy)
    ↓
Project Assignments
    ↓
Workflow Responsibilities
```

## Data Flow Patterns

### Project Lifecycle
1. **Intake**: Projects created via portal, email, or API
2. **Assignment**: Users assigned based on roles and skills
3. **Workflow**: Projects move through configured stages
4. **Tracking**: Detailed progress tracked at sub-stage level
5. **Completion**: Projects marked complete with final status

### Document Management
1. **Upload**: Files uploaded with metadata
2. **Versioning**: Automatic version control
3. **Approval**: Optional approval workflow
4. **Access**: Role-based access control
5. **Audit**: All access logged for compliance

### Communication Flow
1. **Messages**: Internal project communication
2. **Notifications**: System-generated alerts
3. **Activity Log**: Comprehensive audit trail
4. **Real-time**: Live updates via Supabase Realtime

## Performance Considerations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for relationships
- Composite indexes on frequently queried fields
- Partial indexes for active records
- JSONB indexes for metadata searches

### Data Partitioning
- Organization-based partitioning for multi-tenant isolation
- Time-based partitioning for large tables (activity_log, messages)
- Archive strategy for completed projects

### Query Optimization
- Efficient joins with proper indexing
- Use of views for complex queries
- Caching layer for frequently accessed data
- Real-time subscriptions for live updates

## Security Model

### Row Level Security (RLS)
- Organization-based data isolation
- User role-based access control
- Project-specific permissions
- Document access restrictions

#### Current RLS Policies

**Organizations Table**:
```sql
-- Allow all authenticated users to view organizations (for customer display)
CREATE POLICY "Users can view all organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Users can insert organizations" ON organizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their organization" ON organizations FOR UPDATE USING (auth.role() = 'authenticated');
```

**Projects Table**:
```sql
-- Complex project access based on user role and assignment
CREATE POLICY "Users can modify projects" ON projects USING (
  can_access_project(id) AND (
    get_current_user_role() = ANY (ARRAY['admin', 'management']) OR
    (get_current_user_role() = 'sales' AND current_stage_id IN (
      SELECT id FROM workflow_stages WHERE 'sales' = ANY(responsible_roles)
    )) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
);
```

**Documents Table**:
```sql
-- Document access based on project permissions
CREATE POLICY "Users can view documents" ON documents FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE can_access_project(id)
  )
);
```

**Activity Log Table**:
```sql
-- Activity logging restricted to organization
CREATE POLICY "Users can view activity in their org" ON activity_log FOR SELECT USING (
  organization_id = get_current_user_org_id()
);
```

### Authentication
- Supabase Auth integration
- JWT-based session management
- Automatic token refresh
- Secure password policies

### Audit Trail
- All data changes logged
- IP address and user agent tracking
- Comprehensive activity monitoring
- Compliance-ready audit logs

## Future Extensibility

### Metadata Fields
- JSONB fields allow flexible extensions
- AI-powered categorization
- Custom workflow configurations
- Extensible notification systems

### API Design
- RESTful endpoints via Supabase
- GraphQL support for complex queries
- Real-time subscriptions
- Webhook integration capabilities

This schema provides a solid foundation for a comprehensive MES system with room for future enhancements and customizations based on specific business requirements.
