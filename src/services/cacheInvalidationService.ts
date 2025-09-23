import { cacheService } from './cacheService';
import { optimizedQueryService } from './optimizedQueryService';

// Cache invalidation strategies
type InvalidationStrategy =
    | 'immediate'     // Invalidate immediately
    | 'lazy'          // Invalidate on next access
    | 'scheduled'     // Invalidate after a delay
    | 'conditional';  // Invalidate based on conditions

// Cache invalidation rule
interface InvalidationRule {
    id: string;
    trigger: {
        table: string;
        operation: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
        conditions?: Array<{
            field: string;
            operator: 'eq' | 'neq' | 'in' | 'contains';
            value: any;
        }>;
    };
    targets: Array<{
        type: 'main_cache' | 'query_cache' | 'specific_project' | 'all';
        pattern?: string;
        projectId?: string;
    }>;
    strategy: InvalidationStrategy;
    delay?: number; // For scheduled strategy
    priority: 'high' | 'medium' | 'low';
}

// Invalidation event
interface InvalidationEvent {
    id: string;
    timestamp: Date;
    trigger: {
        table: string;
        operation: string;
        recordId?: string;
        changes?: Record<string, any>;
    };
    appliedRules: string[];
    invalidatedCaches: string[];
    strategy: InvalidationStrategy;
}

/**
 * Intelligent cache invalidation service that automatically manages
 * cache consistency based on data changes
 */
class CacheInvalidationService {
    private rules = new Map<string, InvalidationRule>();
    private scheduledInvalidations = new Map<string, NodeJS.Timeout>();
    private invalidationHistory: InvalidationEvent[] = [];
    private readonly MAX_HISTORY = 100;

    constructor() {
        this.setupDefaultRules();
    }

    /**
     * Set up default invalidation rules for common scenarios
     */
    private setupDefaultRules(): void {
        // Project updates should invalidate related caches immediately
        this.addRule({
            id: 'project-update-immediate',
            trigger: {
                table: 'projects',
                operation: 'UPDATE'
            },
            targets: [
                { type: 'specific_project' },
                { type: 'query_cache', pattern: 'projects*' }
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // Project creation should invalidate list caches
        this.addRule({
            id: 'project-create-lists',
            trigger: {
                table: 'projects',
                operation: 'INSERT'
            },
            targets: [
                { type: 'query_cache', pattern: 'projects*' },
                { type: 'main_cache' }
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // Project deletion should invalidate all related caches
        this.addRule({
            id: 'project-delete-all',
            trigger: {
                table: 'projects',
                operation: 'DELETE'
            },
            targets: [
                { type: 'all' }
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // Stage changes should invalidate stage-related queries
        this.addRule({
            id: 'stage-change-conditional',
            trigger: {
                table: 'projects',
                operation: 'UPDATE',
                conditions: [
                    { field: 'current_stage_id', operator: 'neq', value: 'old.current_stage_id' }
                ]
            },
            targets: [
                { type: 'query_cache', pattern: '*stage*' },
                { type: 'specific_project' }
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // Status changes should invalidate status-related queries
        this.addRule({
            id: 'status-change-conditional',
            trigger: {
                table: 'projects',
                operation: 'UPDATE',
                conditions: [
                    { field: 'status', operator: 'neq', value: 'old.status' }
                ]
            },
            targets: [
                { type: 'query_cache', pattern: '*status*' },
                { type: 'specific_project' }
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // Customer changes should invalidate customer-related queries with delay
        this.addRule({
            id: 'customer-change-scheduled',
            trigger: {
                table: 'contacts',
                operation: 'UPDATE'
            },
            targets: [
                { type: 'query_cache', pattern: '*customer*' },
                { type: 'main_cache' }
            ],
            strategy: 'scheduled',
            delay: 2000, // 2 second delay to batch multiple customer updates
            priority: 'medium'
        });

        // Workflow stage changes should invalidate stage-related data
        this.addRule({
            id: 'workflow-stage-update',
            trigger: {
                table: 'workflow_stages',
                operation: '*'
            },
            targets: [
                { type: 'all' } // Workflow changes affect everything
            ],
            strategy: 'immediate',
            priority: 'high'
        });

        // User changes should invalidate assignment-related queries
        this.addRule({
            id: 'user-assignment-lazy',
            trigger: {
                table: 'users',
                operation: 'UPDATE'
            },
            targets: [
                { type: 'query_cache', pattern: '*assigned*' }
            ],
            strategy: 'lazy',
            priority: 'low'
        });
    }

    /**
     * Add a new invalidation rule
     */
    addRule(rule: InvalidationRule): void {
        this.rules.set(rule.id, rule);
        console.log(`📋 Cache invalidation rule added: ${rule.id}`);
    }

    /**
     * Remove an invalidation rule
     */
    removeRule(ruleId: string): void {
        this.rules.delete(ruleId);

        // Cancel any scheduled invalidations for this rule
        const scheduledKey = `rule-${ruleId}`;
        const timeout = this.scheduledInvalidations.get(scheduledKey);
        if (timeout) {
            clearTimeout(timeout);
            this.scheduledInvalidations.delete(scheduledKey);
        }

        console.log(`🗑️ Cache invalidation rule removed: ${ruleId}`);
    }

    /**
     * Process a data change event and apply invalidation rules
     */
    processDataChange(event: {
        table: string;
        operation: 'INSERT' | 'UPDATE' | 'DELETE';
        recordId?: string;
        oldData?: Record<string, any>;
        newData?: Record<string, any>;
    }): void {
        const matchingRules = this.findMatchingRules(event);

        if (matchingRules.length === 0) {
            return;
        }

        const invalidationEvent: InvalidationEvent = {
            id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            trigger: {
                table: event.table,
                operation: event.operation,
                recordId: event.recordId,
                changes: this.calculateChanges(event.oldData, event.newData)
            },
            appliedRules: matchingRules.map(r => r.id),
            invalidatedCaches: [],
            strategy: 'immediate' // Will be updated based on actual strategy used
        };

        // Group rules by strategy for efficient processing
        const rulesByStrategy = this.groupRulesByStrategy(matchingRules);

        // Process each strategy
        for (const [strategy, rules] of rulesByStrategy.entries()) {
            invalidationEvent.strategy = strategy;

            switch (strategy) {
                case 'immediate':
                    this.processImmediateInvalidation(rules, invalidationEvent);
                    break;
                case 'lazy':
                    this.processLazyInvalidation(rules, invalidationEvent);
                    break;
                case 'scheduled':
                    this.processScheduledInvalidation(rules, invalidationEvent);
                    break;
                case 'conditional':
                    this.processConditionalInvalidation(rules, invalidationEvent, event);
                    break;
            }
        }

        // Store invalidation event in history
        this.addToHistory(invalidationEvent);

        console.log(`🔄 Cache invalidation processed:`, {
            event: invalidationEvent.trigger,
            rulesApplied: invalidationEvent.appliedRules.length,
            cachesInvalidated: invalidationEvent.invalidatedCaches.length,
            strategy: invalidationEvent.strategy
        });
    }

    /**
     * Find rules that match the given data change event
     */
    private findMatchingRules(event: {
        table: string;
        operation: 'INSERT' | 'UPDATE' | 'DELETE';
        oldData?: Record<string, any>;
        newData?: Record<string, any>;
    }): InvalidationRule[] {
        const matchingRules: InvalidationRule[] = [];

        for (const rule of this.rules.values()) {
            // Check table match
            if (rule.trigger.table !== event.table) {
                continue;
            }

            // Check operation match
            if (rule.trigger.operation !== '*' && rule.trigger.operation !== event.operation) {
                continue;
            }

            // Check conditions if specified
            if (rule.trigger.conditions) {
                const conditionsMet = this.evaluateConditions(
                    rule.trigger.conditions,
                    event.oldData,
                    event.newData
                );

                if (!conditionsMet) {
                    continue;
                }
            }

            matchingRules.push(rule);
        }

        // Sort by priority (high first)
        return matchingRules.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Evaluate rule conditions against the data change
     */
    private evaluateConditions(
        conditions: Array<{
            field: string;
            operator: 'eq' | 'neq' | 'in' | 'contains';
            value: any;
        }>,
        oldData?: Record<string, any>,
        newData?: Record<string, any>
    ): boolean {
        return conditions.every(condition => {
            const oldValue = oldData?.[condition.field];
            const newValue = newData?.[condition.field];

            switch (condition.operator) {
                case 'eq':
                    return newValue === condition.value;
                case 'neq':
                    return oldValue !== newValue; // Field changed
                case 'in':
                    return Array.isArray(condition.value) && condition.value.includes(newValue);
                case 'contains':
                    return Array.isArray(newValue) && newValue.includes(condition.value);
                default:
                    return false;
            }
        });
    }

    /**
     * Calculate what fields changed between old and new data
     */
    private calculateChanges(
        oldData?: Record<string, any>,
        newData?: Record<string, any>
    ): Record<string, any> {
        if (!oldData || !newData) {
            return {};
        }

        const changes: Record<string, any> = {};

        for (const key in newData) {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    from: oldData[key],
                    to: newData[key]
                };
            }
        }

        return changes;
    }

    /**
     * Group rules by their invalidation strategy
     */
    private groupRulesByStrategy(rules: InvalidationRule[]): Map<InvalidationStrategy, InvalidationRule[]> {
        const grouped = new Map<InvalidationStrategy, InvalidationRule[]>();

        for (const rule of rules) {
            if (!grouped.has(rule.strategy)) {
                grouped.set(rule.strategy, []);
            }
            grouped.get(rule.strategy)!.push(rule);
        }

        return grouped;
    }

    /**
     * Process immediate invalidation
     */
    private processImmediateInvalidation(
        rules: InvalidationRule[],
        event: InvalidationEvent
    ): void {
        for (const rule of rules) {
            for (const target of rule.targets) {
                const invalidatedCaches = this.invalidateTarget(target, event.trigger.recordId);
                event.invalidatedCaches.push(...invalidatedCaches);
            }
        }
    }

    /**
     * Process lazy invalidation (mark for invalidation on next access)
     */
    private processLazyInvalidation(
        rules: InvalidationRule[],
        event: InvalidationEvent
    ): void {
        for (const rule of rules) {
            for (const target of rule.targets) {
                // Mark caches as stale instead of immediately invalidating
                this.markCacheAsStale(target, event.trigger.recordId);
                event.invalidatedCaches.push(`lazy:${target.type}:${target.pattern || 'all'}`);
            }
        }
    }

    /**
     * Process scheduled invalidation (invalidate after a delay)
     */
    private processScheduledInvalidation(
        rules: InvalidationRule[],
        event: InvalidationEvent
    ): void {
        for (const rule of rules) {
            const delay = rule.delay || 5000; // Default 5 seconds
            const scheduledKey = `rule-${rule.id}-${event.trigger.recordId || 'all'}`;

            // Cancel existing scheduled invalidation for this rule
            const existingTimeout = this.scheduledInvalidations.get(scheduledKey);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            // Schedule new invalidation
            const timeout = setTimeout(() => {
                for (const target of rule.targets) {
                    const invalidatedCaches = this.invalidateTarget(target, event.trigger.recordId);
                    console.log(`⏰ Scheduled invalidation executed for rule ${rule.id}:`, invalidatedCaches);
                }
                this.scheduledInvalidations.delete(scheduledKey);
            }, delay);

            this.scheduledInvalidations.set(scheduledKey, timeout);
            event.invalidatedCaches.push(`scheduled:${scheduledKey}:${delay}ms`);
        }
    }

    /**
     * Process conditional invalidation
     */
    private processConditionalInvalidation(
        rules: InvalidationRule[],
        event: InvalidationEvent,
        dataEvent: any
    ): void {
        // For now, treat conditional as immediate
        // In the future, this could include more complex logic
        this.processImmediateInvalidation(rules, event);
    }

    /**
     * Invalidate a specific cache target
     */
    private invalidateTarget(
        target: {
            type: 'main_cache' | 'query_cache' | 'specific_project' | 'all';
            pattern?: string;
            projectId?: string;
        },
        recordId?: string
    ): string[] {
        const invalidated: string[] = [];

        switch (target.type) {
            case 'main_cache':
                cacheService.clearCache();
                invalidated.push('main_cache');
                break;

            case 'query_cache':
                if (target.pattern) {
                    // Clear query caches matching pattern
                    this.clearQueryCacheByPattern(target.pattern);
                    invalidated.push(`query_cache:${target.pattern}`);
                } else {
                    optimizedQueryService.clearCache();
                    invalidated.push('query_cache:all');
                }
                break;

            case 'specific_project':
                const projectId = target.projectId || recordId;
                if (projectId) {
                    // Clear specific project from cache
                    cacheService.removeProject(projectId);
                    invalidated.push(`project:${projectId}`);
                }
                break;

            case 'all':
                cacheService.clearCache();
                optimizedQueryService.clearCache();
                invalidated.push('all_caches');
                break;
        }

        return invalidated;
    }

    /**
     * Clear query cache entries matching a pattern
     */
    private clearQueryCacheByPattern(pattern: string): void {
        try {
            const keys = Object.keys(localStorage);
            const queryKeys = keys.filter(key => {
                if (!key.startsWith('query_')) return false;

                // Simple pattern matching (supports * wildcard)
                const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
                return regex.test(key);
            });

            queryKeys.forEach(key => {
                localStorage.removeItem(key);
                // Also remove timestamp key
                localStorage.removeItem(`${key}_timestamp`);
            });

            console.log(`🧹 Cleared ${queryKeys.length} query cache entries matching pattern: ${pattern}`);
        } catch (error) {
            console.warn('Error clearing query cache by pattern:', error);
        }
    }

    /**
     * Mark cache as stale for lazy invalidation
     */
    private markCacheAsStale(
        target: {
            type: 'main_cache' | 'query_cache' | 'specific_project' | 'all';
            pattern?: string;
            projectId?: string;
        },
        recordId?: string
    ): void {
        // For now, we'll use a simple approach of setting a stale flag
        // In a more sophisticated implementation, this could track staleness per cache entry
        const staleKey = `stale_${target.type}_${target.pattern || target.projectId || recordId || 'all'}`;
        localStorage.setItem(staleKey, Date.now().toString());
    }

    /**
     * Check if a cache is marked as stale
     */
    isCacheStale(cacheKey: string): boolean {
        const staleKey = `stale_${cacheKey}`;
        return localStorage.getItem(staleKey) !== null;
    }

    /**
     * Clear stale markers for a cache
     */
    clearStaleMarker(cacheKey: string): void {
        const staleKey = `stale_${cacheKey}`;
        localStorage.removeItem(staleKey);
    }

    /**
     * Add invalidation event to history
     */
    private addToHistory(event: InvalidationEvent): void {
        this.invalidationHistory.unshift(event);

        // Keep only the most recent events
        if (this.invalidationHistory.length > this.MAX_HISTORY) {
            this.invalidationHistory = this.invalidationHistory.slice(0, this.MAX_HISTORY);
        }
    }

    /**
     * Get invalidation history
     */
    getInvalidationHistory(): InvalidationEvent[] {
        return [...this.invalidationHistory];
    }

    /**
     * Get invalidation statistics
     */
    getInvalidationStats(): {
        totalEvents: number;
        eventsByStrategy: Record<InvalidationStrategy, number>;
        eventsByTable: Record<string, number>;
        averageInvalidationsPerEvent: number;
        recentEvents: InvalidationEvent[];
    } {
        const totalEvents = this.invalidationHistory.length;
        const eventsByStrategy: Record<InvalidationStrategy, number> = {
            immediate: 0,
            lazy: 0,
            scheduled: 0,
            conditional: 0
        };
        const eventsByTable: Record<string, number> = {};
        let totalInvalidations = 0;

        for (const event of this.invalidationHistory) {
            eventsByStrategy[event.strategy]++;
            eventsByTable[event.trigger.table] = (eventsByTable[event.trigger.table] || 0) + 1;
            totalInvalidations += event.invalidatedCaches.length;
        }

        return {
            totalEvents,
            eventsByStrategy,
            eventsByTable,
            averageInvalidationsPerEvent: totalEvents > 0 ? totalInvalidations / totalEvents : 0,
            recentEvents: this.invalidationHistory.slice(0, 10)
        };
    }

    /**
     * Clear all scheduled invalidations
     */
    clearScheduledInvalidations(): void {
        for (const timeout of this.scheduledInvalidations.values()) {
            clearTimeout(timeout);
        }
        this.scheduledInvalidations.clear();
        console.log('🧹 All scheduled invalidations cleared');
    }

    /**
     * Get current rules
     */
    getRules(): InvalidationRule[] {
        return Array.from(this.rules.values());
    }

    /**
     * Reset service to default state
     */
    reset(): void {
        this.clearScheduledInvalidations();
        this.rules.clear();
        this.invalidationHistory = [];
        this.setupDefaultRules();
        console.log('🔄 Cache invalidation service reset');
    }
}

// Export singleton instance
export const cacheInvalidationService = new CacheInvalidationService();