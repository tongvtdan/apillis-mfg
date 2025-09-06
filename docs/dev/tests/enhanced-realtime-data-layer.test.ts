import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enhancedRealtimeManager } from '@/lib/enhanced-realtime-manager';
import { optimizedQueryService } from '@/services/optimizedQueryService';
import { cacheInvalidationService } from '@/services/cacheInvalidationService';
import { cacheService } from '@/services/cacheService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn((callback) => {
                setTimeout(() => callback('SUBSCRIBED'), 100);
                return { unsubscribe: vi.fn() };
            })
        })),
        removeChannel: vi.fn(),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: {
                    id: 'test-project-1',
                    title: 'Test Project',
                    status: 'active'
                },
                error: null
            })
        }))
    }
}));

// Mock toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
    }
}));

describe('Enhanced Real-time Data Layer', () => {
    beforeEach(() => {
        // Clear all caches and reset services
        cacheService.clearCache();
        optimizedQueryService.clearCache();
        cacheInvalidationService.reset();

        // Reset localStorage
        localStorage.clear();

        // Set authentication status
        enhancedRealtimeManager.setAuthenticationStatus(true, 'test-user-id');
    });

    afterEach(() => {
        // Clean up subscriptions
        enhancedRealtimeManager.setAuthenticationStatus(false);
        vi.clearAllMocks();
    });

    describe('Optimized Query Service', () => {
        it('should use selective field loading for different query types', async () => {
            const result = await optimizedQueryService.getProjects(
                { status: 'active' },
                { fields: 'MINIMAL', organizationId: 'test-org' }
            );

            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should cache query results and return cached data on subsequent calls', async () => {
            const options = { status: 'active' };
            const config = { useCache: true, organizationId: 'test-org' };

            // First call - should hit database
            const result1 = await optimizedQueryService.getProjects(options, config);
            expect(result1.fromCache).toBe(false);

            // Second call - should hit cache
            const result2 = await optimizedQueryService.getProjects(options, config);
            expect(result2.fromCache).toBe(true);
        });

        it('should handle query errors gracefully with fallback to cache', async () => {
            // First, populate cache
            await optimizedQueryService.getProjects(
                { status: 'active' },
                { useCache: true, organizationId: 'test-org' }
            );

            // Mock error for next query
            vi.mocked(require('@/integrations/supabase/client').supabase.from).mockImplementationOnce(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                range: vi.fn().mockRejectedValue(new Error('Network error'))
            }));

            // Should fallback to cache
            const result = await optimizedQueryService.getProjects(
                { status: 'active' },
                { useCache: true, fallbackToCache: true, organizationId: 'test-org' }
            );

            expect(result.error).toContain('cached data');
            expect(result.fromCache).toBe(true);
        });

        it('should track query performance metrics', async () => {
            await optimizedQueryService.getProjects(
                { status: 'active' },
                { metrics: true, organizationId: 'test-org' }
            );

            const stats = optimizedQueryService.getPerformanceStats();
            expect(stats.totalQueries).toBeGreaterThan(0);
            expect(stats.averageQueryTime).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Enhanced Real-time Manager', () => {
        it('should establish real-time subscriptions with proper configuration', async () => {
            const callback = vi.fn();

            const unsubscribe = enhancedRealtimeManager.subscribe(
                'test-subscription',
                {
                    table: 'projects',
                    event: 'UPDATE',
                    priority: 'high'
                },
                callback
            );

            // Wait for subscription to be established
            await new Promise(resolve => setTimeout(resolve, 150));

            const status = enhancedRealtimeManager.getStatus();
            expect(status.subscriptions.length).toBe(1);
            expect(status.subscriptions[0].status).toBe('connected');

            unsubscribe();
        });

        it('should handle optimistic updates with rollback capability', async () => {
            const testData = { id: 'test-project', title: 'Updated Title' };
            const rollbackData = { id: 'test-project', title: 'Original Title' };

            const result = await enhancedRealtimeManager.performOptimisticUpdate(
                'test-update-1',
                'update',
                testData,
                rollbackData,
                async () => {
                    // Simulate API failure
                    throw new Error('API Error');
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should confirm optimistic updates when real-time confirmation arrives', async () => {
            const testData = { id: 'test-project', title: 'Updated Title' };

            const result = await enhancedRealtimeManager.performOptimisticUpdate(
                'test-update-2',
                'update',
                testData,
                undefined,
                async () => {
                    return testData;
                }
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(testData);
        });

        it('should provide comprehensive status information', () => {
            const status = enhancedRealtimeManager.getStatus();

            expect(status).toHaveProperty('isAuthenticated');
            expect(status).toHaveProperty('connectionHealth');
            expect(status).toHaveProperty('subscriptions');
            expect(status).toHaveProperty('optimisticUpdates');
            expect(status).toHaveProperty('cacheStatus');
        });
    });

    describe('Cache Invalidation Service', () => {
        it('should invalidate caches based on data changes', () => {
            // Set up some cached data
            cacheService.setProjects([
                { id: 'project-1', title: 'Project 1', status: 'active' } as any
            ]);

            // Process a data change
            cacheInvalidationService.processDataChange({
                table: 'projects',
                operation: 'UPDATE',
                recordId: 'project-1',
                oldData: { status: 'active' },
                newData: { status: 'completed' }
            });

            // Check that appropriate caches were invalidated
            const stats = cacheInvalidationService.getInvalidationStats();
            expect(stats.totalEvents).toBeGreaterThan(0);
        });

        it('should apply different invalidation strategies', () => {
            // Add a custom rule for testing
            cacheInvalidationService.addRule({
                id: 'test-rule',
                trigger: {
                    table: 'projects',
                    operation: 'UPDATE'
                },
                targets: [
                    { type: 'main_cache' }
                ],
                strategy: 'immediate',
                priority: 'high'
            });

            // Process a change that should trigger the rule
            cacheInvalidationService.processDataChange({
                table: 'projects',
                operation: 'UPDATE',
                recordId: 'test-project'
            });

            const history = cacheInvalidationService.getInvalidationHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].appliedRules).toContain('test-rule');
        });

        it('should handle conditional invalidation rules', () => {
            // Add a conditional rule
            cacheInvalidationService.addRule({
                id: 'status-change-rule',
                trigger: {
                    table: 'projects',
                    operation: 'UPDATE',
                    conditions: [
                        { field: 'status', operator: 'neq', value: 'old.status' }
                    ]
                },
                targets: [
                    { type: 'query_cache', pattern: '*status*' }
                ],
                strategy: 'immediate',
                priority: 'high'
            });

            // Process a status change
            cacheInvalidationService.processDataChange({
                table: 'projects',
                operation: 'UPDATE',
                recordId: 'test-project',
                oldData: { status: 'active' },
                newData: { status: 'completed' }
            });

            const history = cacheInvalidationService.getInvalidationHistory();
            const statusChangeEvent = history.find(event =>
                event.appliedRules.includes('status-change-rule')
            );

            expect(statusChangeEvent).toBeDefined();
        });

        it('should provide invalidation statistics', () => {
            // Process several changes
            for (let i = 0; i < 5; i++) {
                cacheInvalidationService.processDataChange({
                    table: 'projects',
                    operation: 'UPDATE',
                    recordId: `project-${i}`
                });
            }

            const stats = cacheInvalidationService.getInvalidationStats();
            expect(stats.totalEvents).toBe(5);
            expect(stats.eventsByTable.projects).toBe(5);
            expect(stats.averageInvalidationsPerEvent).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Integration Tests', () => {
        it('should integrate real-time updates with cache invalidation', async () => {
            const callback = vi.fn();

            // Set up subscription
            const unsubscribe = enhancedRealtimeManager.subscribe(
                'integration-test',
                {
                    table: 'projects',
                    event: 'UPDATE',
                    priority: 'high'
                },
                callback
            );

            // Wait for subscription
            await new Promise(resolve => setTimeout(resolve, 150));

            // Simulate real-time update (this would normally come from Supabase)
            // For testing, we'll directly call the cache invalidation
            cacheInvalidationService.processDataChange({
                table: 'projects',
                operation: 'UPDATE',
                recordId: 'test-project',
                oldData: { status: 'active' },
                newData: { status: 'completed' }
            });

            // Verify cache invalidation occurred
            const stats = cacheInvalidationService.getInvalidationStats();
            expect(stats.totalEvents).toBeGreaterThan(0);

            unsubscribe();
        });

        it('should handle concurrent optimistic updates correctly', async () => {
            const updates = [];

            // Perform multiple concurrent optimistic updates
            for (let i = 0; i < 3; i++) {
                updates.push(
                    enhancedRealtimeManager.performOptimisticUpdate(
                        `concurrent-update-${i}`,
                        'update',
                        { id: `project-${i}`, title: `Updated Title ${i}` },
                        { id: `project-${i}`, title: `Original Title ${i}` },
                        async () => {
                            // Simulate varying API response times
                            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
                            return { id: `project-${i}`, title: `Confirmed Title ${i}` };
                        }
                    )
                );
            }

            const results = await Promise.all(updates);

            // All updates should succeed
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });

        it('should maintain cache consistency across all services', async () => {
            // Set initial data
            const initialProjects = [
                { id: 'project-1', title: 'Project 1', status: 'active' },
                { id: 'project-2', title: 'Project 2', status: 'active' }
            ] as any[];

            cacheService.setProjects(initialProjects);

            // Perform query that should use cache
            const queryResult = await optimizedQueryService.getProjects(
                {},
                { useCache: true, organizationId: 'test-org' }
            );

            expect(queryResult.fromCache).toBe(true);
            expect(queryResult.data.length).toBe(2);

            // Simulate real-time update that should invalidate cache
            cacheInvalidationService.processDataChange({
                table: 'projects',
                operation: 'UPDATE',
                recordId: 'project-1',
                oldData: { status: 'active' },
                newData: { status: 'completed' }
            });

            // Next query should not use cache (it was invalidated)
            const freshQueryResult = await optimizedQueryService.getProjects(
                {},
                { useCache: true, organizationId: 'test-org' }
            );

            // Since cache was invalidated, this should be a fresh query
            expect(freshQueryResult.fromCache).toBe(false);
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should handle subscription failures with retry logic', async () => {
            // Mock subscription failure
            vi.mocked(require('@/integrations/supabase/client').supabase.channel).mockImplementationOnce(() => ({
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn((callback) => {
                    setTimeout(() => callback('CHANNEL_ERROR'), 100);
                    return { unsubscribe: vi.fn() };
                })
            }));

            const callback = vi.fn();

            const unsubscribe = enhancedRealtimeManager.subscribe(
                'error-test',
                {
                    table: 'projects',
                    event: 'UPDATE',
                    priority: 'high',
                    retryConfig: {
                        maxAttempts: 2,
                        baseDelay: 100,
                        backoffFactor: 2
                    }
                },
                callback
            );

            // Wait for initial failure and retry
            await new Promise(resolve => setTimeout(resolve, 300));

            const status = enhancedRealtimeManager.getStatus();
            const subscription = status.subscriptions.find(s => s.id === 'error-test');

            expect(subscription?.retryCount).toBeGreaterThan(0);

            unsubscribe();
        });

        it('should handle optimistic update timeouts', async () => {
            const result = await enhancedRealtimeManager.performOptimisticUpdate(
                'timeout-test',
                'update',
                { id: 'test-project', title: 'Updated' },
                { id: 'test-project', title: 'Original' },
                async () => {
                    // Simulate long-running operation that times out
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    return { id: 'test-project', title: 'Updated' };
                }
            );

            // Should rollback due to timeout
            expect(result.success).toBe(false);
        });
    });

    describe('Performance Monitoring', () => {
        it('should track query performance metrics', async () => {
            // Perform several queries
            for (let i = 0; i < 5; i++) {
                await optimizedQueryService.getProjects(
                    { status: 'active' },
                    { metrics: true, organizationId: 'test-org' }
                );
            }

            const stats = optimizedQueryService.getPerformanceStats();
            expect(stats.totalQueries).toBe(5);
            expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(stats.averageQueryTime).toBeGreaterThanOrEqual(0);
        });

        it('should identify slow queries', async () => {
            // Mock a slow query
            vi.mocked(require('@/integrations/supabase/client').supabase.from).mockImplementationOnce(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                range: vi.fn().mockImplementation(async () => {
                    await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 seconds
                    return { data: [], error: null, count: 0 };
                })
            }));

            await optimizedQueryService.getProjects(
                { status: 'active' },
                { metrics: true, organizationId: 'test-org' }
            );

            const stats = optimizedQueryService.getPerformanceStats();
            expect(stats.slowQueries.length).toBeGreaterThan(0);
        });
    });
});