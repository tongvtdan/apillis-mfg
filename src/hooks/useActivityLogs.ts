import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    description: string | null;
    old_values: Json | null;
    new_values: Json | null;
    created_at: string | null;
    user_id: string | null;
    metadata: Json | null;
    organization_id: string;
    user_agent: string | null;
    ip_address: unknown | null;
    project_id: string | null;
}

export function useActivityLogs(limit: number = 10) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            console.log('Fetching activities for profile:', profile);

            if (!profile?.organization_id) {
                console.log('No organization_id found in profile');
                setLoading(false);
                return;
            }

            console.log('Fetching activities for organization_id:', profile.organization_id);

            try {
                const { data, error: fetchError } = await supabase
                    .from('activity_log')
                    .select(`
              id,
              action,
              entity_type,
              entity_id,
              description,
              old_values,
              new_values,
              created_at,
              user_id,
              metadata,
              organization_id,
              user_agent,
              ip_address,
              project_id
            `)
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                console.log('Activity logs query result:', { data, error: fetchError });

                if (fetchError) {
                    console.error('Error fetching activities:', fetchError);
                    setError(fetchError.message);
                    return;
                }

                setActivities(data || []);
            } catch (err) {
                console.error('Exception in fetchActivities:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch activities');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [profile?.organization_id, limit]);

    return {
        activities,
        loading,
        error,
        refetch: () => {
            // Reset loading state and refetch
            setLoading(true);
            setError(null);

            // Re-run the effect
            const fetchActivities = async () => {
                if (!profile?.organization_id) {
                    setLoading(false);
                    return;
                }

                try {
                    const { data, error: fetchError } = await supabase
                        .from('activity_log')
                        .select(`
              id,
              action,
              entity_type,
              entity_id,
              description,
              old_values,
              new_values,
              created_at,
              user_id,
              metadata,
              organization_id,
              user_agent,
              ip_address,
              project_id
            `)
                        .eq('organization_id', profile.organization_id)
                        .order('created_at', { ascending: false })
                        .limit(limit);

                    if (fetchError) {
                        setError(fetchError.message);
                        return;
                    }

                    setActivities(data || []);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch activities');
                } finally {
                    setLoading(false);
                }
            };

            fetchActivities();
        }
    };
}