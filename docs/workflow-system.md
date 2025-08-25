# Project Workflow System Documentation

## Overview

The Project Workflow System is a comprehensive solution for managing project lifecycle stages across different views (Flow, Kanban, Table). It ensures that projects follow the defined workflow stages with proper validation of exit criteria before allowing status changes.

## Workflow Stages

The system implements the following 8-stage workflow:

1. **Inquiry Received**
2. **Technical Review**
3. **Supplier RFQ Sent**
4. **Quoted**
5. **Order Confirmed**
6. **Procurement & Planning**
7. **In Production**
8. **Shipped & Closed**

## Core Components

### 1. Workflow Validator (`/src/lib/workflow-validator.ts`)

The WorkflowValidator class provides validation logic for status changes:

- **Validation Rules**: Ensures projects can't move backward in workflow (except for specific allowed cases)
- **Exit Criteria**: Validates that required conditions are met before moving to the next stage
- **Stage Progression**: Controls which stages a project can move to based on its current stage

### 2. useProjects Hook (`/src/hooks/useProjects.ts`)

Extended to include workflow validation before any status updates:

- **updateProjectStatus**: Validates changes before updating project status in the database
- **updateProjectStatusOptimistic**: Validates changes before optimistically updating UI and database

### 3. View Components

#### Flow View (`/src/components/project/WorkflowFlowchart.tsx`)
- Visual representation of the workflow stages
- Project selection and detailed workflow management
- Direct stage progression with validation

#### Kanban View (`/src/components/dashboard/WorkflowKanban.tsx`)
- Drag-and-drop interface for moving projects between stages
- Real-time validation during drag operations
- Visual indicators for validation errors

#### Table View (`/src/components/project/ProjectTable.tsx`)
- Dropdown-based status changes
- Validation feedback through toast notifications

## Exit Criteria

Each stage has specific exit criteria that must be met before a project can progress:

### Technical Review
- Engineering review completed
- QA inspection requirements defined
- Production process evaluation completed

### Supplier RFQ Sent
- BOM breakdown completed
- Suppliers selected
- RFQs sent to all suppliers

### Quoted
- All supplier quotes received
- Internal costing finalized
- Quote document generated

### Order Confirmed
- Customer PO received
- Internal sales order created

### Procurement & Planning
- Purchase orders finalized
- Production schedule confirmed
- Raw materials inventory confirmed

### In Production
- Work order released
- Manufacturing started

### Shipped & Closed
- Product shipped
- Proof of delivery received
- Customer feedback collected

## Implementation Details

### Status Change Validation Flow

1. User initiates a status change (via drag-and-drop, dropdown, or button)
2. WorkflowValidator.validateStatusChange() is called with current project and new status
3. Validation checks:
   - Stage progression rules (no backward movement)
   - Exit criteria for current stage
   - Required fields and data completeness
4. If validation fails:
   - Error messages are displayed via toast notifications
   - Status change is prevented
5. If validation passes:
   - Status change is executed
   - Success message is displayed

### Error Handling

- Validation errors are shown via toast notifications
- Optimistic updates are reverted on database errors
- Warning messages are displayed for non-critical issues

## Usage Examples

### Moving a Project Through the Workflow

1. **Inquiry Received** → **Technical Review**
   - System validates that customer information is present
   - Project moves to Technical Review stage

2. **Technical Review** → **Supplier RFQ Sent**
   - System shows warning to ensure all review tasks are completed
   - Project moves to Supplier RFQ Sent stage

3. **Supplier RFQ Sent** → **Quoted**
   - System validates that all supplier quotes are received
   - If quotes are missing, error is shown and move is blocked

## Future Enhancements

1. **Customizable Exit Criteria**: Allow administrators to define custom exit criteria per stage
2. **Workflow Analytics**: Track and report on workflow efficiency and bottlenecks
3. **Automated Stage Progression**: Implement rules for automatic stage changes when criteria are met
4. **Role-based Permissions**: Restrict stage changes based on user roles
5. **Audit Trail**: Log all workflow changes with timestamps and user information

## Integration Points

- **Supabase Database**: Project status is stored in the projects table
- **Real-time Updates**: Changes are broadcast to all connected clients
- **Toast Notifications**: User feedback for validation results
- **Supplier Quotes**: Integration with supplier quote system for validation

This workflow system ensures that projects follow a consistent, validated path through their lifecycle while providing flexibility for different project types and management styles.