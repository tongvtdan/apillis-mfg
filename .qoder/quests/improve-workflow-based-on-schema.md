# Factory Pulse Workflow Improvement Plan

## 1. Overview

This document outlines the implementation plan to improve and complete the project workflow management system in Factory Pulse, focusing exclusively on internal operations by Apillis staff. The improvements will address critical gaps in the current workflow implementation, ensuring all workflow stages are properly configured for the Apillis organization and that projects can progress through the complete end-to-end workflow without blockers. Customer organizations will have no access to workflow management features, with all operations handled exclusively by Apillis internal staff.

## 2. Current State Analysis

### 2.1 Workflow Architecture
The Factory Pulse system implements a multi-stage workflow architecture with the following components:
- **Workflow Stages**: High-level project phases (e.g., Intake, Qualification, Quotation)
- **Workflow Sub-Stages**: Detailed steps within each stage with progress tracking
- **Project Progress Tracking**: Per-project tracking of sub-stage completion status
- **Role-Based Access**: Different user roles responsible for different stages

### 2.2 Identified Issues
Based on the implementation assessment, the following critical issues have been identified:

1. **Missing Workflow Stages for Internal Organization**: Only the "Factory Pulse Internal" organization has workflow stages configured, causing project creation failures for customer organizations
2. **Incomplete Stage Transitions**: Validation and advancement logic between workflow stages is partially implemented
3. **Broken Supplier Integration**: Supplier RFQ stage not properly integrated with workflow progression

### 2.3 Root Cause Analysis
The primary issue stems from the workflow stages being organization-specific in the database schema, but only being populated for a single organization. When users from other organizations attempt to create projects, the system fails to find valid workflow stages.

## 3. Solution Architecture

### 3.1 Core Principle
All workflow management will be handled exclusively by Apillis internal staff. Customer organizations will not have access to workflow management features, and all workflow configurations will be maintained within the Apillis organization context.

### 3.2 Database Schema Alignment
The solution will leverage the existing database schema with these key tables:
- `workflow_stages`: Organization-specific workflow stage definitions
- `workflow_sub_stages`: Organization-specific sub-stage definitions
- `workflow_definitions`: Versioned workflow templates that can be applied to projects
- `workflow_definition_stages`: Stage overrides for specific workflow definitions
- `workflow_definition_sub_stages`: Sub-stage overrides for specific workflow definitions
- `project_sub_stage_progress`: Per-project tracking of sub-stage completion
- `projects`: Projects with references to current workflow stage and workflow definition

### 3.3 Workflow Definitions
The Factory Pulse system includes a powerful workflow definition system that allows for versioned, reusable workflow templates. These templates can be applied to projects and provide overrides for stages and sub-stages. For this implementation, we will create a default workflow definition for the Apillis organization that encompasses all the standard workflow stages.

The workflow definition system consists of three key tables:
- `workflow_definitions`: Stores versioned workflow templates
- `workflow_definition_stages`: Links stages to definitions with override capabilities
- `workflow_definition_sub_stages`: Links sub-stages to definitions with override capabilities

This system allows organizations to create standardized workflow templates that can be applied consistently across projects while still providing flexibility for customization when needed.

### 3.4 Workflow Stage Definitions
Based on the Factory Pulse blueprint, the following workflow stages will be implemented for the Apillis organization:

### 3.5 Project Interface Enhancement
The existing Project interface in the TypeScript types will be enhanced to include the workflow_definition_id field to properly reference workflow definitions. This field already exists in the database schema but needs to be added to the TypeScript interface for proper type safety and IDE support.

| Stage Order | Stage Name | Slug | Description |
|-------------|------------|------|-------------|
| 1 | Intake | intake | Customer inquiry received and initial review completed |
| 2 | Qualification | qualification | Internal reviews (engineering, QA, production) completed |
| 3 | Quotation | quotation | Quotation approved and sent to customer |
| 4 | Sales Order | sales_order | Customer acceptance or PO received |
| 5 | Engineering | engineering | EBOM/MBOM baselined and engineering changes approved |
| 6 | Procurement | procurement | POs released and critical suppliers qualified |
| 7 | Production Planning | planning | WO(s) released and materials planned |
| 8 | Production | production | Operations executed and in-process inspections pass |
| 9 | Quality Final | final_qc | Final inspection pass and QA documents ready |
| 10 | Shipping | shipping | Packed and shipping documentation completed |
| 11 | Delivered/Closed | delivered | Delivery confirmed and project completed |

## 4. Implementation Plan

### 4.0 Workflow Definition Service
Before implementing the workflow improvements, we need to create a dedicated service for managing workflow definitions. This service will handle:
- Creating and managing workflow definitions
- Linking workflow stages and sub-stages to definitions
- Providing workflow definition templates for projects
- Managing versioning of workflow definitions

This service will be implemented in `src/services/workflowDefinitionService.ts` and will follow the same patterns as other services in the codebase.

### 4.1 Phase 1: Fix Critical Workflow Foundation (Week 1)

This phase will focus on establishing the foundational workflow components including creating the workflow definition service, populating workflow stages for the Apillis organization, and ensuring projects can be created with proper workflow initialization.

#### 4.1.1 Workflow Definition Service Creation
First, we'll create a new service to manage workflow definitions:

```typescript
// src/services/workflowDefinitionService.ts
import { supabase } from '@/integrations/supabase/client';
import { 
    WorkflowDefinition, 
    WorkflowDefinitionStage, 
    WorkflowDefinitionSubStage,
    WorkflowStage,
    WorkflowSubStage
} from '../types/project';

class WorkflowDefinitionService {
    private cache = new Map<string, any>();
    private cacheTimestamps = new Map<string, number>();
    private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    /**
     * Get default workflow definition for organization
     */
    async getDefaultWorkflowDefinition(organizationId: string): Promise<WorkflowDefinition | null> {
        const cacheKey = `default_definition_${organizationId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('name', 'Default Manufacturing Workflow')
                .eq('is_active', true)
                .single();

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || null);
            this.cacheTimestamps.set(cacheKey, now);

            return data || null;
        } catch (error) {
            console.error('Error fetching default workflow definition:', error);
            return null;
        }
    }

    /**
     * Get workflow definition by ID
     */
    async getWorkflowDefinitionById(id: string): Promise<WorkflowDefinition | null> {
        const cacheKey = `definition_${id}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || null);
            this.cacheTimestamps.set(cacheKey, now);

            return data || null;
        } catch (error) {
            console.error('Error fetching workflow definition:', error);
            return null;
        }
    }

    /**
     * Get workflow definition stages with overrides
     */
    async getWorkflowDefinitionStages(workflowDefinitionId: string): Promise<WorkflowDefinitionStage[]> {
        const cacheKey = `definition_stages_${workflowDefinitionId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definition_stages')
                .select(`
                    *,
                    workflow_stage:workflow_stages(*)
                `)
                .eq('workflow_definition_id', workflowDefinitionId)
                .eq('is_included', true)
                .order('stage_order_override');

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || []);
            this.cacheTimestamps.set(cacheKey, now);

            return data || [];
        } catch (error) {
            console.error('Error fetching workflow definition stages:', error);
            return [];
        }
    }

    /**
     * Get workflow definition sub-stages with overrides
     */
    async getWorkflowDefinitionSubStages(workflowDefinitionId: string): Promise<WorkflowDefinitionSubStage[]> {
        const cacheKey = `definition_substages_${workflowDefinitionId}`;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey) && 
            (now - (this.cacheTimestamps.get(cacheKey) || 0)) < this.CACHE_DURATION) {
            return this.cache.get(cacheKey);
        }

        try {
            const { data, error } = await supabase
                .from('workflow_definition_sub_stages')
                .select(`
                    *,
                    workflow_sub_stage:workflow_sub_stages(*)
                `)
                .eq('workflow_definition_id', workflowDefinitionId)
                .eq('is_included', true)
                .order('sub_stage_order_override');

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, data || []);
            this.cacheTimestamps.set(cacheKey, now);

            return data || [];
        } catch (error) {
            console.error('Error fetching workflow definition sub-stages:', error);
            return [];
        }
    }

    /**
     * Create a new workflow definition
     */
    async createWorkflowDefinition(definitionData: {
        organization_id: string;
        name: string;
        version: number;
        description?: string;
        is_active?: boolean;
        created_by?: string;
    }): Promise<WorkflowDefinition | null> {
        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .insert([{
                    ...definitionData,
                    is_active: definitionData.is_active ?? true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Clear relevant caches
            this.clearOrganizationCache(definitionData.organization_id);

            return data || null;
        } catch (error) {
            console.error('Error creating workflow definition:', error);
            return null;
        }
    }

    /**
     * Update an existing workflow definition
     */
    async updateWorkflowDefinition(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition | null> {
        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Clear relevant caches
            this.cache.delete(`definition_${id}`);
            this.cacheTimestamps.delete(`definition_${id}`);

            return data || null;
        } catch (error) {
            console.error('Error updating workflow definition:', error);
            return null;
        }
    }

    /**
     * Link workflow stages to a workflow definition
     */
    async linkStagesToDefinition(workflowDefinitionId: string, stageIds: string[]): Promise<boolean> {
        try {
            // Get existing links
            const { data: existingLinks } = await supabase
                .from('workflow_definition_stages')
                .select('workflow_stage_id')
                .eq('workflow_definition_id', workflowDefinitionId);

            const existingStageIds = existingLinks?.map(link => link.workflow_stage_id) || [];
            
            // Determine which stages to add/remove
            const stagesToAdd = stageIds.filter(id => !existingStageIds.includes(id));
            const stagesToRemove = existingStageIds.filter(id => !stageIds.includes(id));

            // Add new stage links
            if (stagesToAdd.length > 0) {
                const insertData = stagesToAdd.map(stageId => ({
                    workflow_definition_id: workflowDefinitionId,
                    workflow_stage_id: stageId,
                    is_included: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                const { error: insertError } = await supabase
                    .from('workflow_definition_stages')
                    .insert(insertData);

                if (insertError) throw insertError;
            }

            // Remove old stage links
            if (stagesToRemove.length > 0) {
                const { error: deleteError } = await supabase
                    .from('workflow_definition_stages')
                    .delete()
                    .match({
                        workflow_definition_id: workflowDefinitionId
                    })
                    .in('workflow_stage_id', stagesToRemove);

                if (deleteError) throw deleteError;
            }

            // Clear cache
            this.cache.clear();
            this.cacheTimestamps.clear();

            return true;
        } catch (error) {
            console.error('Error linking stages to workflow definition:', error);
            return false;
        }
    }

    /**
     * Apply workflow definition overrides to base stages
     */
    async applyDefinitionOverrides(
        workflowDefinitionId: string, 
        baseStages: WorkflowStage[]
    ): Promise<WorkflowStage[]> {
        try {
            // Get definition stage overrides
            const definitionStages = await this.getWorkflowDefinitionStages(workflowDefinitionId);
            
            // Apply overrides to base stages
            return baseStages.map(baseStage => {
                const override = definitionStages.find(defStage => 
                    defStage.workflow_stage_id === baseStage.id
                );
                
                if (override) {
                    return {
                        ...baseStage,
                        stage_order: override.stage_order_override ?? baseStage.stage_order,
                        responsible_roles: override.responsible_roles_override ?? baseStage.responsible_roles,
                        estimated_duration_days: override.estimated_duration_days_override ?? baseStage.estimated_duration_days,
                        // Add other override fields as needed
                    };
                }
                
                return baseStage;
            });
        } catch (error) {
            console.error('Error applying workflow definition overrides:', error);
            return baseStages;
        }
    }

    /**
     * Apply workflow definition overrides to base sub-stages
     */
    async applySubStageDefinitionOverrides(
        workflowDefinitionId: string, 
        baseSubStages: WorkflowSubStage[]
    ): Promise<WorkflowSubStage[]> {
        try {
            // Get definition sub-stage overrides
            const definitionSubStages = await this.getWorkflowDefinitionSubStages(workflowDefinitionId);
            
            // Apply overrides to base sub-stages
            return baseSubStages.map(baseSubStage => {
                const override = definitionSubStages.find(defSubStage => 
                    defSubStage.workflow_sub_stage_id === baseSubStage.id
                );
                
                if (override) {
                    return {
                        ...baseSubStage,
                        sub_stage_order: override.sub_stage_order_override ?? baseSubStage.sub_stage_order,
                        responsible_roles: override.responsible_roles_override ?? baseSubStage.responsible_roles,
                        estimated_duration_hours: override.estimated_duration_hours_override ?? baseSubStage.estimated_duration_hours,
                        requires_approval: override.requires_approval_override ?? baseSubStage.requires_approval,
                        can_skip: override.can_skip_override ?? baseSubStage.can_skip,
                        auto_advance: override.auto_advance_override ?? baseSubStage.auto_advance,
                        // Add other override fields as needed
                    };
                }
                
                return baseSubStage;
            });
        } catch (error) {
            console.error('Error applying workflow definition sub-stage overrides:', error);
            return baseSubStages;
        }
    }

    /**
     * Clear cache for an organization
     */
    private clearOrganizationCache(organizationId: string): void {
        // Remove all cache entries for this organization
        for (const key of this.cache.keys()) {
            if (key.includes(organizationId)) {
                this.cache.delete(key);
                this.cacheTimestamps.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

export const workflowDefinitionService = new WorkflowDefinitionService();
```

#### 4.1.2 Database Migration
Create a new migration script to populate workflow stages and workflow definitions for the Apillis organization:

```sql
-- Create default workflow definition for Apillis organization
INSERT INTO workflow_definitions (organization_id, name, version, description, is_active, created_by, created_at, updated_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as organization_id,
    'Default Manufacturing Workflow' as name,
    1 as version,
    'Standard workflow for manufacturing projects' as description,
    true as is_active,
    NULL as created_by,
    NOW() as created_at,
    NOW() as updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_definitions WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Default Manufacturing Workflow'
);

-- Get the workflow definition ID
WITH workflow_def AS (
    SELECT id FROM workflow_definitions 
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Default Manufacturing Workflow'
    LIMIT 1
)
-- Link workflow stages to the default workflow definition
INSERT INTO workflow_definition_stages (workflow_definition_id, workflow_stage_id, is_included, stage_order_override, estimated_duration_days_override, requires_approval_override, created_at, updated_at)
SELECT 
    wd.id as workflow_definition_id,
    ws.id as workflow_stage_id,
    true as is_included,
    ws.stage_order as stage_order_override,
    ws.estimated_duration_days as estimated_duration_days_override,
    false as requires_approval_override,
    NOW() as created_at,
    NOW() as updated_at
FROM workflow_def wd
CROSS JOIN workflow_stages ws
WHERE ws.organization_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND NOT EXISTS (
    SELECT 1 FROM workflow_definition_stages wds 
    WHERE wds.workflow_definition_id = wd.id AND wds.workflow_stage_id = ws.id
  );

-- Get the workflow definition ID
WITH workflow_def AS (
    SELECT id FROM workflow_definitions 
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Default Manufacturing Workflow'
    LIMIT 1
)
-- Link workflow sub-stages to the default workflow definition
INSERT INTO workflow_definition_sub_stages (workflow_definition_id, workflow_sub_stage_id, is_included, sub_stage_order_override, estimated_duration_hours_override, requires_approval_override, created_at, updated_at)
SELECT 
    wd.id as workflow_definition_id,
    wss.id as workflow_sub_stage_id,
    true as is_included,
    wss.sub_stage_order as sub_stage_order_override,
    wss.estimated_duration_hours as estimated_duration_hours_override,
    wss.requires_approval as requires_approval_override,
    NOW() as created_at,
    NOW() as updated_at
FROM workflow_def wd
CROSS JOIN workflow_sub_stages wss
JOIN workflow_stages ws ON wss.workflow_stage_id = ws.id
WHERE ws.organization_id = '550e8400-e29b-41d4-a716-446655440000' 
  AND NOT EXISTS (
    SELECT 1 FROM workflow_definition_sub_stages wdss 
    WHERE wdss.workflow_definition_id = wd.id AND wdss.workflow_sub_stage_id = wss.id
  );

-- Copy workflow stages to Apillis organization (if they don't already exist)
INSERT INTO workflow_stages (organization_id, name, slug, description, color, stage_order, responsible_roles, estimated_duration_days, is_active, created_at, updated_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as organization_id,  -- Apillis organization ID
    name, slug, description, color, stage_order, responsible_roles, estimated_duration_days, is_active, NOW(), NOW()
FROM workflow_stages 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'  -- Factory Pulse Internal org ID
  AND NOT EXISTS (
    SELECT 1 FROM workflow_stages ws2 
    WHERE ws2.organization_id = '550e8400-e29b-41d4-a716-446655440000' 
    AND ws2.slug = workflow_stages.slug
  );

-- If no stages exist, create default stages
INSERT INTO workflow_stages (organization_id, name, slug, description, color, stage_order, responsible_roles, estimated_duration_days, is_active, created_at, updated_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as organization_id,
    unnest(ARRAY['Intake', 'Qualification', 'Quotation', 'Sales Order', 'Engineering', 'Procurement', 'Production Planning', 'Production', 'Quality Final', 'Shipping', 'Delivered/Closed']) as name,
    unnest(ARRAY['intake', 'qualification', 'quotation', 'sales_order', 'engineering', 'procurement', 'planning', 'production', 'final_qc', 'shipping', 'delivered']) as slug,
    unnest(ARRAY[
        'Customer inquiry received and initial review completed',
        'Internal reviews (engineering, QA, production) completed',
        'Quotation approved and sent to customer',
        'Customer acceptance or PO received',
        'EBOM/MBOM baselined and engineering changes approved',
        'POs released and critical suppliers qualified',
        'WO(s) released and materials planned',
        'Operations executed and in-process inspections pass',
        'Final inspection pass and QA documents ready',
        'Packed and shipping documentation completed',
        'Delivery confirmed and project completed'
    ]) as description,
    '#3B82F6' as color,  -- Default blue color
    generate_series(1, 11) as stage_order,
    ARRAY['sales']::user_role[] as responsible_roles,  -- Default to sales role
    5 as estimated_duration_days,  -- Default 5 days
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_stages WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'
);
```

#### 4.1.3 Service Layer Improvements
Update the `WorkflowStageService` to ensure it properly fetches stages for the authenticated user's organization:

#### 4.1.5 Project Service Enhancement
Update the `ProjectService` to properly handle workflow definitions when creating and updating projects:

```typescript
// In workflowStageService.ts
async getWorkflowStages(forceRefresh = false): Promise<WorkflowStage[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (!forceRefresh && this.cachedStages && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        console.log('Returning cached workflow stages');
        return this.cachedStages;
    }

    try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        let query = supabase
            .from('workflow_stages')
            .select('*')
            .eq('is_active', true);

        let userProfile = null;

        // Get organization_id from users table if user is authenticated
        if (userId) {
            const { data: profileData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', userId)
                .single();

            if (userError) {
                console.error('Error fetching user profile:', userError);
            } else {
                userProfile = profileData;
            }

            // Ensure we're filtering by the user's organization
            if (userProfile?.organization_id) {
                query = query.eq('organization_id', userProfile.organization_id);
            } else {
                // Fallback to Apillis organization if user profile is incomplete
                query = query.eq('organization_id', '550e8400-e29b-41d4-a716-446655440000');
            }
        }

        const { data, error } = await query.order('stage_order', { ascending: true });

        if (error) {
            console.error('Error fetching workflow stages:', error);
            throw new Error(`Failed to fetch workflow stages: ${error.message}`);
        }

        this.cachedStages = data || [];
        this.cacheTimestamp = now;

        console.log('Fetched workflow stages:', this.cachedStages);
        return this.cachedStages;
    } catch (error) {
        console.error('Error in getWorkflowStages:', error);
        // Return empty array as fallback
        return [];
    }
}
```

#### 4.1.4 Project Creation Fix
Update the project creation logic to ensure it properly initializes workflow stages:

#### 4.1.5 Project Service Enhancement
Update the `ProjectService` to properly handle workflow definitions when creating and updating projects:

```typescript
// In projectService.ts
async createProject(projectData: {
    title: string;
    description?: string;
    customer_organization_id: string;
    priority_level?: string;
    estimated_value?: number;
    project_type?: string;
    intake_type?: string;
    intake_source?: string;
    current_stage_id: string;
    workflow_definition_id?: string;
    status?: ProjectStatus;
    point_of_contacts?: string[];
    tags?: string[];
    notes?: string;
    metadata?: Record<string, any>;
}): Promise<Project | null> {
    try {
        // Generate project ID if not provided
        const projectId = projectData.project_id || await this.generateProjectId();
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        const userId = userData.user?.id;
        if (!userId) throw new Error('User not authenticated');
        
        // Get user's organization
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', userId)
            .single();
        
        if (profileError) throw profileError;
        if (!userProfile?.organization_id) throw new Error('User organization not found');
        
        // Prepare project data
        const projectPayload = {
            organization_id: userProfile.organization_id,
            project_id: projectId,
            title: projectData.title,
            description: projectData.description,
            customer_organization_id: projectData.customer_organization_id,
            priority_level: projectData.priority_level,
            estimated_value: projectData.estimated_value,
            project_type: projectData.project_type,
            intake_type: projectData.intake_type,
            intake_source: projectData.intake_source,
            current_stage_id: projectData.current_stage_id,
            workflow_definition_id: projectData.workflow_definition_id,
            status: projectData.status || 'active',
            point_of_contacts: projectData.point_of_contacts || [],
            tags: projectData.tags || [],
            notes: projectData.notes,
            metadata: projectData.metadata || {},
            created_by: userId,
            stage_entered_at: new Date().toISOString()
        };
        
        // Create project
        const { data, error } = await supabase
            .from('projects')
            .insert(projectPayload)
            .select(`
                *,
                customer_organization:organizations!customer_organization_id(*),
                current_stage:workflow_stages!current_stage_id(*)
            `)
            .single();
        
        if (error) throw error;
        
        return data || null;
    } catch (error) {
        console.error('Error creating project:', error);
        return null;
    }
}
```

```typescript
// In projectWorkflowService.ts
async createProjectWithWorkflow(projectData: {
    title: string;
    description?: string;
    customer_organization_id: string;
    priority_level?: string;
    estimated_value?: number;
    project_type?: string;
    intake_type?: string;
    intake_source?: string;
    initial_documents?: File[];
    contacts?: string[];
}): Promise<Project | null> {
    try {
        // Get workflow stages for the authenticated user's organization
        const stages = await workflowStageService.getWorkflowStages();
        const initialStage = stages.find(s => s.stage_order === 1);

        if (!initialStage) {
            throw new Error('No initial workflow stage found for your organization');
        }

        // Get default workflow definition for the organization
        const workflowDefinition = await this.getDefaultWorkflowDefinition();

        // Create project with initial stage and workflow definition
        const project = await projectService.createProject({
            ...projectData,
            current_stage_id: initialStage.id,
            workflow_definition_id: workflowDefinition?.id,
            status: 'active',
            point_of_contacts: projectData.contacts || []
        });

        if (!project) {
            throw new Error('Failed to create project');
        }

        // Initialize sub-stage progress for initial stage
        await this.initializeSubStageProgress(project.id, initialStage.id);

        // Log workflow initialization
        await this.logWorkflowEvent({
            eventType: 'stage_changed',
            projectId: project.id,
            userId: project.created_by || '',
            data: {
                from_stage: null,
                to_stage: initialStage.id,
                reason: 'Project creation'
            },
            timestamp: new Date().toISOString()
        });

        // Upload initial documents if provided
        if (projectData.initial_documents?.length) {
            await this.handleDocumentUploads(project.id, projectData.initial_documents);
        }

        // Clear cache
        this.workflowCache.delete(project.id);

        return project;
    } catch (error) {
        console.error('Error creating project with workflow:', error);
        return null;
    }
}

/**
 * Get default workflow definition for the organization
 */
private async getDefaultWorkflowDefinition(): Promise<any> {
    try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
            return null;
        }

        // Get user's organization
        const { data: userProfile } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', userId)
            .single();

        if (!userProfile?.organization_id) {
            return null;
        }

        // Get default workflow definition for organization
        const workflowDefinition = await workflowDefinitionService.getDefaultWorkflowDefinition(userProfile.organization_id);

        return workflowDefinition || null;
    } catch (error) {
        console.error('Error getting default workflow definition:', error);
        return null;
    }
}
```

### 4.2 Phase 2: Complete Stage Transition Logic (Week 2)

#### 4.2.1 Validation Rules Implementation
Implement comprehensive validation rules for stage transitions:

```typescript
// In projectWorkflowService.ts
async validateStageTransition(
    projectId: string, 
    fromStageId: string, 
    toStageId: string
): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredActions: string[];
}> {
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        requiredActions: []
    };

    try {
        // Get project details
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            validation.errors.push('Project not found');
            validation.isValid = false;
            return validation;
        }

        // Get stage details
        const fromStage = fromStageId 
            ? await workflowStageService.getWorkflowStageById(fromStageId)
            : null;
        const toStage = await workflowStageService.getWorkflowStageById(toStageId);

        if (!toStage) {
            validation.errors.push('Target stage not found');
            validation.isValid = false;
            return validation;
        }

        // Validate stage order progression (no backward movement without approval)
        if (fromStage && toStage.stage_order < fromStage.stage_order) {
            validation.warnings.push('Moving to an earlier stage requires management approval');
            validation.requiredActions.push('Obtain management approval for stage regression');
        }

        // Check required approvals for current stage
        const pendingApprovals = await this.getPendingApprovals(projectId);
        if (pendingApprovals.length > 0) {
            validation.errors.push(`Project has ${pendingApprovals.length} pending approvals`);
            validation.isValid = false;
        }

        // Check required documents for current stage
        const requiredDocuments = await this.getRequiredDocuments(projectId, fromStage);
        if (requiredDocuments.length > 0) {
            const uploadedDocs = await this.getUploadedDocuments(projectId);
            const missingDocs = requiredDocuments.filter(req =>
                !uploadedDocs.some(doc => doc.category === req.document_type)
            );

            if (missingDocs.length > 0) {
                validation.errors.push(`${missingDocs.length} required documents missing`);
                validation.requiredActions.push('Upload all required documents');
                validation.isValid = false;
            }
        }

        // Check sub-stage completion for current stage
        if (fromStage) {
            const isCompleted = await this.isStageCompleted(projectId, fromStage.id);
            if (!isCompleted) {
                validation.errors.push('Current stage is not fully completed');
                validation.requiredActions.push('Complete all required sub-stages');
                validation.isValid = false;
            }
        }

        // Stage-specific validation rules
        switch (toStage.slug) {
            case 'quotation':
                // Check if costing information is available
                const projectCosting = project.metadata?.costing;
                if (!projectCosting) {
                    validation.warnings.push('Project costing information not provided');
                    validation.requiredActions.push('Add project costing details');
                }
                break;
                
            case 'sales_order':
                // Check if customer PO is attached
                const poDocuments = await this.getUploadedDocuments(projectId, 'po');
                if (poDocuments.length === 0) {
                    validation.warnings.push('No customer PO attached');
                    validation.requiredActions.push('Upload customer purchase order');
                }
                break;
                
            case 'production':
                // Check if BOM is available
                const bomDocuments = await this.getUploadedDocuments(projectId, 'bom');
                if (bomDocuments.length === 0) {
                    validation.warnings.push('No BOM document available');
                    validation.requiredActions.push('Upload bill of materials');
                }
                break;
        }

    } catch (error) {
        console.error('Error validating stage transition:', error);
        validation.errors.push('Validation failed due to system error');
        validation.isValid = false;
    }

    return validation;
}
```

#### 4.2.2 Sub-Stage Progress Management
Enhance sub-stage progress tracking and completion logic:

```typescript
// In WorkflowSubStageService.ts
static async isStageCompleted(projectId: string, stageId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('project_sub_stage_progress')
        .select(`
            sub_stage_id,
            status,
            workflow_sub_stages!inner(is_required)
        `)
        .eq('project_id', projectId)
        .eq('workflow_stage_id', stageId);

    if (error) {
        throw new Error(`Failed to check stage completion: ${error.message}`);
    }

    // Check if all required sub-stages are completed
    const requiredSubStages = data.filter(item => item.workflow_sub_stages.is_required);
    const completedRequiredSubStages = requiredSubStages.filter(
        item => item.status === 'completed' || item.status === 'skipped'
    );

    return requiredSubStages.length > 0 && requiredSubStages.length === completedRequiredSubStages.length;
}

// In projectWorkflowService.ts
private async initializeSubStageProgress(projectId: string, stageId: string): Promise<void> {
    try {
        // Get sub-stages for the stage
        const { data: subStages, error } = await supabase
            .from('workflow_sub_stages')
            .select('*')
            .eq('workflow_stage_id', stageId)
            .eq('is_active', true)
            .order('sub_stage_order', { ascending: true });

        if (error) throw error;

        if (subStages && subStages.length > 0) {
            // Check if progress already exists
            const { data: existingProgress } = await supabase
                .from('project_sub_stage_progress')
                .select('id')
                .eq('project_id', projectId)
                .eq('workflow_stage_id', stageId)
                .limit(1);

            // Only initialize if no progress exists
            if (!existingProgress || existingProgress.length === 0) {
                // Initialize progress for each sub-stage
                const progressEntries = subStages.map(subStage => ({
                    organization_id: '', // Will be set by RLS
                    project_id: projectId,
                    workflow_stage_id: stageId,
                    sub_stage_id: subStage.id,
                    status: 'pending' as const,
                    started_at: null,
                    completed_at: null,
                    assigned_to: null,
                    notes: null,
                    metadata: {}
                }));

                const { error: insertError } = await supabase
                    .from('project_sub_stage_progress')
                    .insert(progressEntries);

                if (insertError) throw insertError;
            }
        }
    } catch (error) {
        console.error('Error initializing sub-stage progress:', error);
    }
}
```

### 4.3 Phase 3: Supplier Management Integration (Week 3)

#### 4.3.1 Workflow-Aware Supplier Management
Integrate supplier management with workflow stages:

```typescript
// In supplier management service
async createSupplierRFQ(projectId: string, supplierIds: string[]): Promise<boolean> {
    try {
        // Get project workflow state
        const workflowState = await projectWorkflowService.getProjectWorkflowState(projectId);
        if (!workflowState) {
            throw new Error('Unable to retrieve project workflow state');
        }

        // Verify we're in the correct workflow stage
        if (workflowState.currentStage?.slug !== 'procurement') {
            throw new Error('Supplier RFQs can only be created during the Procurement stage');
        }

        // Create supplier RFQs for each supplier
        const rfqPromises = supplierIds.map(supplierId => 
            supabase.from('supplier_rfqs').insert({
                project_id: projectId,
                supplier_id: supplierId,
                status: 'sent',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        );

        const results = await Promise.all(rfqPromises);
        
        // Check for errors
        const hasError = results.some(result => result.error);
        if (hasError) {
            const errors = results.filter(result => result.error).map(result => result.error?.message);
            throw new Error(`Failed to create supplier RFQs: ${errors.join(', ')}`);
        }

        // Update sub-stage progress
        const procurementSubStages = await WorkflowSubStageService.getSubStagesByStageId(
            workflowState.currentStage.id
        );
        
        const rfqSubStage = procurementSubStages.find(s => s.slug === 'supplier_rfq_sent');
        if (rfqSubStage) {
            await WorkflowSubStageService.updateSubStageProgress(
                // Find the progress record for this sub-stage
                workflowState.subStageProgress.find(p => p.sub_stage_id === rfqSubStage.id)?.id || '',
                {
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }
            );
        }

        return true;
    } catch (error) {
        console.error('Error creating supplier RFQ:', error);
        return false;
    }
}
```

#### 4.3.2 Quote Evaluation Integration
Connect supplier quote evaluation to workflow progression:

```typescript
// In supplier management service
async evaluateSupplierQuotes(projectId: string): Promise<boolean> {
    try {
        // Get supplier quotes for this project
        const { data: quotes, error } = await supabase
            .from('supplier_quotes')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'received');

        if (error) throw error;

        if (!quotes || quotes.length === 0) {
            throw new Error('No supplier quotes available for evaluation');
        }

        // Perform quote evaluation logic
        // This would include cost comparison, lead time analysis, etc.
        
        // Update workflow to move to quotation stage if this was for quotation purposes
        const workflowState = await projectWorkflowService.getProjectWorkflowState(projectId);
        if (workflowState?.currentStage?.slug === 'procurement') {
            // Mark procurement sub-stage as completed
            const procurementSubStages = await WorkflowSubStageService.getSubStagesByStageId(
                workflowState.currentStage.id
            );
            
            const quoteEvaluationSubStage = procurementSubStages.find(s => s.slug === 'quote_evaluation');
            if (quoteEvaluationSubStage) {
                await WorkflowSubStageService.updateSubStageProgress(
                    workflowState.subStageProgress.find(p => p.sub_stage_id === quoteEvaluationSubStage.id)?.id || '',
                    {
                        status: 'completed',
                        completed_at: new Date().toISOString()
                    }
                );
            }
        }

        return true;
    } catch (error) {
        console.error('Error evaluating supplier quotes:', error);
        return false;
    }
}
```

## 5. Security Model

### 5.1 Role-Based Access Control
The workflow system will implement RBAC with the following roles and permissions:

| Role | Workflow Permissions |
|------|---------------------|
| Admin | Full access to all workflow features |
| Management | Create/edit workflow stages, approve stage transitions |
| Engineering | Update technical review sub-stages |
| QA | Update quality assurance sub-stages |
| Procurement | Update procurement sub-stages |
| Production | Update production sub-stages |
| Sales | Update intake and quotation sub-stages |

### 5.2 Data Access Control
All workflow data will be protected by Row Level Security (RLS) policies:

```sql
-- Workflow stages RLS policies
CREATE POLICY "workflow_stages_select_policy" ON workflow_stages FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);

CREATE POLICY "workflow_stages_insert_policy" ON workflow_stages FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
    AND (SELECT get_current_user_role()) IN ('admin', 'management')
);

CREATE POLICY "workflow_stages_update_policy" ON workflow_stages FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
    AND (SELECT get_current_user_role()) IN ('admin', 'management')
);
```

### 5.3 Customer Data Isolation
Customers will have no access to workflow management features. All workflow data will be isolated to the Apillis organization context through RLS policies.

## 6. Testing Strategy

### 6.1 Unit Tests
- Test workflow stage retrieval for different user organizations
- Test stage transition validation logic
- Test sub-stage progress management
- Test supplier integration workflows
- Test workflow definition creation and retrieval
- Test workflow definition stage and sub-stage linking
- Test default workflow definition assignment to projects
- Test workflow definition override functionality
- Test versioning of workflow definitions
- Test project creation with workflow definitions
- Test project updates with workflow definition changes

### 6.2 Integration Tests
- End-to-end project creation through all workflow stages
- Stage transition with validation requirements
- Supplier RFQ creation and evaluation workflows
- Workflow definition application to projects
- Workflow definition override functionality testing
- Workflow definition versioning and rollback testing
- Cross-organization workflow definition sharing (if implemented)

### 6.3 User Acceptance Tests
- Verify workflow stages appear correctly for Apillis users
- Test stage advancement with required approvals
- Validate sub-stage completion tracking
- Confirm supplier integration works as expected

## 7. Deployment Plan

### 7.1 Pre-deployment
1. Backup production database
2. Verify migration scripts against staging environment
3. Prepare rollback procedures

### 7.2 Deployment Steps
1. Apply database migration to populate workflow stages for Apillis organization
2. Deploy updated service layer code
3. Update frontend components to reflect new workflow logic
4. Run smoke tests to verify basic functionality

### 7.3 Post-deployment
1. Monitor system logs for errors
2. Verify project creation works for Apillis users
3. Test stage transitions with validation rules
4. Validate supplier integration functionality

## 8. Monitoring and Observability

### 8.1 Key Metrics
- Project creation success rate
- Average time per workflow stage
- Stage transition success rate
- Failed validation attempts

### 8.2 Logging
- Workflow stage changes
- Validation failures
- Sub-stage progress updates
- Supplier integration events

### 8.3 Alerting
- Workflow stage transition failures
- Validation rule violations
- Database access errors
- Performance degradation alerts

## 9. Rollback Procedures

### 9.1 Database Rollback
If issues are discovered, the database changes can be rolled back by:
1. Removing newly inserted workflow stages for Apillis organization
2. Restoring from backup if necessary

### 9.2 Code Rollback
Service layer changes can be rolled back by redeploying the previous version after:
1. Verifying no data corruption occurred
2. Ensuring database state consistency

## 10. Future Enhancements

### 10.1 Workflow Customization
- Allow organization-specific workflow templates using the existing workflow definition system
- Enable stage customization per project type through workflow definition overrides
- Add conditional stage routing based on project attributes
- Create advanced workflow definition editor with visual workflow design capabilities
- Implement workflow definition versioning and rollback capabilities
- Add workflow definition sharing between organizations
- Support for workflow definition inheritance and extension

### 10.2 Advanced Analytics
- Workflow bottleneck identification
- Resource utilization reporting
- Predictive stage duration forecasting

### 10.3 Automation
- Auto-advance stages when criteria are met
- Automated approval routing
- Notification escalation policies

## 11. Performance Considerations

### 11.1 Caching Strategy
- Workflow stage definitions cached for 1 hour
- Project workflow state cached for 5 minutes
- User permissions cached for 30 minutes

### 11.2 Database Optimization
- Indexes on frequently queried columns (organization_id, project_id, stage_id)
- Pagination for large result sets
- Connection pooling for database queries

### 11.3 Frontend Optimization
- Lazy loading of workflow components
- Virtualized lists for large project lists
- Progressive data loading for workflow details

## 12. Error Handling and Recovery

### 12.1 Error Categories
- Database connectivity issues
- Validation failures
- Permission denied errors
- Data integrity violations

### 12.2 Recovery Procedures
- Automatic retry mechanisms for transient failures
- Manual intervention procedures for critical errors
- Data reconciliation processes for inconsistent states

## 13. Documentation and Training

### 13.1 TypeScript Interface Updates

The TypeScript interfaces will be updated to include workflow definition references:

1. **Project Interface**: Add `workflow_definition_id` field to properly type the relationship between projects and workflow definitions

2. **WorkflowStage Interface**: Ensure it properly represents the database schema with all fields

3. **WorkflowSubStage Interface**: Ensure it properly represents the database schema with all fields

These updates will ensure type safety and better IDE support when working with workflow definitions.

### 13.1 Internal Documentation
- Workflow API documentation
- Database schema documentation
- Configuration guides for workflow stages

### 13.2 User Training
- Workflow management training for Apillis staff
- Role-specific training materials
- Video tutorials for common workflows

## 14. Compliance and Auditing

### 14.1 Audit Trail
- All workflow stage changes logged
- User actions tracked with timestamps
- Data modification history maintained

### 14.2 Compliance Requirements
- Data retention policies
- Privacy regulation compliance
- Industry standard adherence

## 15. Conclusion

This design document provides a comprehensive plan to improve the Factory Pulse workflow system, focusing exclusively on Apillis internal operations. By implementing these changes, we will establish a robust workflow foundation that enables proper project progression through all stages while maintaining strict separation between internal operations and customer data. The implementation is structured in three phases over three weeks, ensuring minimal disruption to ongoing operations while delivering significant improvements to the workflow management capabilities.

The workflow definition system provides a powerful template mechanism that allows organizations to create standardized, versioned workflow templates. These templates can be applied consistently across projects while still providing flexibility for customization through stage and sub-stage overrides. This approach ensures both consistency and adaptability in workflow management.

The integration plan includes:
- Creation of a dedicated WorkflowDefinitionService for managing workflow templates
- Enhancement of project creation to properly assign workflow definitions
- Updates to TypeScript interfaces for proper type safety
- Comprehensive testing strategy covering all workflow definition functionality
- Future enhancements for advanced workflow customization

```

```

```

```
