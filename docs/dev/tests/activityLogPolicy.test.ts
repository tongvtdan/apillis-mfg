import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stageHistoryService } from '../services/stageHistoryService';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase client
vi.mock('../integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
    }
}));

describe('Activity Log Policy Tests', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    it('should handle activity log insertion errors gracefully', async () => {
        // Mock the Supabase client to simulate a policy error
        (supabase.from as vi.Mock)
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'project-1', organization_id: 'org-1' },
                    error: null
                })
            })
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'stage-1', name: 'Test Stage' },
                    error: null
                })
            })
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'stage-2', name: 'Next Stage' },
                    error: null
                })
            })
            .mockReturnValue({
                insert: vi.fn().mockResolvedValue({
                    error: {
                        message: 'new row violates row-level security policy for table "activity_log"',
                        code: '42501'
                    }
                })
            });

        // This should not throw an error even if the insert fails
        await expect(stageHistoryService.recordStageTransition({
            projectId: 'project-1',
            fromStageId: 'stage-1',
            toStageId: 'stage-2',
            userId: 'user-1',
            reason: 'test transition'
        })).resolves.not.toThrow();
    });

    it('should successfully record stage transition when policy is correct', async () => {
        // Mock successful Supabase operations
        (supabase.from as vi.Mock)
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'project-1', organization_id: 'org-1' },
                    error: null
                })
            })
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'stage-1', name: 'Test Stage' },
                    error: null
                })
            })
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { id: 'stage-2', name: 'Next Stage' },
                    error: null
                })
            })
            .mockReturnValue({
                insert: vi.fn().mockResolvedValue({
                    error: null
                })
            });

        await expect(stageHistoryService.recordStageTransition({
            projectId: 'project-1',
            fromStageId: 'stage-1',
            toStageId: 'stage-2',
            userId: 'user-1',
            reason: 'test transition'
        })).resolves.not.toThrow();
    });
});