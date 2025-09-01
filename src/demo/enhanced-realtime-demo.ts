/**
 * Demonstration of the Enhanced Real-time Data Layer
 * 
 * This file shows how to use the new enhanced real-time data layer
 * with optimized queries, intelligent caching, and optimistic updates.
 */

import { enhancedRealtimeManager } from '@/lib/enhanced-realtime-manager';
import { optimizedQueryService, FIELD_PRESETS } from '@/services/optimizedQueryService';
import { cacheInvalidationService } from '@/services/cacheInvalidationService';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';

// Example 1: Using the Enhanced Real-time Manager
export function demonstrateRealtimeManager() {
    console.log('🔔 Enhanced Real-time Manager Demo');

    // Set authentication status
    enhancedRealtimeManager.setAuthenticationStatus(true, 'demo-user-id');

    // Subscribe to project updates with selective configuration
    const unsubscribe = enhancedRealtimeManager.subscribe(
        'demo-projects',
        {
            table: 'projects',
            event: 'UPDATE',
            filter: 'organization_id=eq.demo-org',
            priority: 'high',
            retryConfig: {
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2
            }
        },
        (payload) => {
            console.log('📡 Real-time update received:', {
                event: payload.eventType,
                table: payload.table,
                projectId: payload.new?.id,
                timestamp: payload.timestamp
            });
        }
    );

    // Perform optimistic update
    const performOptimisticDemo = async () => {
        const result = await enhancedRealtimeManager.performOptimisticUpdate(
            'demo-update-1',
            'update',
            { id: 'project-123', title: 'Updated Project Title', status: 'completed' },
            { id: 'project-123', title: 'Original Project Title', status: 'active' },
            async () => {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { id: 'project-123', title: 'Confirmed Project Title', status: 'completed' };
            }
        );

        console.log('✅ Optimistic update result:', result);
    };

    // Get comprehensive status
    const status = enhancedRealtimeManager.getStatus();
    console.log('📊 Real-time manager status:', status);

    return { unsubscribe, performOptimisticDemo };
}

// Example 2: Using the Optimized Query Service
export async function demonstrateOptimizedQueries() {
    console.log('🚀 Optimized Query Service Demo');

    // Query with minimal fields for list view
    const listResult = await optimizedQueryService.getProjects(
        {
            status: ['active', 'in_progress'],
            priority: 'high',
            limit: 10
        },
        {
            fields: 'MINIMAL',
            useCache: true,
            organizationId: 'demo-org',
            metrics: true
        }
    );

    console.log('📋 List query result:', {
        count: listResult.data.length,
        fromCache: listResult.fromCache,
        queryTime: listResult.metrics?.duration
    });

    // Query with extended fields for detail view
    const detailResult = await optimizedQueryService.getProjectById(
        'project-123',
        {
            fields: 'EXTENDED',
            useCache: true,
            organizationId: 'demo-org'
        }
    );

    console.log('📄 Detail query result:', {
        project: detailResult?.title,
        hasCustomer: !!detailResult?.customer,
        hasStage: !!detailResult?.current_stage
    });

    // Get performance statistics
    const stats = optimizedQueryService.getPerformanceStats();
    console.log('📈 Query performance stats:', stats);

    return { listResult, detailResult, stats };
}

// Example 3: Using the Cache Invalidation Service
export function demonstrateCacheInvalidation() {
    console.log('🧹 Cache Invalidation Service Demo');

    // Add a custom invalidation rule
    cacheInvalidationService.addRule({
        id: 'demo-priority-change',
        trigger: {
            table: 'projects',
            operation: 'UPDATE',
            conditions: [
                { field: 'priority_level', operator: 'neq', value: 'old.priority_level' }
            ]
        },
        targets: [
            { type: 'query_cache', pattern: '*priority*' },
            { type: 'specific_project' }
        ],
        strategy: 'immediate',
        priority: 'high'
    });

    // Simulate a data change
    cacheInvalidationService.processDataChange({
        table: 'projects',
        operation: 'UPDATE',
        recordId: 'project-123',
        oldData: { priority_level: 'medium', status: 'active' },
        newData: { priority_level: 'high', status: 'active' }
    });

    // Get invalidation statistics
    const stats = cacheInvalidationService.getInvalidationStats();
    console.log('📊 Invalidation stats:', stats);

    // Get invalidation history
    const history = cacheInvalidationService.getInvalidationHistory();
    console.log('📜 Recent invalidations:', history.slice(0, 3));

    return { stats, history };
}

// Example 4: Using the Enhanced Projects Hook
export function demonstrateEnhancedHook() {
    console.log('🎣 Enhanced Projects Hook Demo');

    // This would be used in a React component
    const hookExample = () => {
        const {
            projects,
            loading,
            error,
            realtimeStatus,
            metrics,
            refresh,
            updateProject,
            createProject,
            deleteProject,
            getPerformanceStats
        } = useEnhancedProjects(
            {
                status: ['active', 'in_progress'],
                orderBy: 'created_at',
                limit: 20
            },
            {
                fields: 'BASIC',
                enableRealtime: true,
                realtimeConfig: {
                    priority: 'high',
                    selectiveUpdates: true
                },
                enableMetrics: true,
                preloadData: true
            }
        );

        return {
            projects,
            loading,
            error,
            realtimeStatus,
            metrics,
            actions: {
                refresh,
                updateProject,
                createProject,
                deleteProject
            },
            getPerformanceStats
        };
    };

    console.log('🎯 Hook configuration example created');
    return hookExample;
}

// Example 5: Complete Integration Demo
export async function demonstrateCompleteIntegration() {
    console.log('🌟 Complete Integration Demo');

    // 1. Initialize real-time manager
    const { unsubscribe, performOptimisticDemo } = demonstrateRealtimeManager();

    // 2. Perform optimized queries
    const queryResults = await demonstrateOptimizedQueries();

    // 3. Set up cache invalidation
    const invalidationResults = demonstrateCacheInvalidation();

    // 4. Show hook usage
    const hookExample = demonstrateEnhancedHook();

    // 5. Demonstrate optimistic update
    await performOptimisticDemo();

    // 6. Show comprehensive status
    const realtimeStatus = enhancedRealtimeManager.getStatus();
    const queryStats = optimizedQueryService.getPerformanceStats();
    const invalidationStats = cacheInvalidationService.getInvalidationStats();

    console.log('🎯 Integration Summary:', {
        realtime: {
            connected: realtimeStatus.isAuthenticated,
            subscriptions: realtimeStatus.subscriptions.length,
            optimisticUpdates: realtimeStatus.optimisticUpdates
        },
        queries: {
            totalQueries: queryStats.totalQueries,
            cacheHitRate: queryStats.cacheHitRate,
            averageTime: queryStats.averageQueryTime
        },
        invalidation: {
            totalEvents: invalidationStats.totalEvents,
            rulesActive: cacheInvalidationService.getRules().length
        }
    });

    // Cleanup
    unsubscribe();

    return {
        realtimeStatus,
        queryResults,
        invalidationResults,
        hookExample,
        queryStats,
        invalidationStats
    };
}

// Field presets demonstration
export function demonstrateFieldPresets() {
    console.log('📋 Field Presets Demo');

    console.log('Available field presets:');
    Object.keys(FIELD_PRESETS).forEach(preset => {
        console.log(`- ${preset}: Optimized for ${getPresetDescription(preset)}`);
    });

    return FIELD_PRESETS;
}

function getPresetDescription(preset: string): string {
    switch (preset) {
        case 'MINIMAL':
            return 'list views and cards with minimal data transfer';
        case 'BASIC':
            return 'table views with essential project information';
        case 'EXTENDED':
            return 'detail views with comprehensive project data';
        case 'FULL':
            return 'complete operations with all related data';
        default:
            return 'specific use cases';
    }
}

// Performance monitoring demonstration
export function demonstratePerformanceMonitoring() {
    console.log('📊 Performance Monitoring Demo');

    // Get current metrics
    const queryMetrics = optimizedQueryService.getMetrics();
    const performanceStats = optimizedQueryService.getPerformanceStats();

    console.log('Query Metrics:', queryMetrics.slice(0, 5)); // Show first 5
    console.log('Performance Stats:', performanceStats);

    // Show cache status
    const realtimeStatus = enhancedRealtimeManager.getStatus();
    console.log('Cache Status:', realtimeStatus.cacheStatus);

    return {
        queryMetrics,
        performanceStats,
        cacheStatus: realtimeStatus.cacheStatus
    };
}

// Export all demo functions
export const enhancedRealtimeDemo = {
    realtimeManager: demonstrateRealtimeManager,
    optimizedQueries: demonstrateOptimizedQueries,
    cacheInvalidation: demonstrateCacheInvalidation,
    enhancedHook: demonstrateEnhancedHook,
    completeIntegration: demonstrateCompleteIntegration,
    fieldPresets: demonstrateFieldPresets,
    performanceMonitoring: demonstratePerformanceMonitoring
};

// Usage example:
// import { enhancedRealtimeDemo } from '@/demo/enhanced-realtime-demo';
// 
// // Run complete demo
// enhancedRealtimeDemo.completeIntegration();
// 
// // Or run individual demos
// enhancedRealtimeDemo.realtimeManager();
// enhancedRealtimeDemo.optimizedQueries();
// enhancedRealtimeDemo.cacheInvalidation();