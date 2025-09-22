import { supabase } from '@/integrations/supabase/client.ts.js';
import { Project } from '@/types/project';
import { cacheService } from '@/services/cacheService';
import { RetryService } from '@/services/retryService';
import { cacheInvalidationService } from '@/services/cacheInvalidationService';
import { toast } from 'sonner';

// Enhanced subscription configuration
interface SubscriptionConfig {
    table: string;
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    selectFields?: string;
    priority: 'high' | 'medium' | 'low';
    retryConfig?: {
        maxAttempts: number;
        baseDelay: number;
        backoffFactor: number;
    };
}

// Real-time update payload with enhanced metadata
interface EnhancedRealtimePayload {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    old?: any;
    new?: any;
    timestamp: string;
    source: 'realtime' | 'optimistic';
    metadata?: {
        userId?: string;
        sessionId?: string;
        changeReason?: string;
    };
}

// Subscription status tracking
interface SubscriptionStatus {
    id: string;
    status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    lastConnected?: Date;
    lastError?: string;
    retryCount: number;
    config: SubscriptionConfig;
}

// Optimistic update tracking
interface OptimisticUpdate {
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: Date;
    rollbackData?: any;
    confirmed: boolean;
    timeout?: NodeJS.Timeout;
}

/**
 * Enhanced real-time manager with selective subscriptions, optimistic updates,
 * error handling, and automatic cache invalidation
 */
class EnhancedRealtimeManager {
    private static instance: EnhancedRealtimeManager;
    private subscriptions = new Map<string, any>();
    private subscriptionStatus = new Map<string, SubscriptionStatus>();
    private subscribers = new Map<string, Set<(payload: EnhancedRealtimePayload) => void>>();
    private optimisticUpdates = new Map<string, OptimisticUpdate>();
    private isAuthenticated = false;
    private connectionHealth = {
        isHealthy: true,
        lastHealthCheck: new Date(),
        consecutiveFailures: 0,
        maxFailures: 3
    };

    // Rate limiting for updates
    private updateQueue = new Map<string, NodeJS.Timeout>();
    private readonly DEBOUNCE_DELAY = 100;
    private readonly OPTIMISTIC_TIMEOUT = 5000;

    private constructor() {
        this.setupConnectionHealthMonitoring();
    }

    public static getInstance(): EnhancedRealtimeManager {
        if (!EnhancedRealtimeManager.instance) {
            EnhancedRealtimeManager.instance = new EnhancedRealtimeManager();
        }
        return EnhancedRealtimeManager.instance;
    }

    /**
     * Set authentication status and manage subscriptions accordingly
     */
    public setAuthenticationStatus(authenticated: boolean, userId?: string): void {
        this.isAuthenticated = authenticated;

        if (!authenticated) {
            this.cleanup();
            this.clearOptimisticUpdates();
        } else if (this.subscribers.size > 0) {
            // Reconnect existing subscriptions
            this.reconnectAllSubscriptions();
        }
    }

    /**
     * Subscribe to selective real-time updates with enhanced configuration
     */
    public subscribe(
        subscriptionId: string,
        config: SubscriptionConfig,
        callback: (payload: EnhancedRealtimePayload) => void
    ): () => void {
        // Add callback to subscribers
        if (!this.subscribers.has(subscriptionId)) {
            this.subscribers.set(subscriptionId, new Set());
        }
        this.subscribers.get(subscriptionId)!.add(callback);

        // Set up subscription if authenticated and not already exists
        if (this.isAuthenticated && !this.subscriptions.has(subscriptionId)) {
            this.setupSubscription(subscriptionId, config);
        }

        // Return unsubscribe function
        return () => {
            const subscriberSet = this.subscribers.get(subscriptionId);
            if (subscriberSet) {
                subscriberSet.delete(callback);

                // Clean up subscription if no more subscribers
                if (subscriberSet.size === 0) {
                    this.subscribers.delete(subscriptionId);
                    this.removeSubscription(subscriptionId);
                }
            }
        };
    }

    /**
     * Set up individual subscription with retry logic
     */
    private async setupSubscription(subscriptionId: string, config: SubscriptionConfig): Promise<void> {
        if (!this.isAuthenticated) {
            console.warn('Cannot setup subscription: not authenticated');
            return;
        }

        // Update status to connecting
        this.updateSubscriptionStatus(subscriptionId, 'connecting', config);

        try {
            const channel = supabase.channel(`enhanced-${subscriptionId}`);

            // Configure the subscription based on config
            let subscription = channel.on(
                'postgres_changes',
                {
                    event: config.event,
                    schema: 'public',
                    table: config.table,
                    ...(config.filter && { filter: config.filter })
                },
                (payload) => this.handleRealtimeUpdate(subscriptionId, payload, config)
            );

            // Subscribe with status tracking
            subscription.subscribe((status) => {
                this.handleSubscriptionStatusChange(subscriptionId, status, config);
            });

            this.subscriptions.set(subscriptionId, channel);
            console.log(`✅ Enhanced subscription setup: ${subscriptionId}`);

        } catch (error) {
            console.error(`❌ Failed to setup subscription ${subscriptionId}:`, error);
            this.updateSubscriptionStatus(subscriptionId, 'error', config, error instanceof Error ? error.message : 'Unknown error');

            // Retry with exponential backoff
            this.scheduleSubscriptionRetry(subscriptionId, config);
        }
    }

    /**
     * Handle real-time updates with enhanced processing
     */
    private handleRealtimeUpdate(
        subscriptionId: string,
        payload: any,
        config: SubscriptionConfig
    ): void {
        try {
            // Validate payload
            if (!payload || !payload.eventType) {
                console.warn(`Invalid payload received for ${subscriptionId}:`, payload);
                return;
            }

            // Create enhanced payload
            const enhancedPayload: EnhancedRealtimePayload = {
                eventType: payload.eventType,
                table: config.table,
                old: payload.old,
                new: payload.new,
                timestamp: new Date().toISOString(),
                source: 'realtime',
                metadata: {
                    sessionId: this.generateSessionId()
                }
            };

            // Check for optimistic update confirmation
            this.checkOptimisticUpdateConfirmation(enhancedPayload);

            // Process cache invalidation based on the change
            cacheInvalidationService.processDataChange({
                table: config.table,
                operation: payload.eventType,
                recordId: payload.new?.id || payload.old?.id,
                oldData: payload.old,
                newData: payload.new
            });

            // Debounce updates to prevent excessive processing
            this.debounceUpdate(subscriptionId, () => {
                // Update cache based on the change
                this.updateCacheFromRealtime(enhancedPayload);

                // Notify subscribers
                const subscribers = this.subscribers.get(subscriptionId);
                if (subscribers) {
                    subscribers.forEach(callback => {
                        try {
                            callback(enhancedPayload);
                        } catch (error) {
                            console.error(`Error in subscriber callback for ${subscriptionId}:`, error);
                        }
                    });
                }
            });

            console.log(`🔔 Enhanced real-time update processed: ${subscriptionId}`, {
                event: enhancedPayload.eventType,
                table: enhancedPayload.table,
                id: enhancedPayload.new?.id || enhancedPayload.old?.id
            });

        } catch (error) {
            console.error(`Error processing real-time update for ${subscriptionId}:`, error);
            this.connectionHealth.consecutiveFailures++;
        }
    }

    /**
     * Handle subscription status changes with automatic recovery
     */
    private handleSubscriptionStatusChange(
        subscriptionId: string,
        status: string,
        config: SubscriptionConfig
    ): void {
        switch (status) {
            case 'SUBSCRIBED':
                this.updateSubscriptionStatus(subscriptionId, 'connected', config);
                this.connectionHealth.consecutiveFailures = 0;
                this.connectionHealth.isHealthy = true;
                console.log(`✅ Subscription connected: ${subscriptionId}`);
                break;

            case 'CHANNEL_ERROR':
            case 'TIMED_OUT':
                this.updateSubscriptionStatus(subscriptionId, 'error', config, `Status: ${status}`);
                this.connectionHealth.consecutiveFailures++;

                if (this.connectionHealth.consecutiveFailures >= this.connectionHealth.maxFailures) {
                    this.connectionHealth.isHealthy = false;
                }

                // Schedule retry
                this.scheduleSubscriptionRetry(subscriptionId, config);
                break;

            case 'CLOSED':
                this.updateSubscriptionStatus(subscriptionId, 'disconnected', config);
                console.log(`🔔 Subscription closed: ${subscriptionId}`);
                break;

            default:
                console.log(`🔔 Subscription status change: ${subscriptionId} -> ${status}`);
        }
    }

    /**
     * Schedule subscription retry with exponential backoff
     */
    private scheduleSubscriptionRetry(subscriptionId: string, config: SubscriptionConfig): void {
        const status = this.subscriptionStatus.get(subscriptionId);
        if (!status) return;

        const retryConfig = config.retryConfig || {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2
        };

        if (status.retryCount >= retryConfig.maxAttempts) {
            console.error(`Max retry attempts reached for subscription: ${subscriptionId}`);
            toast.error('Real-time connection failed', {
                description: `Unable to establish real-time updates for ${config.table}`
            });
            return;
        }

        const delay = Math.min(
            retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, status.retryCount),
            30000 // Max 30 seconds
        );

        this.updateSubscriptionStatus(subscriptionId, 'reconnecting', config);

        setTimeout(() => {
            if (this.isAuthenticated && this.subscribers.has(subscriptionId)) {
                console.log(`🔄 Retrying subscription: ${subscriptionId} (attempt ${status.retryCount + 1})`);
                status.retryCount++;
                this.setupSubscription(subscriptionId, config);
            }
        }, delay);
    }

    /**
     * Optimistic update with automatic rollback
     */
    public async performOptimisticUpdate<T>(
        updateId: string,
        operation: 'create' | 'update' | 'delete',
        data: T,
        rollbackData?: T,
        confirmationOperation?: () => Promise<T>
    ): Promise<{ success: boolean; data?: T; error?: Error }> {
        try {
            // Store optimistic update
            const optimisticUpdate: OptimisticUpdate = {
                id: updateId,
                operation,
                data,
                rollbackData,
                timestamp: new Date(),
                confirmed: false,
                timeout: setTimeout(() => {
                    this.rollbackOptimisticUpdate(updateId);
                }, this.OPTIMISTIC_TIMEOUT)
            };

            this.optimisticUpdates.set(updateId, optimisticUpdate);

            // Apply optimistic update to cache
            this.applyCacheUpdate(operation, data);

            // Create optimistic payload for immediate UI update
            const optimisticPayload: EnhancedRealtimePayload = {
                eventType: operation.toUpperCase() as any,
                table: 'projects', // Assuming projects for now
                new: data,
                old: rollbackData,
                timestamp: new Date().toISOString(),
                source: 'optimistic'
            };

            // Notify subscribers immediately
            this.notifyAllSubscribers(optimisticPayload);

            // Perform actual operation if provided
            if (confirmationOperation) {
                try {
                    const result = await confirmationOperation();
                    this.confirmOptimisticUpdate(updateId, result);
                    return { success: true, data: result };
                } catch (error) {
                    this.rollbackOptimisticUpdate(updateId);
                    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
                }
            }

            return { success: true, data };

        } catch (error) {
            this.rollbackOptimisticUpdate(updateId);
            return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
        }
    }

    /**
     * Confirm optimistic update
     */
    private confirmOptimisticUpdate(updateId: string, confirmedData: any): void {
        const update = this.optimisticUpdates.get(updateId);
        if (update) {
            update.confirmed = true;
            if (update.timeout) {
                clearTimeout(update.timeout);
            }

            // Update cache with confirmed data
            this.applyCacheUpdate(update.operation, confirmedData);

            console.log(`✅ Optimistic update confirmed: ${updateId}`);
            this.optimisticUpdates.delete(updateId);
        }
    }

    /**
     * Rollback optimistic update
     */
    private rollbackOptimisticUpdate(updateId: string): void {
        const update = this.optimisticUpdates.get(updateId);
        if (update && !update.confirmed) {
            if (update.timeout) {
                clearTimeout(update.timeout);
            }

            // Rollback cache changes
            if (update.rollbackData) {
                this.applyCacheUpdate('update', update.rollbackData);
            } else if (update.operation === 'create') {
                // Remove the optimistically created item
                this.applyCacheUpdate('delete', update.data);
            }

            // Create rollback payload
            const rollbackPayload: EnhancedRealtimePayload = {
                eventType: 'UPDATE',
                table: 'projects',
                new: update.rollbackData,
                old: update.data,
                timestamp: new Date().toISOString(),
                source: 'optimistic'
            };

            // Notify subscribers of rollback
            this.notifyAllSubscribers(rollbackPayload);

            console.warn(`⚠️ Optimistic update rolled back: ${updateId}`);
            toast.warning('Update failed', {
                description: 'Changes have been reverted due to a server error.'
            });

            this.optimisticUpdates.delete(updateId);
        }
    }

    /**
     * Check if real-time update confirms an optimistic update
     */
    private checkOptimisticUpdateConfirmation(payload: EnhancedRealtimePayload): void {
        // Look for matching optimistic updates
        for (const [updateId, update] of this.optimisticUpdates.entries()) {
            if (this.isMatchingUpdate(update, payload)) {
                this.confirmOptimisticUpdate(updateId, payload.new);
                break;
            }
        }
    }

    /**
     * Check if real-time payload matches an optimistic update
     */
    private isMatchingUpdate(update: OptimisticUpdate, payload: EnhancedRealtimePayload): boolean {
        // Simple matching based on ID and operation type
        const updateData = update.data as any;
        const payloadData = payload.new as any;

        return (
            updateData?.id === payloadData?.id &&
            update.operation.toUpperCase() === payload.eventType &&
            Math.abs(new Date(payload.timestamp).getTime() - update.timestamp.getTime()) < 10000 // Within 10 seconds
        );
    }

    /**
     * Apply cache updates based on operation type
     */
    private applyCacheUpdate(operation: string, data: any): void {
        try {
            switch (operation) {
                case 'create':
                    if (data.id) {
                        cacheService.addProject(data);
                    }
                    break;
                case 'update':
                    if (data.id) {
                        cacheService.updateProject(data.id, data);
                    }
                    break;
                case 'delete':
                    if (data.id) {
                        cacheService.removeProject(data.id);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error applying cache update:', error);
        }
    }

    /**
     * Update cache from real-time payload
     */
    private updateCacheFromRealtime(payload: EnhancedRealtimePayload): void {
        try {
            switch (payload.eventType) {
                case 'INSERT':
                    if (payload.new?.id) {
                        cacheService.addProject(payload.new);
                    }
                    break;
                case 'UPDATE':
                    if (payload.new?.id) {
                        cacheService.updateProject(payload.new.id, payload.new);
                    }
                    break;
                case 'DELETE':
                    if (payload.old?.id) {
                        cacheService.removeProject(payload.old.id);
                    }
                    break;
            }

            // Invalidate query caches that might be affected
            cacheService.clearQueryCache();

        } catch (error) {
            console.error('Error updating cache from real-time:', error);
        }
    }

    /**
     * Debounce updates to prevent excessive processing
     */
    private debounceUpdate(key: string, callback: () => void): void {
        // Clear existing timeout
        const existingTimeout = this.updateQueue.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            callback();
            this.updateQueue.delete(key);
        }, this.DEBOUNCE_DELAY);

        this.updateQueue.set(key, timeout);
    }

    /**
     * Notify all subscribers across all subscriptions
     */
    private notifyAllSubscribers(payload: EnhancedRealtimePayload): void {
        for (const [subscriptionId, subscribers] of this.subscribers.entries()) {
            subscribers.forEach(callback => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${subscriptionId}:`, error);
                }
            });
        }
    }

    /**
     * Update subscription status tracking
     */
    private updateSubscriptionStatus(
        subscriptionId: string,
        status: SubscriptionStatus['status'],
        config: SubscriptionConfig,
        error?: string
    ): void {
        const existingStatus = this.subscriptionStatus.get(subscriptionId);

        this.subscriptionStatus.set(subscriptionId, {
            id: subscriptionId,
            status,
            lastConnected: status === 'connected' ? new Date() : existingStatus?.lastConnected,
            lastError: error,
            retryCount: status === 'connected' ? 0 : (existingStatus?.retryCount || 0),
            config
        });
    }

    /**
     * Setup connection health monitoring
     */
    private setupConnectionHealthMonitoring(): void {
        setInterval(() => {
            this.connectionHealth.lastHealthCheck = new Date();

            // Check if we have too many consecutive failures
            if (this.connectionHealth.consecutiveFailures >= this.connectionHealth.maxFailures) {
                this.connectionHealth.isHealthy = false;

                // Attempt to reconnect all subscriptions
                if (this.isAuthenticated) {
                    console.log('🔄 Connection health check: attempting to reconnect all subscriptions');
                    this.reconnectAllSubscriptions();
                }
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Reconnect all active subscriptions
     */
    private reconnectAllSubscriptions(): void {
        for (const [subscriptionId, status] of this.subscriptionStatus.entries()) {
            if (this.subscribers.has(subscriptionId)) {
                this.removeSubscription(subscriptionId);
                this.setupSubscription(subscriptionId, status.config);
            }
        }
    }

    /**
     * Remove a specific subscription
     */
    private removeSubscription(subscriptionId: string): void {
        const channel = this.subscriptions.get(subscriptionId);
        if (channel) {
            supabase.removeChannel(channel);
            this.subscriptions.delete(subscriptionId);
            this.subscriptionStatus.delete(subscriptionId);
            console.log(`🗑️ Removed subscription: ${subscriptionId}`);
        }
    }

    /**
     * Clear all optimistic updates
     */
    private clearOptimisticUpdates(): void {
        for (const [updateId, update] of this.optimisticUpdates.entries()) {
            if (update.timeout) {
                clearTimeout(update.timeout);
            }
        }
        this.optimisticUpdates.clear();
    }

    /**
     * Cleanup all subscriptions and state
     */
    private cleanup(): void {
        // Clear all subscriptions
        for (const [subscriptionId] of this.subscriptions.entries()) {
            this.removeSubscription(subscriptionId);
        }

        // Clear update queue
        for (const timeout of this.updateQueue.values()) {
            clearTimeout(timeout);
        }
        this.updateQueue.clear();

        // Clear optimistic updates
        this.clearOptimisticUpdates();

        console.log('🧹 Enhanced real-time manager cleaned up');
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get comprehensive status information
     */
    public getStatus(): {
        isAuthenticated: boolean;
        connectionHealth: typeof this.connectionHealth;
        subscriptions: Array<{
            id: string;
            status: string;
            lastConnected?: Date;
            lastError?: string;
            retryCount: number;
            subscriberCount: number;
        }>;
        optimisticUpdates: number;
        cacheStatus: {
            isValid: boolean;
            projectCount: number;
            lastUpdated?: Date;
        };
    } {
        const subscriptionInfo = Array.from(this.subscriptionStatus.entries()).map(([id, status]) => ({
            id,
            status: status.status,
            lastConnected: status.lastConnected,
            lastError: status.lastError,
            retryCount: status.retryCount,
            subscriberCount: this.subscribers.get(id)?.size || 0
        }));

        return {
            isAuthenticated: this.isAuthenticated,
            connectionHealth: { ...this.connectionHealth },
            subscriptions: subscriptionInfo,
            optimisticUpdates: this.optimisticUpdates.size,
            cacheStatus: {
                isValid: cacheService.isCacheValid(),
                projectCount: cacheService.getProjects()?.length || 0,
                lastUpdated: cacheService.getLastUpdated()
            }
        };
    }

    /**
     * Force refresh all data and clear caches
     */
    public async forceRefresh(): Promise<void> {
        // Clear all caches
        cacheService.clearCache();
        cacheService.clearQueryCache();

        // Clear optimistic updates
        this.clearOptimisticUpdates();

        // Notify all subscribers to refresh
        const refreshPayload: EnhancedRealtimePayload = {
            eventType: 'UPDATE',
            table: 'refresh',
            timestamp: new Date().toISOString(),
            source: 'realtime'
        };

        this.notifyAllSubscribers(refreshPayload);

        console.log('🔄 Forced refresh completed');
        toast.info('Data refreshed', {
            description: 'All data has been refreshed from the server.'
        });
    }
}

// Export singleton instance
export const enhancedRealtimeManager = EnhancedRealtimeManager.getInstance();