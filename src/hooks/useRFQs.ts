import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RFQ, RFQStatus } from '@/types/rfq';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

export function useRFQs() {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRFQs = async () => {
    if (!user) {
      setRFQs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rfqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching RFQs:', fetchError);
        setError(fetchError.message);
        return;
      }

      setRFQs(data || []);
    } catch (err) {
      console.error('Error in fetchRFQs:', err);
      setError('Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  const updateRFQStatus = async (rfqId: string, newStatus: RFQStatus) => {
    try {
      // Find the current RFQ to get the old status
      const currentRFQ = rfqs.find(rfq => rfq.id === rfqId);
      if (!currentRFQ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "RFQ not found",
        });
        return false;
      }

      const oldStatus = currentRFQ.status;

      const { error } = await supabase
        .from('rfqs')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', rfqId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update RFQ status",
        });
        return false;
      }

      // Format status names for display
      const formatStatusName = (status: RFQStatus) => {
        const statusMap = {
          inquiry: "New Inquiry",
          review: "Under Review",
          quote: "Quotation",
          production: "Production",
          completed: "Completed",
          cancelled: "Cancelled"
        };
        return statusMap[status] || status;
      };

      toast({
        title: "Status Updated",
        description: `From ${formatStatusName(oldStatus)} to ${formatStatusName(newStatus)}`,
      });

      return true;
    } catch (err) {
      console.error('Error updating RFQ status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update RFQ status",
      });
      return false;
    }
  };

  // Optimistic update function for drag and drop
  const updateRFQStatusOptimistic = async (rfqId: string, newStatus: RFQStatus) => {
    const currentRFQ = rfqs.find(rfq => rfq.id === rfqId);
    if (!currentRFQ) return false;

    const oldStatus = currentRFQ.status;

    // Optimistically update local state immediately
    setRFQs(prev => prev.map(rfq =>
      rfq.id === rfqId
        ? { ...rfq, status: newStatus, updated_at: new Date().toISOString() }
        : rfq
    ));

    try {
      const { error } = await supabase
        .from('rfqs')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', rfqId);

      if (error) {
        // Revert optimistic update on error
        setRFQs(prev => prev.map(rfq =>
          rfq.id === rfqId
            ? { ...rfq, status: oldStatus, updated_at: new Date().toISOString() }
            : rfq
        ));

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update RFQ status",
        });
        return false;
      }

      // Format status names for display
      const formatStatusName = (status: RFQStatus) => {
        const statusMap = {
          inquiry: "New Inquiry",
          review: "Under Review",
          quote: "Quotation",
          production: "Production",
          completed: "Completed",
          cancelled: "Cancelled"
        };
        return statusMap[status] || status;
      };

      toast({
        title: "Status Updated",
        description: `From ${formatStatusName(oldStatus)} to ${formatStatusName(newStatus)}`,
      });

      return true;
    } catch (err) {
      console.error('Error updating RFQ status:', err);

      // Revert optimistic update on error
      setRFQs(prev => prev.map(rfq =>
        rfq.id === rfqId
          ? { ...rfq, status: oldStatus, updated_at: new Date().toISOString() }
          : rfq
      ));

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update RFQ status",
      });
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchRFQs();

    const channel = supabase
      .channel('rfqs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rfqs'
        },
        (payload) => {
          console.log('RFQ change received:', payload);

          if (payload.eventType === 'INSERT') {
            setRFQs(prev => [payload.new as RFQ, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRFQs(prev => prev.map(rfq =>
              rfq.id === (payload.new as RFQ).id
                ? payload.new as RFQ
                : rfq
            ));
          } else if (payload.eventType === 'DELETE') {
            setRFQs(prev => prev.filter(rfq => rfq.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get RFQ by ID
  const getRFQById = async (id: string): Promise<RFQ> => {
    const { data, error } = await supabase
      .from('rfqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  return {
    rfqs,
    loading,
    error,
    refetch: fetchRFQs,
    updateRFQStatus,
    updateRFQStatusOptimistic,
    getRFQById
  };
}