import { workflowDefinitionService } from '../workflowDefinitionService';
import { WorkflowDefinition, WorkflowStage, WorkflowSubStage } from '../../types/project';

// Mock Supabase client.ts
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

jest.mock('@/integrations/supabase/client.ts', () => ({
  supabase: mockSupabase,
}));

describe('WorkflowDefinitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultWorkflowDefinition', () => {
    it('should fetch default workflow definition for organization', async () => {
      const mockDefinition: WorkflowDefinition = {
        id: 'def-1',
        organization_id: 'org-1',
        name: 'Default Manufacturing Workflow',
        version: 1,
        description: 'Test workflow',
        is_active: true,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockDefinition, error: null });

      const result = await workflowDefinitionService.getDefaultWorkflowDefinition('org-1');

      expect(result).toEqual(mockDefinition);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definitions');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', 'org-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('name', 'Default Manufacturing Workflow');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockSupabase.single).toHaveBeenCalled();
    });

    it('should return null if no default workflow definition found', async () => {
      mockSupabase.select.mockResolvedValueOnce({ data: null, error: null });

      const result = await workflowDefinitionService.getDefaultWorkflowDefinition('org-1');

      expect(result).toBeNull();
    });
  });

  describe('getWorkflowDefinitionById', () => {
    it('should fetch workflow definition by ID', async () => {
      const mockDefinition: WorkflowDefinition = {
        id: 'def-1',
        organization_id: 'org-1',
        name: 'Test Workflow',
        version: 1,
        is_active: true,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockDefinition, error: null });

      const result = await workflowDefinitionService.getWorkflowDefinitionById('def-1');

      expect(result).toEqual(mockDefinition);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definitions');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'def-1');
      expect(mockSupabase.single).toHaveBeenCalled();
    });
  });

  describe('getWorkflowDefinitionStages', () => {
    it('should fetch workflow definition stages with overrides', async () => {
      const mockStages = [
        {
          id: 'def-stage-1',
          workflow_definition_id: 'def-1',
          workflow_stage_id: 'stage-1',
          is_included: true,
          stage_order_override: 1,
          workflow_stage: {
            id: 'stage-1',
            organization_id: 'org-1',
            name: 'Test Stage',
            slug: 'test-stage',
            stage_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ];

      mockSupabase.select.mockResolvedValueOnce({ data: mockStages, error: null });

      const result = await workflowDefinitionService.getWorkflowDefinitionStages('def-1');

      expect(result).toEqual(mockStages);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definition_stages');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('workflow_definition_id', 'def-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_included', true);
      expect(mockSupabase.order).toHaveBeenCalledWith('stage_order_override');
    });
  });

  describe('getWorkflowDefinitionSubStages', () => {
    it('should fetch workflow definition sub-stages with overrides', async () => {
      const mockSubStages = [
        {
          id: 'def-substage-1',
          workflow_definition_id: 'def-1',
          workflow_sub_stage_id: 'substage-1',
          is_included: true,
          sub_stage_order_override: 1,
          workflow_sub_stage: {
            id: 'substage-1',
            organization_id: 'org-1',
            workflow_stage_id: 'stage-1',
            name: 'Test SubStage',
            slug: 'test-substage',
            sub_stage_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ];

      mockSupabase.select.mockResolvedValueOnce({ data: mockSubStages, error: null });

      const result = await workflowDefinitionService.getWorkflowDefinitionSubStages('def-1');

      expect(result).toEqual(mockSubStages);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definition_sub_stages');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('workflow_definition_id', 'def-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_included', true);
      expect(mockSupabase.order).toHaveBeenCalledWith('sub_stage_order_override');
    });
  });

  describe('createWorkflowDefinition', () => {
    it('should create a new workflow definition', async () => {
      const definitionData = {
        organization_id: 'org-1',
        name: 'New Workflow',
        version: 1,
      };

      const mockDefinition: WorkflowDefinition = {
        id: 'def-2',
        ...definitionData,
        is_active: true,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockDefinition, error: null });

      const result = await workflowDefinitionService.createWorkflowDefinition(definitionData);

      expect(result).toEqual(mockDefinition);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definitions');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });
  });

  describe('applyDefinitionOverrides', () => {
    it('should apply workflow definition overrides to base stages', async () => {
      const baseStages: WorkflowStage[] = [
        {
          id: 'stage-1',
          organization_id: 'org-1',
          name: 'Base Stage',
          slug: 'base-stage',
          stage_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      const definitionStages = [
        {
          id: 'def-stage-1',
          workflow_definition_id: 'def-1',
          workflow_stage_id: 'stage-1',
          is_included: true,
          stage_order_override: 2,
          responsible_roles_override: ['admin'],
          estimated_duration_days_override: 5,
        }
      ];

      // Mock the getWorkflowDefinitionStages method
      workflowDefinitionService.getWorkflowDefinitionStages = jest.fn().mockResolvedValue(definitionStages);

      const result = await workflowDefinitionService.applyDefinitionOverrides('def-1', baseStages);

      expect(result[0].stage_order).toBe(2);
      expect(result[0].responsible_roles).toEqual(['admin']);
      expect(result[0].estimated_duration_days).toBe(5);
    });
  });

  describe('updateWorkflowDefinition', () => {
    it('should update an existing workflow definition', async () => {
      const mockDefinition: WorkflowDefinition = {
        id: 'def-1',
        organization_id: 'org-1',
        name: 'Updated Workflow',
        version: 2,
        description: 'Updated description',
        is_active: false,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.select.mockResolvedValueOnce({ data: mockDefinition, error: null });

      const result = await workflowDefinitionService.updateWorkflowDefinition('def-1', {
        name: 'Updated Workflow',
        version: 2,
        description: 'Updated description',
        is_active: false
      });

      expect(result).toEqual(mockDefinition);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definitions');
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'def-1');
    });
  });

  describe('linkStagesToDefinition', () => {
    it('should link workflow stages to a workflow definition', async () => {
      const mockExistingLinks = [
        { workflow_stage_id: 'stage-1' },
        { workflow_stage_id: 'stage-2' }
      ];

      mockSupabase.select.mockResolvedValueOnce({ data: mockExistingLinks, error: null });
      mockSupabase.insert.mockResolvedValueOnce({ error: null });
      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      const result = await workflowDefinitionService.linkStagesToDefinition('def-1', ['stage-2', 'stage-3']);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_definition_stages');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(mockSupabase.delete).toHaveBeenCalled();
    });
  });
});