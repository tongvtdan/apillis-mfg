import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approvalService } from '../approvalService';
import { supabase } from '@/integrations/supabase/client.ts.js';

// Mock Supabase
vi.mock('@/integrations/supabase/client.ts.js', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                    order: vi.fn(() => ({
                        single: vi.fn()
                    }))
                })),
                in: vi.fn(() => ({
                    eq: vi.fn()
                })),
                insert: vi.fn(() => ({
                    select: vi.fn()
                })),
                update: vi.fn(() => ({
                    eq: vi.fn()
                })),
                contains: vi.fn(),
                like: vi.fn(() => ({
                    order: vi.fn()
                })),
                lt: vi.fn(),
                not: vi.fn(() => ({
                    is: vi.fn()
                }))
            }))
        }))
    }
}));

// Mock notification service
vi.mock('../notificationService', () => ({
    notificationService: {
        sendApprovalRequestNotifications: vi.fn(),
        sendApprovalDecisionNotifications: vi.fn()
    }
}));

describe('ApprovalService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createApprovalRequests', () => {
        it('should create approval requests for required roles', async () => {
            // Mock users query
            const mockUsers = [
                { id: 'user1', role: 'engineering' },
                { id: 'user2', role: 'qa' }
            ];

            const mockCreatedApprovals = [
                {
                    id: 'approval1',
                    project_id: 'project1',
                    reviewer_id: 'user1',
                    review_type: 'stage_approval_engineering',
                    status: 'pending',
                    organization_id: 'org1',
                    metadata: { stage_id: 'stage1', approval_role: 'engineering' }
                },
                {
                    id: 'approval2',
                    project_id: 'project1',
                    reviewer_id: 'user2',
                    review_type: 'stage_approval_qa',
                    status: 'pending',
                    organization_id: 'org1',
                    metadata: { stage_id: 'stage1', approval_role: 'qa' }
                }
            ];

            // Setup mocks
            (supabase.from as any).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        in: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({
                                data: mockUsers,
                                error: null
                            })
                        })
                    })
                }),
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: mockCreatedApprovals,
                        error: null
                    })
                })
            });

            const result = await approvalService.createApprovalRequests(
                'project1',
                'stage1',
                ['engineering', 'qa'],
                'org1'
            );

            expect(result).toHaveLength(2);
            expect(result[0].approver_role).toBe('engineering');
            expect(result[1].approver_role).toBe('qa');
        });

        it('should throw error when no users found with required roles', async () => {
            // Mock empty users query
            (supabase.from as any).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        in: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({
                                data: [],
                                error: null
                            })
                        })
                    })
                })
            });

            await expect(
                approvalService.createApprovalRequests(
                    'project1',
                    'stage1',
                    ['engineering'],
                    'org1'
                )
            ).rejects.toThrow('No active users found with required approval roles');
        });
    });

    describe('getApprovalStatus', () => {
        it('should return complete status when all approvals are approved', async () => {
            const mockStage = {
                approval_roles: ['engineering', 'qa'],
                requires_approval: true
            };

            const mockReviews = [
                {
                    id: 'review1',
                    project_id: 'project1',
                    reviewer_id: 'user1',
                    status: 'approved',
                    metadata: { stage_id: 'stage1', approval_role: 'engineering' }
                },
                {
                    id: 'review2',
                    project_id: 'project1',
                    reviewer_id: 'user2',
                    status: 'approved',
                    metadata: { stage_id: 'stage1', approval_role: 'qa' }
                }
            ];

            // Setup mocks
            (supabase.from as any)
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockStage,
                                error: null
                            })
                        })
                    })
                })
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            contains: vi.fn().mockResolvedValue({
                                data: mockReviews,
                                error: null
                            })
                        })
                    })
                });

            const result = await approvalService.getApprovalStatus('project1', 'stage1');

            expect(result.isComplete).toBe(true);
            expect(result.approved).toHaveLength(2);
            expect(result.pending).toHaveLength(0);
            expect(result.rejected).toHaveLength(0);
        });

        it('should return incomplete status when approvals are pending', async () => {
            const mockStage = {
                approval_roles: ['engineering', 'qa'],
                requires_approval: true
            };

            const mockReviews = [
                {
                    id: 'review1',
                    project_id: 'project1',
                    reviewer_id: 'user1',
                    status: 'approved',
                    metadata: { stage_id: 'stage1', approval_role: 'engineering' }
                },
                {
                    id: 'review2',
                    project_id: 'project1',
                    reviewer_id: 'user2',
                    status: 'pending',
                    metadata: { stage_id: 'stage1', approval_role: 'qa' }
                }
            ];

            // Setup mocks
            (supabase.from as any)
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockStage,
                                error: null
                            })
                        })
                    })
                })
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            contains: vi.fn().mockResolvedValue({
                                data: mockReviews,
                                error: null
                            })
                        })
                    })
                });

            const result = await approvalService.getApprovalStatus('project1', 'stage1');

            expect(result.isComplete).toBe(false);
            expect(result.approved).toHaveLength(1);
            expect(result.pending).toHaveLength(1);
            expect(result.rejected).toHaveLength(0);
        });
    });

    describe('submitApproval', () => {
        it('should successfully submit approval decision', async () => {
            // Mock successful update
            (supabase.from as any).mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null
                    })
                })
            });

            const result = await approvalService.submitApproval(
                'approval1',
                'approved',
                'Looks good to proceed',
                'All requirements met'
            );

            expect(result).toBe(true);
        });

        it('should handle database errors gracefully', async () => {
            // Mock database error
            (supabase.from as any).mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: new Error('Database error')
                    })
                })
            });

            await expect(
                approvalService.submitApproval('approval1', 'approved')
            ).rejects.toThrow('Database error');
        });
    });

    describe('autoAssignApprovers', () => {
        it('should successfully auto-assign approvers', async () => {
            const mockStage = {
                approval_roles: ['engineering'],
                requires_approval: true,
                name: 'Technical Review'
            };

            const mockUsers = [
                { id: 'user1', role: 'engineering' }
            ];

            const mockCreatedApprovals = [
                {
                    id: 'approval1',
                    project_id: 'project1',
                    reviewer_id: 'user1',
                    review_type: 'stage_approval_engineering',
                    status: 'pending',
                    organization_id: 'org1',
                    metadata: { stage_id: 'stage1', approval_role: 'engineering' }
                }
            ];

            // Setup mocks for stage query
            (supabase.from as any)
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockStage,
                                error: null
                            })
                        })
                    })
                })
                // Mock for existing approvals check
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            contains: vi.fn().mockResolvedValue({
                                data: [],
                                error: null
                            })
                        })
                    })
                })
                // Mock for users query
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            in: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({
                                    data: mockUsers,
                                    error: null
                                })
                            })
                        })
                    })
                })
                // Mock for insert
                .mockReturnValueOnce({
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockResolvedValue({
                            data: mockCreatedApprovals,
                            error: null
                        })
                    })
                });

            const result = await approvalService.autoAssignApprovers(
                'project1',
                'stage1',
                'org1'
            );

            expect(result.success).toBe(true);
            expect(result.approvals).toHaveLength(1);
            expect(result.message).toContain('Created 1 approval requests');
        });

        it('should return success when no approvals required', async () => {
            const mockStage = {
                approval_roles: null,
                requires_approval: false,
                name: 'Simple Stage'
            };

            (supabase.from as any).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockStage,
                            error: null
                        })
                    })
                })
            });

            const result = await approvalService.autoAssignApprovers(
                'project1',
                'stage1',
                'org1'
            );

            expect(result.success).toBe(true);
            expect(result.message).toBe('No approvals required for this stage');
        });
    });
});