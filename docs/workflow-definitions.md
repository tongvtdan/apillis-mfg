# Workflow Definitions

## Overview

Workflow Definitions provide a powerful way to manage versioned, reusable workflow templates that can be applied to projects in Factory Pulse. This feature allows organizations to create standardized workflows with customized stages and sub-stages that can be reused across multiple projects.

## Key Features

- **Versioned Templates**: Create and manage multiple versions of workflow templates
- **Organization-Specific**: Each organization can have its own workflow definitions
- **Flexible Overrides**: Customize stage properties per workflow definition
- **Reusable Templates**: Apply the same workflow template to multiple projects
- **Admin Management**: Full CRUD operations for workflow definitions through the admin interface

## Components

### 1. WorkflowDefinitionService

The [WorkflowDefinitionService](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/src/services/workflowDefinitionService.ts) provides the core functionality for managing workflow definitions:

- `getDefaultWorkflowDefinition(organizationId)`: Get the default workflow definition for an organization
- `getWorkflowDefinitionById(id)`: Retrieve a specific workflow definition by ID
- `getWorkflowDefinitionStages(workflowDefinitionId)`: Get stages associated with a workflow definition
- `getWorkflowDefinitionSubStages(workflowDefinitionId)`: Get sub-stages associated with a workflow definition
- `createWorkflowDefinition(definitionData)`: Create a new workflow definition
- `updateWorkflowDefinition(id, updates)`: Update an existing workflow definition
- `linkStagesToDefinition(workflowDefinitionId, stageIds)`: Link workflow stages to a definition
- `applyDefinitionOverrides(workflowDefinitionId, baseStages)`: Apply definition-specific overrides to base stages

### 2. Database Schema

The implementation uses three main tables:

- `workflow_definitions`: Stores versioned workflow templates
- `workflow_definition_stages`: Links stages to definitions with override capabilities
- `workflow_definition_sub_stages`: Links sub-stages to definitions with override capabilities

### 3. Admin UI

The Workflow Definition Management component in the admin panel provides a user-friendly interface for:

- Creating new workflow definitions
- Editing existing workflow definitions
- Duplicating workflow definitions
- Deleting workflow definitions
- Managing stage assignments for each definition

### 4. Project Creation Integration

When creating new projects, users can now select from available workflow definitions, which will automatically:

- Assign the selected workflow definition to the project
- Set the initial workflow stage based on the definition
- Apply any stage overrides defined in the workflow template

## Usage

### Creating Workflow Definitions

1. Navigate to the Admin panel → Workflows tab
2. Click "New Definition"
3. Enter the definition name, version, and description
4. Select the workflow stages to include in this definition
5. Save the definition

### Using Workflow Definitions in Projects

1. When creating a new project, select a workflow definition from the dropdown
2. The project will be created with the selected workflow template
3. The initial stage will be set according to the workflow definition

### Managing Workflow Definitions

Administrators can:
- Edit existing definitions to update names, descriptions, or versions
- Duplicate definitions to create new versions
- Delete unused definitions
- View all definitions in a table with status and stage information

## Benefits

This implementation provides several key benefits:

- **Standardization**: Ensure consistent workflows across projects
- **Flexibility**: Customize workflows for different project types
- **Version Control**: Track changes to workflow templates over time
- **Efficiency**: Reduce setup time for new projects
- **Governance**: Maintain control over approved workflow processes
- **Scalability**: Handle multiple workflow definitions per organization

## Technical Implementation

The workflow definition system integrates with the existing project workflow service to ensure seamless operation:

- Projects created with workflow definitions automatically use the appropriate initial stage
- Stage overrides are applied when projects use specific workflow definitions
- Caching mechanisms improve performance for frequently accessed definitions
- Backward compatibility is maintained with projects that don't use workflow definitions