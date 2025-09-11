# 🏗️ PROJECT CREATION FLOW DIAGRAM

## Database Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROJECT CREATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ORGANIZATIONS │    │      USERS      │    │    CONTACTS     │
│                 │    │                 │    │                 │
│ • id (PK)       │◄───┤ • id (PK)       │    │ • id (PK)       │
│ • name          │    │ • organization_id│   │ • organization_id│
│ • organization_type│  │ • email         │    │ • contact_name  │
│ • is_active     │    │ • role          │    │ • email         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                PROJECTS                                         │
│                                                                                 │
│ • id (PK)                    • current_stage_id (FK) ──────────────────────┐  │
│ • organization_id (FK) ──────┤ • workflow_definition_id (FK) ──────────────┐ │  │
│ • project_id (UNIQUE)        │ • customer_organization_id (FK) ────────────┐ │ │  │
│ • title                      │ • point_of_contacts (FK[]) ────────────────┐ │ │ │  │
│ • description               │ • created_by (FK) ─────────────────────────┐ │ │ │ │  │
│ • status                    │ • assigned_to (FK)                        │ │ │ │ │  │
│ • priority_level            │ • estimated_value                         │ │ │ │ │  │
│ • project_type              │ • estimated_delivery_date                │ │ │ │ │  │
│ • intake_type               │ • tags                                    │ │ │ │ │  │
│ • intake_source             │ • metadata                                │ │ │ │ │  │
│ • notes                     │ • stage_entered_at                        │ │ │ │ │  │
└─────────────────────────────┴───────────────────────────────────────────┴─┴─┴─┴──┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ORGANIZATIONS   │    │ WORKFLOW_STAGES │    │ WORKFLOW_DEFINITIONS │  │ PROJECT_SUB_STAGE_PROGRESS │
│ (Customer)      │    │ (Required)      │    │ (Optional)       │    │ (Runtime)        │
│                 │    │                 │    │                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • name          │    │ • organization_id│   │ • organization_id│   │ • project_id (FK)│
│ • organization_type│  │ • name         │    │ • name          │    │ • workflow_stage_id│
│ • is_active     │    │ • slug         │    │ • version       │    │ • sub_stage_id   │
└─────────────────┘    │ • stage_order  │    │ • is_active     │    │ • status         │
                       │ • is_active    │    │ • created_by    │    │ • started_at     │
                       │ • responsible_roles│ │ • description   │    │ • completed_at   │
                       └─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │                       │
                                │                       │                       │
                                ▼                       ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                       │ WORKFLOW_SUB_STAGES │ │ WORKFLOW_DEFINITION_STAGES │ │ WORKFLOW_DEFINITION_SUB_STAGES │
                       │                 │    │                 │    │                 │
                       │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
                       │ • workflow_stage_id│ │ • workflow_definition_id│ │ • workflow_definition_id│
                       │ • name         │    │ • workflow_stage_id│   │ • workflow_sub_stage_id│
                       │ • slug         │    │ • is_included   │    │ • is_included   │
                       │ • sub_stage_order│  │ • stage_order_override│ │ • sub_stage_order_override│
                       │ • is_required  │    │ • responsible_roles_override│ │ • responsible_roles_override│
                       │ • requires_approval│ │ • estimated_duration_days_override│ │ • requires_approval_override│
                       │ • can_skip     │    │ • requires_approval_override│ │ • can_skip_override│
                       │ • auto_advance │    │ • metadata       │    │ • auto_advance_override│
                       └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Creation Flow Sequence

```
1. USER SUBMITS FORM
   ↓
2. VALIDATE INPUT DATA
   ↓
3. GET USER ORGANIZATION
   ↓
4. DETERMINE INTAKE TYPE
   ↓
5. LOOKUP WORKFLOW STAGE
   ├─ IntakeMappingService.getInitialStageSlug()
   ├─ IntakeWorkflowService.getInitialStageId()
   └─ Query: workflow_stages WHERE organization_id = user_org AND slug = required_slug
   ↓
6. CREATE PROJECT RECORD
   ├─ Set current_stage_id = found_stage_id
   ├─ Set workflow_definition_id = NULL (optional)
   └─ Insert into projects table
   ↓
7. INITIALIZE SUB-STAGE PROGRESS
   ├─ Get sub-stages for initial stage
   └─ Create project_sub_stage_progress records
   ↓
8. RETURN SUCCESS
```

## Critical Relationships

### **REQUIRED RELATIONSHIPS (Project Creation Fails Without These)**

1. **organizations → projects**
   - `projects.organization_id` → `organizations.id`
   - **Purpose**: Multi-tenant isolation
   - **Status**: ✅ Working

2. **organizations → projects (customer)**
   - `projects.customer_organization_id` → `organizations.id`
   - **Purpose**: Customer identification
   - **Status**: ✅ Working

3. **workflow_stages → projects**
   - `projects.current_stage_id` → `workflow_stages.id`
   - **Purpose**: Workflow progression
   - **Status**: ❌ BROKEN (missing stages for user orgs)

4. **users → projects**
   - `projects.created_by` → `users.id`
   - **Purpose**: Audit trail
   - **Status**: ✅ Working

### **OPTIONAL RELATIONSHIPS (Project Creation Works Without These)**

1. **workflow_definitions → projects**
   - `projects.workflow_definition_id` → `workflow_definitions.id`
   - **Purpose**: Template-based workflows
   - **Status**: ❌ NOT USED (optional field)

2. **workflow_definition_stages → workflow_stages**
   - Template overrides for stage properties
   - **Status**: ❌ NOT IMPLEMENTED

3. **contacts → projects**
   - `projects.point_of_contacts` → `contacts.id[]`
   - **Purpose**: Contact management
   - **Status**: ✅ Working (optional)

## Data Flow Analysis

### **Current Implementation (What Actually Happens)**

```typescript
// 1. User submits RFQ form
const formData = {
    customerName: "John Doe",
    company: "Acme Corp",
    projectTitle: "New Product",
    intakeType: "rfq"
};

// 2. Create customer organization (if needed)
const customerOrg = await createOrganization({
    name: formData.company,
    organization_type: "customer"
});

// 3. Get user's organization
const userOrg = profile.organization_id; // e.g., "550e8400-e29b-41d4-a716-446655440001"

// 4. Map intake type to stage slug
const stageSlug = IntakeMappingService.getInitialStageSlug("rfq"); // "inquiry_received"

// 5. Lookup workflow stage (THIS IS WHERE IT FAILS)
const { data: stage, error } = await supabase
    .from('workflow_stages')
    .select('id')
    .eq('organization_id', userOrg)        // User's org
    .eq('slug', stageSlug)                 // "inquiry_received"
    .eq('is_active', true)
    .single();

// ❌ FAILS: No stages exist for user's organization
// Only "Factory Pulse Internal" has stages

// 6. Create project (never reached)
const project = await supabase.from('projects').insert({
    organization_id: userOrg,
    customer_organization_id: customerOrg.id,
    current_stage_id: stage.id,           // NULL because stage lookup failed
    workflow_definition_id: null,         // Optional, not used
    title: formData.projectTitle,
    // ... other fields
});
```

### **Required Fix (What Should Happen)**

```sql
-- Copy workflow stages to all organizations
INSERT INTO workflow_stages (
    id, organization_id, name, slug, description, color,
    stage_order, responsible_roles, estimated_duration_days,
    is_active, created_by
)
SELECT
    gen_random_uuid(),
    o.id,
    ws.name, ws.slug, ws.description, ws.color,
    ws.stage_order, ws.responsible_roles, ws.estimated_duration_days,
    true, ws.created_by
FROM organizations o
CROSS JOIN workflow_stages ws
WHERE o.is_active = true
AND ws.organization_id = '550e8400-e29b-41d4-a716-446655440005'  -- Internal org
AND ws.is_active = true
AND o.id != '550e8400-e29b-41d4-a716-446655440005';  -- Exclude internal org
```

### **After Fix (What Will Happen)**

```typescript
// 5. Lookup workflow stage (NOW WORKS)
const { data: stage, error } = await supabase
    .from('workflow_stages')
    .select('id')
    .eq('organization_id', userOrg)        // User's org
    .eq('slug', stageSlug)                 // "inquiry_received"
    .eq('is_active', true)
    .single();

// ✅ SUCCESS: Stage found for user's organization
// stage.id = "new-stage-id-for-user-org"

// 6. Create project (NOW WORKS)
const project = await supabase.from('projects').insert({
    organization_id: userOrg,
    customer_organization_id: customerOrg.id,
    current_stage_id: stage.id,           // ✅ Valid stage ID
    workflow_definition_id: null,         // Still optional, not used
    title: formData.projectTitle,
    // ... other fields
});

// ✅ SUCCESS: Project created successfully
```

## Summary

**The `workflow_definition_id` field is optional and not used in the current implementation. The real issue is missing `workflow_stages` for user organizations. Once workflow stages exist for all organizations, project creation will work perfectly.**
