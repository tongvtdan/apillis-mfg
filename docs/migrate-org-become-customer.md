# Migration Strategy: Organizations as Customers

## Overview

This document outlines the migration strategy for changing the customer relationship model from contact-based to organization-based. Currently, customers are stored as individual records in the `contacts` table with `type = 'customer'`. The proposed change will make organizations the primary customer entities, with contacts serving as contact points within those organizations.

## Business Justification

### Current Limitations
1. When a contact person leaves an organization, all projects with that customer need updates
2. No clean way to maintain relationships with multiple contact points within a customer organization
3. Difficult to select different contact points (purchasing, engineering, etc.) for different project needs

### Benefits of New Approach
1. Stable customer relationships - organizations don't "resign" like individuals
2. Multiple contact points - easy to have purchasing, engineering, quality contacts within the same organization
3. Reduced maintenance - no need to update all projects when personnel changes
4. Better organization - clear separation between customer entities and their representatives

## Database Schema Changes

### 1. Modify Projects Table
```sql
-- Add new column for organization as customer
ALTER TABLE projects ADD COLUMN customer_organization_id UUID REFERENCES organizations(id);

-- Add foreign key constraint
ALTER TABLE projects ADD CONSTRAINT projects_customer_organization_id_fkey 
FOREIGN KEY (customer_organization_id) REFERENCES organizations(id);
```

**Note**: The data migration will be handled in Phase 2 after customer organizations are created.

### 2. Enhance Contacts Table
```sql
-- Add role field to contacts to identify purchasing, engineering, etc.
ALTER TABLE contacts ADD COLUMN role VARCHAR(100);

-- Add flag for primary contact
ALTER TABLE contacts ADD COLUMN is_primary_contact BOOLEAN DEFAULT false;

-- Add description field for additional context
ALTER TABLE contacts ADD COLUMN description TEXT;
```

### 3. Create Project-Contact Relationship Table
```sql
-- Create new table for project-specific contact points
CREATE TABLE project_contact_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_contact_points_project_id ON project_contact_points(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_contact_id ON project_contact_points(contact_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_role ON project_contact_points(role);

-- Enable RLS on new table
ALTER TABLE project_contact_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for project_contact_points
CREATE POLICY "Users can access project contact points for their organization's projects" 
ON project_contact_points FOR ALL USING (
    project_id IN (
        SELECT id FROM projects 
        WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    )
);
```

## Implementation Phases

### Phase 1: Database Schema Updates (Week 1)
1. Create migration script with all schema changes
2. Apply migration to development environment
3. Verify backward compatibility
4. Update database documentation

### Phase 2: Data Migration (Week 2)
1. Create customer organization records for each unique customer company
2. Update contacts to reference customer organizations instead of internal organization
3. Map existing projects to customer organizations
4. Create project-contact relationship records
5. Test migration with sample data
6. Execute migration on development environment

### Phase 3: Backend Updates (Week 3-4)
1. Update TypeScript interfaces
2. Modify database queries to use new schema
3. Update services to handle both old and new data models
4. Implement fallback mechanisms for backward compatibility

### Phase 4: Frontend Updates (Week 5-6)
1. Update customer management components
2. Modify project creation flow
3. Update project detail views
4. Implement contact point selection interfaces

### Phase 5: Testing and Validation (Week 7)
1. Comprehensive testing of all customer-related functionality
2. Validate data integrity after migration
3. Test backward compatibility
4. Performance testing with new schema

### Phase 6: Deployment and Monitoring (Week 8)
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Deploy to production with rollback plan
4. Monitor system performance and data integrity

## Code Changes Required

### 1. Update Type Definitions
```typescript
// src/types/project.ts
export interface Project {
  // ... existing fields ...
  customer_id?: string; // Keep for backward compatibility
  customer_organization_id?: string; // New field
  customer_organization?: Organization; // New joined field
  contact_points?: ProjectContactPoint[]; // New field
  // ... existing code ...
}

export interface Contact {
  // ... existing fields ...
  role?: string; // 'purchasing', 'engineering', 'quality', etc.
  is_primary_contact?: boolean;
  description?: string;
  // ... existing code ...
}

export interface ProjectContactPoint {
  id: string;
  project_id: string;
  contact_id: string;
  role?: string;
  is_primary: boolean;
  created_at: string;
  contact?: Contact;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. Update Project Queries
```typescript
// Update hooks and services to fetch organization data instead of contact data
let query = supabase
  .from('projects')
  .select(`
    id,
    organization_id,
    project_id,
    title,
    description,
    customer_organization_id,
    current_stage_id,
    status,
    priority_level,
    source,
    assigned_to,
    created_by,
    estimated_value,
    estimated_delivery_date,
    actual_delivery_date,
    tags,
    metadata,
    stage_entered_at,
    project_type,
    notes,
    created_at,
    updated_at,
    customer:organizations!customer_organization_id(
      id,
      name,
      slug,
      description,
      industry,
      address,
      city,
      state,
      country,
      postal_code
    ),
    contact_points:project_contact_points(
      contact:contacts(
        id,
        contact_name,
        email,
        phone,
        role,
        is_primary_contact
      )
    ),
    current_stage:workflow_stages!current_stage_id(
      id,
      name,
      description,
      stage_order,
      is_active,
      created_at,
      updated_at
    ) 
  `)
  .eq('organization_id', profile.organization_id);
```

## Migration Script

### Data Migration Logic

#### Step 1: Create Customer Organizations
```sql
-- Create customer organization records for each unique customer company
INSERT INTO organizations (id, name, slug, description, industry, is_active, created_at, updated_at)
SELECT DISTINCT 
    uuid_generate_v4() as id,
    c.company_name as name,
    LOWER(REGEXP_REPLACE(c.company_name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    'Customer Organization' as description,
    'Manufacturing' as industry,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM contacts c 
WHERE c.type = 'customer' 
AND c.company_name IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.name = c.company_name
);
```

#### Step 2: Update Contacts to Reference Customer Organizations
```sql
-- Update customer contacts to reference their organization instead of internal organization
UPDATE contacts 
SET organization_id = o.id
FROM organizations o
WHERE contacts.company_name = o.name 
AND contacts.type = 'customer';
```

#### Step 3: Update Projects to Reference Customer Organizations
```sql
-- Update projects to reference customer organizations
UPDATE projects 
SET customer_organization_id = c.organization_id
FROM contacts c 
WHERE projects.customer_id = c.id AND c.type = 'customer';
```

#### Step 4: Create Project-Contact Relationship Records
```sql
-- Create project contact point records for existing projects
INSERT INTO project_contact_points (project_id, contact_id, role, is_primary, created_at)
SELECT 
    p.id as project_id,
    p.customer_id as contact_id,
    'general' as role,
    true as is_primary,
    NOW() as created_at
FROM projects p
WHERE p.customer_id IS NOT NULL;
```

### Validation Queries

#### Check for Orphaned Projects
```sql
-- Check for projects with invalid customer_id references
SELECT COUNT(*) as orphaned_projects
FROM projects p
LEFT JOIN contacts c ON p.customer_id = c.id
WHERE c.id IS NULL;
```

#### Verify Customer Organization Mapping
```sql
-- Check for projects without customer_organization_id
SELECT COUNT(*) as projects_without_org
FROM projects 
WHERE customer_organization_id IS NULL AND customer_id IS NOT NULL;
```

#### Verify Contact Organization Mapping
```sql
-- Verify all customer contacts have organization_id
SELECT COUNT(*) as contacts_without_org
FROM contacts 
WHERE type = 'customer' AND organization_id IS NULL;
```

#### Check Data Integrity
```sql
-- Verify project-contact relationships are correctly established
SELECT COUNT(*) as missing_contact_points
FROM projects p
LEFT JOIN project_contact_points pcp ON p.id = pcp.project_id
WHERE p.customer_id IS NOT NULL AND pcp.id IS NULL;
```

## Risk Mitigation

### 1. Backward Compatibility
- Maintain customer_id field during transition period
- Implement dual-read logic in services
- Provide migration utilities for external integrations

### 2. Data Integrity
- Comprehensive testing with production-like data
- Validation scripts to verify migration accuracy
- Rollback procedures in case of issues

### 3. Performance Impact
- Indexing strategy for new tables and relationships
- Query optimization for organization-based lookups
- Caching strategies for frequently accessed customer data

## Testing Strategy

### 1. Pre-Migration Testing
- Test migration scripts on a copy of production data
- Verify all validation queries return expected results
- Test rollback procedures on sample data

### 2. Unit Testing
- Database query modifications
- Service layer changes
- Data transformation logic

### 3. Integration Testing
- End-to-end customer management workflows
- Project creation and modification flows
- Reporting and analytics functionality

### 4. User Acceptance Testing
- Customer creation and management
- Project assignment to organizations
- Contact point selection and management

### 5. Sample Data Testing
```sql
-- Create test customer organizations
INSERT INTO organizations (name, slug, description, industry) VALUES
('Test Customer Corp', 'test-customer-corp', 'Test customer organization', 'Manufacturing'),
('Sample Industries', 'sample-industries', 'Sample customer organization', 'Automotive');

-- Create test contacts
INSERT INTO contacts (organization_id, type, company_name, contact_name, email, role, is_primary_contact) VALUES
((SELECT id FROM organizations WHERE slug = 'test-customer-corp'), 'customer', 'Test Customer Corp', 'John Doe', 'john@testcustomer.com', 'purchasing', true),
((SELECT id FROM organizations WHERE slug = 'sample-industries'), 'customer', 'Sample Industries', 'Jane Smith', 'jane@sample.com', 'engineering', true);

-- Create test project
INSERT INTO projects (organization_id, project_id, title, customer_id, customer_organization_id) VALUES
((SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam'), 'P-TEST001', 'Test Project', 
 (SELECT id FROM contacts WHERE email = 'john@testcustomer.com'),
 (SELECT id FROM organizations WHERE slug = 'test-customer-corp'));

-- Verify the migration worked correctly
SELECT p.title, o.name as customer_org, c.contact_name, c.role
FROM projects p
JOIN organizations o ON p.customer_organization_id = o.id
JOIN contacts c ON p.customer_id = c.id
WHERE p.project_id = 'P-TEST001';
```

## Rollback Plan

If issues are discovered during or after deployment:

### Database Rollback Script
```sql
-- Step 1: Remove project-contact relationship records
DELETE FROM project_contact_points WHERE created_at > '2025-01-XX'; -- Use actual migration date

-- Step 2: Clear customer_organization_id from projects
UPDATE projects SET customer_organization_id = NULL;

-- Step 3: Revert contacts to reference internal organization
UPDATE contacts 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam')
WHERE type = 'customer';

-- Step 4: Remove customer organization records
DELETE FROM organizations 
WHERE name IN (
    SELECT DISTINCT company_name 
    FROM contacts 
    WHERE type = 'customer'
) AND slug != 'factory-pulse-vietnam';

-- Step 5: Drop the new column and constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_customer_organization_id_fkey;
ALTER TABLE projects DROP COLUMN IF EXISTS customer_organization_id;

-- Step 6: Remove new contact fields
ALTER TABLE contacts DROP COLUMN IF EXISTS role;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_primary_contact;
ALTER TABLE contacts DROP COLUMN IF EXISTS description;

-- Step 7: Drop project_contact_points table
DROP TABLE IF EXISTS project_contact_points;
```

### Application Rollback Steps
1. Revert code changes to previous version
2. Restore data from backups if needed
3. Monitor system for any residual issues
4. Verify all functionality works as before migration

## Success Metrics

1. All existing customer data correctly mapped to organizations
2. Zero data loss during migration
3. Improved performance in customer-related operations
4. Positive feedback from users on new contact point functionality
5. Successful completion of all test scenarios

## Dependencies

1. Supabase database migration capabilities
2. TypeScript type definition updates
3. Frontend component modifications
4. Data migration script development
5. Comprehensive testing framework

## Timeline

Total estimated duration: 8 weeks

| Phase                     | Duration | Start Date | End Date |
| ------------------------- | -------- | ---------- | -------- |
| Database Schema Updates   | 1 week   | TBD        | TBD      |
| Data Migration            | 1 week   | TBD        | TBD      |
| Backend Updates           | 2 weeks  | TBD        | TBD      |
| Frontend Updates          | 2 weeks  | TBD        | TBD      |
| Testing and Validation    | 1 week   | TBD        | TBD      |
| Deployment and Monitoring | 1 week   | TBD        | TBD      |

## Approval

This migration strategy requires approval from:
- [ ] Project Technical Lead
- [ ] Product Owner
- [ ] Database Administrator
- [ ] QA Lead

## References

1. Current database schema documentation
2. Customer management requirements
3. Project workflow specifications
4. Data model design guidelines

### 3. Create Project-Contact Relationship Table
```sql
-- Create new table for project-specific contact points
CREATE TABLE project_contact_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_contact_points_project_id ON project_contact_points(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_contact_id ON project_contact_points(contact_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_role ON project_contact_points(role);

-- Enable RLS on new table
ALTER TABLE project_contact_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for project_contact_points
CREATE POLICY "Users can access project contact points for their organization's projects" 
ON project_contact_points FOR ALL USING (
    project_id IN (
        SELECT id FROM projects 
        WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    )
);
```

## Implementation Phases

### Phase 1: Database Schema Updates (Week 1)
1. Create migration script with all schema changes
2. Apply migration to development environment
3. Verify backward compatibility
4. Update database documentation

### Phase 2: Data Migration (Week 2)
1. Create customer organization records for each unique customer company
2. Update contacts to reference customer organizations instead of internal organization
3. Map existing projects to customer organizations
4. Create project-contact relationship records
5. Test migration with sample data
6. Execute migration on development environment

### Phase 3: Backend Updates (Week 3-4)
1. Update TypeScript interfaces
2. Modify database queries to use new schema
3. Update services to handle both old and new data models
4. Implement fallback mechanisms for backward compatibility

### Phase 4: Frontend Updates (Week 5-6)
1. Update customer management components
2. Modify project creation flow
3. Update project detail views
4. Implement contact point selection interfaces

### Phase 5: Testing and Validation (Week 7)
1. Comprehensive testing of all customer-related functionality
2. Validate data integrity after migration
3. Test backward compatibility
4. Performance testing with new schema

### Phase 6: Deployment and Monitoring (Week 8)
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Deploy to production with rollback plan
4. Monitor system performance and data integrity

## Code Changes Required

### 1. Update Type Definitions
```typescript
// src/types/project.ts
export interface Project {
  // ... existing fields ...
  customer_id?: string; // Keep for backward compatibility
  customer_organization_id?: string; // New field
  customer_organization?: Organization; // New joined field
  contact_points?: ProjectContactPoint[]; // New field
  // ... existing code ...
}

export interface Contact {
  // ... existing fields ...
  role?: string; // 'purchasing', 'engineering', 'quality', etc.
  is_primary_contact?: boolean;
  description?: string;
  // ... existing code ...
}

export interface ProjectContactPoint {
  id: string;
  project_id: string;
  contact_id: string;
  role?: string;
  is_primary: boolean;
  created_at: string;
  contact?: Contact;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. Update Project Queries
```typescript
// Update hooks and services to fetch organization data instead of contact data
let query = supabase
  .from('projects')
  .select(`
    id,
    organization_id,
    project_id,
    title,
    description,
    customer_organization_id,
    current_stage_id,
    status,
    priority_level,
    source,
    assigned_to,
    created_by,
    estimated_value,
    estimated_delivery_date,
    actual_delivery_date,
    tags,
    metadata,
    stage_entered_at,
    project_type,
    notes,
    created_at,
    updated_at,
    customer:organizations!customer_organization_id(
      id,
      name,
      slug,
      description,
      industry,
      address,
      city,
      state,
      country,
      postal_code
    ),
    contact_points:project_contact_points(
      contact:contacts(
        id,
        contact_name,
        email,
        phone,
        role,
        is_primary_contact
      )
    ),
    current_stage:workflow_stages!current_stage_id(
      id,
      name,
      description,
      stage_order,
      is_active,
      created_at,
      updated_at
    ) 
  `)
  .eq('organization_id', profile.organization_id);
```

## Migration Script

### Data Migration Logic

#### Step 1: Create Customer Organizations
```sql
-- Create customer organization records for each unique customer company
INSERT INTO organizations (id, name, slug, description, industry, is_active, created_at, updated_at)
SELECT DISTINCT 
    uuid_generate_v4() as id,
    c.company_name as name,
    LOWER(REGEXP_REPLACE(c.company_name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    'Customer Organization' as description,
    'Manufacturing' as industry,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM contacts c 
WHERE c.type = 'customer' 
AND c.company_name IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.name = c.company_name
);
```

#### Step 2: Update Contacts to Reference Customer Organizations
```sql
-- Update customer contacts to reference their organization instead of internal organization
UPDATE contacts 
SET organization_id = o.id
FROM organizations o
WHERE contacts.company_name = o.name 
AND contacts.type = 'customer';
```

#### Step 3: Update Projects to Reference Customer Organizations
```sql
-- Update projects to reference customer organizations
UPDATE projects 
SET customer_organization_id = c.organization_id
FROM contacts c 
WHERE projects.customer_id = c.id AND c.type = 'customer';
```

#### Step 4: Create Project-Contact Relationship Records
```sql
-- Create project contact point records for existing projects
INSERT INTO project_contact_points (project_id, contact_id, role, is_primary, created_at)
SELECT 
    p.id as project_id,
    p.customer_id as contact_id,
    'general' as role,
    true as is_primary,
    NOW() as created_at
FROM projects p
WHERE p.customer_id IS NOT NULL;
```

### Validation Queries

#### Check for Orphaned Projects
```sql
-- Check for projects with invalid customer_id references
SELECT COUNT(*) as orphaned_projects
FROM projects p
LEFT JOIN contacts c ON p.customer_id = c.id
WHERE c.id IS NULL;
```

#### Verify Customer Organization Mapping
```sql
-- Check for projects without customer_organization_id
SELECT COUNT(*) as projects_without_org
FROM projects 
WHERE customer_organization_id IS NULL AND customer_id IS NOT NULL;
```

#### Verify Contact Organization Mapping
```sql
-- Verify all customer contacts have organization_id
SELECT COUNT(*) as contacts_without_org
FROM contacts 
WHERE type = 'customer' AND organization_id IS NULL;
```

#### Check Data Integrity
```sql
-- Verify project-contact relationships are correctly established
SELECT COUNT(*) as missing_contact_points
FROM projects p
LEFT JOIN project_contact_points pcp ON p.id = pcp.project_id
WHERE p.customer_id IS NOT NULL AND pcp.id IS NULL;
```

## Risk Mitigation

### 1. Backward Compatibility
- Maintain customer_id field during transition period
- Implement dual-read logic in services
- Provide migration utilities for external integrations

### 2. Data Integrity
- Comprehensive testing with production-like data
- Validation scripts to verify migration accuracy
- Rollback procedures in case of issues

### 3. Performance Impact
- Indexing strategy for new tables and relationships
- Query optimization for organization-based lookups
- Caching strategies for frequently accessed customer data

## Testing Strategy

### 1. Pre-Migration Testing
- Test migration scripts on a copy of production data
- Verify all validation queries return expected results
- Test rollback procedures on sample data

### 2. Unit Testing
- Database query modifications
- Service layer changes
- Data transformation logic

### 3. Integration Testing
- End-to-end customer management workflows
- Project creation and modification flows
- Reporting and analytics functionality

### 4. User Acceptance Testing
- Customer creation and management
- Project assignment to organizations
- Contact point selection and management

### 5. Sample Data Testing
```sql
-- Create test customer organizations
INSERT INTO organizations (name, slug, description, industry) VALUES
('Test Customer Corp', 'test-customer-corp', 'Test customer organization', 'Manufacturing'),
('Sample Industries', 'sample-industries', 'Sample customer organization', 'Automotive');

-- Create test contacts
INSERT INTO contacts (organization_id, type, company_name, contact_name, email, role, is_primary_contact) VALUES
((SELECT id FROM organizations WHERE slug = 'test-customer-corp'), 'customer', 'Test Customer Corp', 'John Doe', 'john@testcustomer.com', 'purchasing', true),
((SELECT id FROM organizations WHERE slug = 'sample-industries'), 'customer', 'Sample Industries', 'Jane Smith', 'jane@sample.com', 'engineering', true);

-- Create test project
INSERT INTO projects (organization_id, project_id, title, customer_id, customer_organization_id) VALUES
((SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam'), 'P-TEST001', 'Test Project', 
 (SELECT id FROM contacts WHERE email = 'john@testcustomer.com'),
 (SELECT id FROM organizations WHERE slug = 'test-customer-corp'));

-- Verify the migration worked correctly
SELECT p.title, o.name as customer_org, c.contact_name, c.role
FROM projects p
JOIN organizations o ON p.customer_organization_id = o.id
JOIN contacts c ON p.customer_id = c.id
WHERE p.project_id = 'P-TEST001';
```

## Rollback Plan

If issues are discovered during or after deployment:

### Database Rollback Script
```sql
-- Step 1: Remove project-contact relationship records
DELETE FROM project_contact_points WHERE created_at > '2025-01-XX'; -- Use actual migration date

-- Step 2: Clear customer_organization_id from projects
UPDATE projects SET customer_organization_id = NULL;

-- Step 3: Revert contacts to reference internal organization
UPDATE contacts 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam')
WHERE type = 'customer';

-- Step 4: Remove customer organization records
DELETE FROM organizations 
WHERE name IN (
    SELECT DISTINCT company_name 
    FROM contacts 
    WHERE type = 'customer'
) AND slug != 'factory-pulse-vietnam';

-- Step 5: Drop the new column and constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_customer_organization_id_fkey;
ALTER TABLE projects DROP COLUMN IF EXISTS customer_organization_id;

-- Step 6: Remove new contact fields
ALTER TABLE contacts DROP COLUMN IF EXISTS role;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_primary_contact;
ALTER TABLE contacts DROP COLUMN IF EXISTS description;

-- Step 7: Drop project_contact_points table
DROP TABLE IF EXISTS project_contact_points;
```

### Application Rollback Steps
1. Revert code changes to previous version
2. Restore data from backups if needed
3. Monitor system for any residual issues
4. Verify all functionality works as before migration

## Success Metrics

1. All existing customer data correctly mapped to organizations
2. Zero data loss during migration
3. Improved performance in customer-related operations
4. Positive feedback from users on new contact point functionality
5. Successful completion of all test scenarios

## Dependencies

1. Supabase database migration capabilities
2. TypeScript type definition updates
3. Frontend component modifications
4. Data migration script development
5. Comprehensive testing framework

## Timeline

Total estimated duration: 8 weeks

| Phase                     | Duration | Start Date | End Date |
| ------------------------- | -------- | ---------- | -------- |
| Database Schema Updates   | 1 week   | TBD        | TBD      |
| Data Migration            | 1 week   | TBD        | TBD      |
| Backend Updates           | 2 weeks  | TBD        | TBD      |
| Frontend Updates          | 2 weeks  | TBD        | TBD      |
| Testing and Validation    | 1 week   | TBD        | TBD      |
| Deployment and Monitoring | 1 week   | TBD        | TBD      |

## Approval

This migration strategy requires approval from:
- [ ] Project Technical Lead
- [ ] Product Owner
- [ ] Database Administrator
- [ ] QA Lead

## References

1. Current database schema documentation
2. Customer management requirements
3. Project workflow specifications
4. Data model design guidelines
