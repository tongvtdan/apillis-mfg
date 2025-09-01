import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
  user_id: string | null;
  project_id: string | null;
  contact_id: string | null;
}

export function useActivityLogs(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch recent activity logs for the organization
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
            project_id,
            contact_id
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
              project_id,
              contact_id
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