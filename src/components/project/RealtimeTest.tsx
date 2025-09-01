import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { realtimeManager } from '@/lib/realtime-manager';
import { supabase } from '@/integrations/supabase/client';

export function RealtimeTest() {
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Not subscribed');
    const [updateCount, setUpdateCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState<string>('None');
    const [directTestCount, setDirectTestCount] = useState(0);
    const [directTestStatus, setDirectTestStatus] = useState<string>('Not tested');

    useEffect(() => {
        console.log('🔔 RealtimeTest: Component mounted, setting up test subscription');

        // Subscribe to real-time updates via realtimeManager
        const unsubscribe = realtimeManager.subscribe(() => {
            console.log('🔔 RealtimeTest: Received real-time update via realtimeManager');
            setUpdateCount(prev => prev + 1);
            setLastUpdate(new Date().toLocaleTimeString());
        });

        // Direct Supabase real-time test
        console.log('🔔 RealtimeTest: Setting up direct Supabase real-time test');
        const directChannel = supabase
            .channel('direct-test')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'projects'
                },
                (payload) => {
                    console.log('🔔 RealtimeTest: Direct Supabase real-time update received:', payload);
                    setDirectTestCount(prev => prev + 1);
                    setDirectTestStatus(`Last update: ${new Date().toLocaleTimeString()}`);
                }
            )
            .subscribe((status) => {
                console.log('🔔 RealtimeTest: Direct subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    setDirectTestStatus('Direct subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    setDirectTestStatus('Direct subscription error');
                }
            });

        setSubscriptionStatus('Subscribed');

        return () => {
            console.log('🔔 RealtimeTest: Component unmounting, cleaning up subscriptions');
            unsubscribe();
            supabase.removeChannel(directChannel);
        };
    }, []);

    const checkStatus = () => {
        const status = realtimeManager.getStatus();
        console.log('🔔 RealtimeTest: Current realtimeManager status:', status);
        setSubscriptionStatus(`Active: ${status.isActive}, Subscribers: ${status.subscriberCount}, HasChannel: ${status.hasGlobalChannel}`);
    };

    const testDirectUpdate = async () => {
        try {
            console.log('🔔 RealtimeTest: Testing direct database update');
            // Get a project to update
            const { data: projects } = await supabase
                .from('projects')
                .select('id, title')
                .limit(1);

            if (projects && projects.length > 0) {
                const projectId = projects[0].id;
                console.log('🔔 RealtimeTest: Updating project for test:', projectId);

                const { error } = await supabase
                    .from('projects')
                    .update({
                        updated_at: new Date().toISOString(),
                        notes: `Test update at ${new Date().toLocaleTimeString()}`
                    })
                    .eq('id', projectId);

                if (error) {
                    console.error('🔔 RealtimeTest: Direct update error:', error);
                    setDirectTestStatus(`Update error: ${error.message}`);
                } else {
                    console.log('🔔 RealtimeTest: Direct update successful');
                    setDirectTestStatus(`Test update sent at ${new Date().toLocaleTimeString()}`);
                }
            }
        } catch (error) {
            console.error('🔔 RealtimeTest: Test update exception:', error);
            setDirectTestStatus(`Test error: ${error}`);
        }
    };

    return (
        <Card className="w-full mb-4 border-green-200 bg-green-50">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-green-800">
                    Real-time Subscription Test
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>RealtimeManager Status:</strong> {subscriptionStatus}
                    </div>
                    <div>
                        <strong>RealtimeManager Updates:</strong> {updateCount}
                    </div>
                    <div>
                        <strong>Last RealtimeManager Update:</strong> {lastUpdate}
                    </div>
                    <div>
                        <strong>Direct Supabase Status:</strong> {directTestStatus}
                    </div>
                    <div>
                        <strong>Direct Supabase Updates:</strong> {directTestCount}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" onClick={checkStatus} className="bg-green-600 hover:bg-green-700">
                        Check Status
                    </Button>
                    <Button size="sm" onClick={testDirectUpdate} className="bg-blue-600 hover:bg-blue-700">
                        Test Direct Update
                    </Button>
                </div>

                <div className="text-xs text-green-600">
                    This component tests both realtimeManager and direct Supabase real-time subscriptions.
                    When you change a project stage, both update counts should increase.
                </div>
            </CardContent>
        </Card>
    );
}
