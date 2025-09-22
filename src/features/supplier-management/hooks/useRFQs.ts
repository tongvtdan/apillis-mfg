import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
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
                    title: "RFQ Not Found",
                    description: "The specified RFQ could not be found.",
                });
                return false;
            }

            const oldStatus = currentRFQ.status;

            // Update the RFQ status
            const { error } = await supabase
                .from('rfqs')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', rfqId);

            if (error) {
                console.error('Error updating RFQ status:', error);
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: error.message || 'Failed to update RFQ status. Please try again.',
                });
                return false;
            }

            // Update local state
            setRFQs(prev =>
                prev.map(rfq =>
                    rfq.id === rfqId
                        ? { ...rfq, status: newStatus, updated_at: new Date().toISOString() }
                        : rfq
                )
            );

            toast({
                title: "Status Updated",
                description: `RFQ status changed from ${oldStatus} to ${newStatus}.`,
            });

            return true;
        } catch (error) {
            console.error('Error updating RFQ status:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
            return false;
        }
    };

    const createRFQ = async (rfqData: Partial<RFQ>): Promise<RFQ | null> => {
        try {
            if (!user) {
                throw new Error('User must be authenticated to create RFQs');
            }

            const { data, error } = await supabase
                .from('rfqs')
                .insert({
                    ...rfqData,
                    created_by: user.id,
                    status: 'draft' as RFQStatus,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            setRFQs(prev => [data, ...prev]);

            toast({
                title: "RFQ Created",
                description: "RFQ has been created successfully.",
            });

            return data;
        } catch (error) {
            console.error('Error creating RFQ:', error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
            return null;
        }
    };

    const deleteRFQ = async (rfqId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('rfqs')
                .delete()
                .eq('id', rfqId);

            if (error) {
                throw error;
            }

            setRFQs(prev => prev.filter(rfq => rfq.id !== rfqId));

            toast({
                title: "RFQ Deleted",
                description: "RFQ has been deleted successfully.",
            });

            return true;
        } catch (error) {
            console.error('Error deleting RFQ:', error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
            return false;
        }
    };

    const getRFQById = async (rfqId: string): Promise<RFQ | null> => {
        try {
            const { data, error } = await supabase
                .from('rfqs')
                .select('*')
                .eq('id', rfqId)
                .single();

            if (error) {
                console.error('Error fetching RFQ:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching RFQ:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchRFQs();
    }, [user]);

    return {
        rfqs,
        loading,
        error,
        fetchRFQs,
        updateRFQStatus,
        createRFQ,
        deleteRFQ,
        getRFQById
    };
}
