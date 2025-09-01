import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { cacheService } from '@/services/cacheService';

// Singleton pattern for real-time subscription management
class RealtimeManager {
    private static instance: RealtimeManager;
    private globalChannel: any = null;
    private subscribers: Set<(projects: Project[]) => void> = new Set();
    private isActive: boolean = false;
    private updateTimeout: NodeJS.Timeout | null = null;
    private pendingUpdates = new Map<string, any>();
    private isAuthenticated: boolean = false;

    private constructor() { }

    public static getInstance(): RealtimeManager {
        if (!RealtimeManager.instance) {
            RealtimeManager.instance = new RealtimeManager();
        }
        return RealtimeManager.instance;
    }

    public setAuthenticationStatus(authenticated: boolean) {
        console.log('🔔 RealtimeManager: Setting authentication status:', authenticated);
        this.isAuthenticated = authenticated;

        if (!authenticated) {
            // Clean up subscriptions when user logs out
            console.log('🔔 RealtimeManager: User logged out, cleaning up subscriptions');
            this.cleanup();
        } else if (this.subscribers.size > 0 && !this.isActive) {
            // Set up subscriptions when user logs in and there are subscribers
            console.log('🔔 RealtimeManager: User logged in with subscribers, setting up subscription');
            this.setupGlobalSubscription();
        } else {
            console.log('🔔 RealtimeManager: Authentication status set, but no action needed:', {
                authenticated,
                subscriberCount: this.subscribers.size,
                isActive: this.isActive
            });
        }
    }

    public subscribe(callback: (projects: Project[]) => void): () => void {
        console.log('🔔 RealtimeManager: Adding subscriber, current count:', this.subscribers.size);
        this.subscribers.add(callback);

        // Only set up subscription if user is authenticated and this is the first subscriber
        if (this.subscribers.size === 1 && !this.isActive && this.isAuthenticated) {
            console.log('🔔 RealtimeManager: First subscriber added, setting up global subscription');
            this.setupGlobalSubscription();
        } else {
            console.log('🔔 RealtimeManager: Subscriber added, but not setting up subscription:', {
                subscriberCount: this.subscribers.size,
                isActive: this.isActive,
                isAuthenticated: this.isAuthenticated
            });
        }

        // Return unsubscribe function
        return () => {
            console.log('🔔 RealtimeManager: Removing subscriber, remaining count:', this.subscribers.size - 1);
            this.subscribers.delete(callback);

            // If no more subscribers, clean up the subscription
            if (this.subscribers.size === 0) {
                console.log('🔔 RealtimeManager: No more subscribers, cleaning up');
                this.cleanup();
            }
        };
    }

    private setupGlobalSubscription() {
        if (this.isActive || !this.isAuthenticated) {
            console.log('🔔 RealtimeManager: Subscription already active or user not authenticated, skipping setup');
            return;
        }

        console.log('🔔 RealtimeManager: Setting up global real-time subscription');

        this.globalChannel = supabase
            .channel('global-project-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'projects'
                },
                (payload) => {
                    // Validate payload structure
                    if (!payload.new?.id) {
                        console.warn('🔔 RealtimeManager: Invalid payload received:', payload);
                        return;
                    }

                    console.log('🔔 RealtimeManager: Update received:', {
                        projectId: payload.new.id,
                        oldStatus: payload.old?.status,
                        newStatus: payload.new.status,
                        oldStage: payload.old?.current_stage_id,
                        newStage: payload.new.current_stage_id
                    });

                    // Store the update in pending updates
                    this.pendingUpdates.set(payload.new.id, payload);

                    // Clear existing timeout
                    if (this.updateTimeout) {
                        clearTimeout(this.updateTimeout);
                    }

                    // Debounce updates to prevent flickering - optimized delay
                    this.updateTimeout = setTimeout(() => {
                        this.processPendingUpdates();
                    }, 100); // Optimized debounce delay for better responsiveness
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'projects'
                },
                (payload) => {
                    console.log('🔔 RealtimeManager: New project created:', payload.new);
                    this.notifySubscribers('INSERT', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'projects'
                },
                (payload) => {
                    console.log('🔔 RealtimeManager: Project deleted:', payload.old);
                    this.notifySubscribers('DELETE', payload.old);
                }
            )
            .subscribe((status) => {
                console.log('🔔 RealtimeManager: Global subscription status changed:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ RealtimeManager: Global subscription established');
                    this.isActive = true;
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ RealtimeManager: Subscription error:', status);
                    this.isActive = false;

                    // Clean up the failed channel
                    if (this.globalChannel) {
                        supabase.removeChannel(this.globalChannel);
                        this.globalChannel = null;
                    }

                    // Retry subscription after a delay if user is still authenticated
                    if (this.isAuthenticated) {
                        setTimeout(() => {
                            if (this.isAuthenticated && this.subscribers.size > 0) {
                                console.log('🔄 RealtimeManager: Retrying subscription...');
                                this.setupGlobalSubscription();
                            }
                        }, 5000); // Retry after 5 seconds
                    }
                } else if (status === 'CLOSED') {
                    console.log('🔔 RealtimeManager: Subscription closed');
                    this.isActive = false;
                } else {
                    console.log('🔔 RealtimeManager: Global subscription status:', status);
                }
            });
    }

    private processPendingUpdates() {
        if (this.pendingUpdates.size === 0) return;

        console.log('🔔 RealtimeManager: Processing debounced updates:', Array.from(this.pendingUpdates.keys()));

        // Notify all subscribers about the pending updates
        this.subscribers.forEach(callback => {
            // The callback will receive the current projects list and can apply updates as needed
            // This prevents the manager from needing to know about the current state
            callback([]); // Empty array as placeholder - actual data will be fetched by the hook
        });

        // Clear pending updates
        this.pendingUpdates.clear();
    }

    private notifySubscribers(event: 'INSERT' | 'DELETE', data: any) {
        this.subscribers.forEach(callback => {
            callback([]); // Empty array as placeholder - actual data will be fetched by the hook
        });
    }

    private cleanup() {
        if (this.globalChannel) {
            // Reduce logging frequency to prevent spam
            if (Math.random() < 0.1) { // Only log 10% of the time
                console.log('🔔 RealtimeManager: Cleaning up global subscription');
            }
            supabase.removeChannel(this.globalChannel);
            this.globalChannel = null;
            this.isActive = false;
        }

        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }

        this.pendingUpdates.clear();
    }

    public getStatus() {
        return {
            isActive: this.isActive,
            subscriberCount: this.subscribers.size,
            hasGlobalChannel: !!this.globalChannel
        };
    }
}

export const realtimeManager = RealtimeManager.getInstance();
