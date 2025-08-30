# TypeScript Interface Analysis Report

## Task 2.1: Analysis of Current Project Interface vs Database Schema

### Database Schema Analysis

#### Projects Table (from migration 20250127000005_create_projects.sql)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    current_stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' 
      CHECK (status IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed')),
    priority_level VARCHAR(20) DEFAULT 'medium' 
      CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    source VARCHAR(50) DEFAULT 'portal',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_value DECIMAL(15,2),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    stage_entered_at TIMESTAMPTZ,
    project_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Contacts Table (from migration 20250127000003_create_contacts.sql)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'supplier')),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    postal_code VARCHAR(20),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Workflow Stages Table (from migration 20250127000004_create_workflow_stages.sql)
```sql
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    estimated_duration_days INTEGER,
    required_approvals JSONB DEFAULT '[]',
    auto_advance_conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Interface Analysis Results

## 1. Project Interface Issues

### Critical Mismatches:
1. **Missing Database Fields in Interface:**
   - No `notes` field (database has `notes TEXT`)

2. **Extra Interface Fields Not in Database:**
   - `current_stage: ProjectStage` (backward compatibility field)
   - `priority: ProjectPriority` (backward compatibility field)
   - `priority_score?: number` (not in database)
   - `estimated_delivery_date?: string` (not in database)
   - `actual_delivery_date?: string` (not in database)
   - `due_date?: string` (backward compatibility field)
   - `days_in_stage: number` (calculated field)
   - `assignee_id?: string` (backward compatibility field)
   - Multiple legacy fields for compatibility

3. **Type Mismatches:**
   - `stage_entered_at: string` should be `stage_entered_at?: string` (database allows NULL)
   - `estimated_value?: number` should match `DECIMAL(15,2)` type
   - `tags?: string[]` should match `TEXT[]` type

4. **Enum Value Mismatches:**
   - Database status: `('active', 'on_hold', 'delayed', 'cancelled', 'completed')`
   - Interface status: `'active' | 'delayed' | 'on_hold' | 'cancelled' | 'completed' | 'archived'`
   - Interface has extra 'archived' value not in database

## 2. Contact Interface Issues

### Critical Mismatches:
1. **Missing Database Fields in Interface:**
   - No `city` field (database has `city VARCHAR(100)`)
   - No `state` field (database has `state VARCHAR(100)`)

2. **Extra Interface Fields Not in Database:**
   - `ai_category?: Record<string, any>` (not in database)
   - `ai_capabilities?: any[]` (not in database)
   - `ai_risk_score?: number` (not in database)
   - `ai_last_analyzed?: string` (not in database)
   - `created_by?: string` (not in database)

3. **Field Name Mismatches:**
   - Interface uses `name` but database has `contact_name`
   - Interface uses `company` but database has `company_name`

## 3. WorkflowStage Interface Issues

### Critical Mismatches:
1. **Missing Database Fields in Interface:**
   - No `estimated_duration_days` field (database has `estimated_duration_days INTEGER`)
   - No `required_approvals` field (database has `required_approvals JSONB`)
   - No `auto_advance_conditions` field (database has `auto_advance_conditions JSONB`)

2. **Field Name Mismatches:**
   - Interface uses `stage_order` but database has `order_index`
   - Interface has `organization_id` but database doesn't have this field
   - Interface has `slug` field but database doesn't have this field
   - Interface has `exit_criteria` but database doesn't have this field
   - Interface has `responsible_roles` but database doesn't have this field

3. **Missing Database Fields:**
   - Database has `description` field but interface doesn't include it

## 4. Customer Interface Issues

### Critical Issues:
1. **Duplicate Interface:** The `Customer` interface appears to be a duplicate/legacy version of `Contact`
2. **Inconsistent with Database:** Customer data is stored in the `contacts` table with `type = 'customer'`
3. **Should be Removed:** The separate `Customer` interface should be removed and replaced with proper `Contact` usage

## Summary of Required Actions

### High Priority (Critical for Functionality):
1. Add missing `notes` field to Project interface
2. Fix status enum to match database constraints exactly
3. Make `stage_entered_at` optional to match database nullable constraint
4. Fix Contact interface field names (`contact_name`, `company_name`)
5. Add missing Contact fields (`city`, `state`)
6. Fix WorkflowStage interface field names (`order_index` instead of `stage_order`)
7. Remove duplicate Customer interface

### Medium Priority (Data Consistency):
1. Remove AI-related fields from Contact interface (not in database)
2. Add missing WorkflowStage fields (`estimated_duration_days`, `required_approvals`, `auto_advance_conditions`)
3. Remove WorkflowStage fields not in database (`organization_id`, `slug`, `exit_criteria`, `responsible_roles`)

### Low Priority (Cleanup):
1. Review and potentially remove legacy/backward compatibility fields
2. Ensure all optional/required field mappings match database constraints
3. Standardize type mappings (DECIMAL, TEXT[], JSONB, etc.)