# Workflow Definition Implementation

## Overview

This document describes the implementation of the Workflow Definition system for Factory Pulse. The system provides a powerful way to manage versioned, reusable workflow templates that can be applied to projects.

## Components Implemented

### 1. WorkflowDefinitionService

A new service was created at `src/services/workflowDefinitionService.ts` to manage workflow definitions with the following capabilities:

- Get default workflow definition for an organization
- Get workflow definition by ID
- Get workflow definition stages with overrides
- Get workflow definition sub-stages with overrides
- Create new workflow definitions
- Update existing workflow definitions
- Link workflow stages to workflow definitions
- Apply workflow definition overrides to base stages
- Caching mechanism for improved performance

### 2. Database Schema Updates

The implementation leverages the existing database schema which includes:

- `workflow_definitions` - Stores versioned workflow templates
- `workflow_definition_stages` - Links stages to definitions with override capabilities
- `workflow_definition_sub_stages` - Links sub-stages to definitions with override capabilities

### 3. Type Definitions

The Project interface was updated in `src/types/project.ts` to include a `workflow_definition_id` field to properly reference workflow definitions.

### 4. Database Migrations

Two new migration scripts were created:

1. `supabase/migrations/20250911100000_create_default_workflow_definition.sql` - Creates a default workflow definition for the Apillis organization
2. `supabase/migrations/20250911100001_complete_workflow_stages.sql` - Creates the complete set of workflow stages as defined in the Factory Pulse blueprint

### 5. Integration with Existing Services

The `projectWorkflowService` was updated to use the new workflow definition system when creating projects.

## Workflow Stages

The implementation includes 11 complete workflow stages as defined in the Factory Pulse blueprint:

1. **Intake** - Customer inquiry received and initial review completed
2. **Qualification** - Internal reviews (engineering, QA, production) completed
3. **Quotation** - Quotation approved and sent to customer
4. **Sales Order** - Customer acceptance or PO received
5. **Engineering** - EBOM/MBOM baselined and engineering changes approved
6. **Procurement** - POs released and critical suppliers qualified
7. **Production Planning** - WO(s) released and materials planned
8. **Production** - Operations executed and in-process inspections pass
9. **Quality Final** - Final inspection pass and QA documents ready
10. **Shipping** - Packed and shipping documentation completed
11. **Delivered/Closed** - Delivery confirmed and project completed

Each stage includes 3 sub-stages with appropriate responsible roles, estimated durations, and approval requirements.

## Usage

To use the workflow definition system:

1. Create a workflow definition using `workflowDefinitionService.createWorkflowDefinition()`
2. Link stages to the definition using `workflowDefinitionService.linkStagesToDefinition()`
3. When creating projects, the system will automatically use the default workflow definition for the organization
4. Override stage properties using the definition stages and sub-stages tables

## Testing

Unit tests were created at `src/services/__tests__/workflowDefinitionService.test.ts` to verify the functionality of the service.

## Benefits

This implementation provides several key benefits:

- **Versioned Templates**: Workflow definitions can be versioned for better change management
- **Organization-Specific**: Each organization can have its own workflow definitions
- **Flexible Overrides**: Stages and sub-stages can be customized per workflow definition
- **Backward Compatibility**: Existing workflow functionality continues to work
- **Performance**: Caching mechanism improves response times
- **Scalability**: System can handle multiple workflow definitions per organization