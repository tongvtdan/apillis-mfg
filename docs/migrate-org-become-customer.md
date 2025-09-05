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

-- Update existing records to map contact_id to organization_id
UPDATE projects 
SET customer_organization_id = c.organization_id
FROM contacts c 
WHERE projects.customer_id = c.id AND c.type = 'customer';

-- Add foreign key constraint
ALTER TABLE projects ADD CONSTRAINT projects_customer_organization_id_fkey 
FOREIGN KEY (customer_organization_id) REFERENCES organizations(id);
```

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
```

## Implementation Phases

### Phase 1: Database Schema Updates (Week 1)
1. Create migration script with all schema changes
2. Apply migration to development environment
3. Verify backward compatibility
4. Update database documentation

### Phase 2: Data Migration (Week 2)
1. Develop data migration script to map existing contacts to organizations
2. Create mapping logic for contact roles
3. Test migration with sample data
4. Execute migration on development environment

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
  // ... existing code ...
}

export interface Contact {
  // ... existing fields ...
  role?: string; // 'purchasing', 'engineering', 'quality', etc.
  is_primary_contact?: boolean;
  description?: string;
  // ... existing code ...
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
1. For each existing customer contact:
   - Map to the organization it belongs to
   - Set as primary contact if it was previously used as a customer
   - Assign appropriate role based on context or default to "general"

2. For each project:
   - Set `customer_organization_id` based on the organization of its current customer_id
   - Create entries in `project_contact_points` table to maintain contact associations

3. Validation:
   - Ensure all projects have a valid `customer_organization_id`
   - Verify contact point relationships are correctly established

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

### 1. Unit Testing
- Database query modifications
- Service layer changes
- Data transformation logic

### 2. Integration Testing
- End-to-end customer management workflows
- Project creation and modification flows
- Reporting and analytics functionality

### 3. User Acceptance Testing
- Customer creation and management
- Project assignment to organizations
- Contact point selection and management

## Rollback Plan

If issues are discovered during or after deployment:

1. Revert database schema changes using reverse migration
2. Restore data from backups if needed
3. Revert code changes to previous version
4. Monitor system for any residual issues

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

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| Database Schema Updates | 1 week | TBD | TBD |
| Data Migration | 1 week | TBD | TBD |
| Backend Updates | 2 weeks | TBD | TBD |
| Frontend Updates | 2 weeks | TBD | TBD |
| Testing and Validation | 1 week | TBD | TBD |
| Deployment and Monitoring | 1 week | TBD | TBD |

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
