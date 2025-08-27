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

    private constructor() { }

    public static getInstance(): RealtimeManager {
        if (!RealtimeManager.instance) {
            RealtimeManager.instance = new RealtimeManager();
        }
        return RealtimeManager.instance;
    }

    public subscribe(callback: (projects: Project[]) => void): () => void {
        this.subscribers.add(callback);

        // If this is the first subscriber, set up the subscription
        if (this.subscribers.size === 1 && !this.isActive) {
            this.setupGlobalSubscription();
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);

            // If no more subscribers, clean up the subscription
            if (this.subscribers.size === 0) {
                this.cleanup();
            }
        };
    }

    private setupGlobalSubscription() {
        if (this.isActive) {
            console.log('🔔 RealtimeManager: Subscription already active, skipping setup');
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
                    console.log('🔔 RealtimeManager: Update received:', {
                        projectId: payload.new.id,
                        oldStatus: payload.old?.status,
                        newStatus: payload.new.status
                    });

                    // Store the update in pending updates
                    this.pendingUpdates.set(payload.new.id, payload);

                    // Clear existing timeout
                    if (this.updateTimeout) {
                        clearTimeout(this.updateTimeout);
                    }

                    // Debounce updates to prevent flickering
                    this.updateTimeout = setTimeout(() => {
                        this.processPendingUpdates();
                    }, 150); // Increased debounce delay for better stability
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
                if (status === 'SUBSCRIBED') {
                    console.log('✅ RealtimeManager: Global subscription established');
                    this.isActive = true;
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ RealtimeManager: Subscription error:', status);
                    this.isActive = false;
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
