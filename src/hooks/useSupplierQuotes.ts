import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  SupplierQuote,
  SupplierQuoteStatus,
  QuoteComparison,
  QuoteReadinessIndicator,
  CreateSupplierQuoteRequest,
  UpdateSupplierQuoteRequest,
  SendRFQRequest,
  AcceptQuoteRequest,
  SupplierQuoteStatusHistory
} from '@/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useSupplierQuotes(projectId?: string) {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuotes = async (targetProjectId?: string) => {
    // If no project ID is provided, don't fetch quotes
    const effectiveProjectId = targetProjectId || projectId;
    if (!effectiveProjectId) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('supplier_quotes')
        .select(`
          *,
          supplier:suppliers(*),
          project:projects(*)
        `);

      // Filter by project if specified
      if (effectiveProjectId) {
        query = query.eq('project_id', effectiveProjectId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching supplier quotes:', fetchError);
        setError(fetchError.message);
        return;
      }

      setQuotes(data || []);
    } catch (err) {
      console.error('Error in fetchQuotes:', err);
      setError('Failed to fetch supplier quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: CreateSupplierQuoteRequest): Promise<SupplierQuote> => {
    try {
      const cleanData = {
        project_id: quoteData.project_id,
        supplier_id: quoteData.supplier_id,
        quote_deadline: quoteData.quote_deadline,
        rfq_message: quoteData.rfq_message,
        currency: quoteData.currency || 'USD',
        status: 'sent' as SupplierQuoteStatus,
        rfq_sent_at: new Date().toISOString(),
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('supplier_quotes')
        .insert([cleanData])
        .select(`
          *,
          supplier:suppliers(*),
          project:projects(*)
        `)
        .single();

      if (error) {
        console.error('Error creating supplier quote:', error);
        throw error;
      }

      // Add to local state
      setQuotes(prev => [data, ...prev]);

      toast({
        title: "RFQ Sent",
        description: `Quote request sent to ${data.supplier?.name}`,
      });

      return data;
    } catch (err) {
      console.error('Error in createQuote:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send RFQ",
      });
      throw err;
    }
  };

  const updateQuote = async (quoteId: string, updates: UpdateSupplierQuoteRequest): Promise<SupplierQuote> => {
    try {
      const cleanUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      // If quote is being marked as received, set received timestamp
      if (updates.quote_amount !== undefined && !cleanUpdates.quote_received_at) {
        cleanUpdates.quote_received_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('supplier_quotes')
        .update(cleanUpdates)
        .eq('id', quoteId)
        .select(`
          *,
          supplier:suppliers(*),
          project:projects(*)
        `)
        .single();

      if (error) {
        console.error('Error updating supplier quote:', error);
        throw error;
      }

      // Update local state
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId ? data : quote
      ));

      toast({
        title: "Quote Updated",
        description: "Quote information has been updated successfully",
      });

      return data;
    } catch (err) {
      console.error('Error in updateQuote:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quote",
      });
      throw err;
    }
  };

  const deleteQuote = async (quoteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('supplier_quotes')
        .delete()
        .eq('id', quoteId);

      if (error) {
        console.error('Error deleting supplier quote:', error);
        throw error;
      }

      // Remove from local state
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));

      toast({
        title: "Quote Deleted",
        description: "Quote has been removed successfully",
      });

      return true;
    } catch (err) {
      console.error('Error in deleteQuote:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quote",
      });
      return false;
    }
  };

  const sendRFQToSuppliers = async (request: SendRFQRequest): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('send_rfq_to_suppliers', {
        p_project_id: request.project_id,
        p_supplier_ids: request.supplier_ids,
        p_quote_deadline: request.quote_deadline,
        p_rfq_message: request.rfq_message
      });

      if (error) {
        console.error('Error sending RFQ to suppliers:', error);
        throw error;
      }

      // Refresh quotes to show new RFQs
      await fetchQuotes(request.project_id);

      toast({
        title: "RFQ Sent Successfully",
        description: `RFQ sent to ${request.supplier_ids.length} supplier(s)`,
      });

      return true;
    } catch (err) {
      console.error('Error in sendRFQToSuppliers:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send RFQ",
      });
      return false;
    }
  };

  const acceptQuote = async (request: AcceptQuoteRequest): Promise<boolean> => {
    try {
      // Update quote status to accepted
      const { error: updateError } = await supabase
        .from('supplier_quotes')
        .update({
          status: 'accepted',
          internal_notes: request.internal_notes,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', request.quote_id);

      if (updateError) {
        throw updateError;
      }

      // Create quote comparison record if rationale provided
      if (request.decision_rationale) {
        const quote = quotes.find(q => q.id === request.quote_id);
        if (quote) {
          await supabase
            .from('quote_comparisons')
            .insert([{
              project_id: quote.project_id,
              selected_quote_id: request.quote_id,
              decision_rationale: request.decision_rationale,
              status: 'approved',
              evaluated_by: user?.id
            }]);
        }
      }

      // Refresh quotes to reflect changes
      await fetchQuotes();

      toast({
        title: "Quote Accepted",
        description: "Quote has been accepted successfully",
      });

      return true;
    } catch (err) {
      console.error('Error in acceptQuote:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept quote",
      });
      return false;
    }
  };

  const compareQuotes = async (targetProjectId: string): Promise<QuoteComparison | null> => {
    try {
      // First, calculate comparison scores
      const { data: scoresData, error: scoresError } = await supabase.rpc('calculate_quote_comparison_scores', {
        p_project_id: targetProjectId
      });

      if (scoresError) {
        throw scoresError;
      }

      // Check if comparison already exists
      const { data: existingComparison, error: fetchError } = await supabase
        .from('quote_comparisons')
        .select('*')
        .eq('project_id', targetProjectId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      let comparison: QuoteComparison;

      if (existingComparison) {
        // Update existing comparison
        const { data, error } = await supabase
          .from('quote_comparisons')
          .update({
            quote_scores: scoresData.quote_scores,
            total_scores: scoresData.total_scores,
            comparison_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingComparison.id)
          .select('*')
          .single();

        if (error) throw error;
        comparison = data;
      } else {
        // Create new comparison
        const { data, error } = await supabase
          .from('quote_comparisons')
          .insert([{
            project_id: targetProjectId,
            quote_scores: scoresData.quote_scores,
            total_scores: scoresData.total_scores,
            status: 'draft',
            evaluated_by: user?.id
          }])
          .select('*')
          .single();

        if (error) throw error;
        comparison = data;
      }

      return comparison;
    } catch (err) {
      console.error('Error in compareQuotes:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to compare quotes",
      });
      return null;
    }
  };

  const getQuoteReadinessScore = async (targetProjectId: string): Promise<QuoteReadinessIndicator | null> => {
    try {
      const { data, error } = await supabase.rpc('get_project_quote_readiness', {
        p_project_id: targetProjectId
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error in getQuoteReadinessScore:', err);
      return null;
    }
  };

  const getQuoteStatusHistory = async (quoteId: string): Promise<SupplierQuoteStatusHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('supplier_quote_status_history')
        .select('*')
        .eq('supplier_quote_id', quoteId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error in getQuoteStatusHistory:', err);
      return [];
    }
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: SupplierQuoteStatus, reason?: string): Promise<boolean> => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      // Set timestamps based on status
      if (newStatus === 'received' && !updates.quote_received_at) {
        updates.quote_received_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('supplier_quotes')
        .update(updates)
        .eq('id', quoteId);

      if (error) {
        throw error;
      }

      // Update local state
      setQuotes(prev => prev.map(quote =>
        quote.id === quoteId
          ? { ...quote, ...updates }
          : quote
      ));

      // Status history is automatically tracked by database trigger

      toast({
        title: "Status Updated",
        description: `Quote status changed to ${newStatus}`,
      });

      return true;
    } catch (err) {
      console.error('Error in updateQuoteStatus:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quote status",
      });
      return false;
    }
  };

  const expireOverdueQuotes = async (): Promise<void> => {
    try {
      await supabase.rpc('expire_overdue_quotes');
      // Refresh quotes to reflect expired status
      await fetchQuotes();
    } catch (err) {
      console.error('Error in expireOverdueQuotes:', err);
      // Don't show error toast - this is a background operation
    }
  };

  // Get quotes filtered by status
  const getQuotesByStatus = (status: SupplierQuoteStatus): SupplierQuote[] => {
    return quotes.filter(quote => quote.status === status);
  };

  // Get quotes for a specific project
  const getProjectQuotes = (targetProjectId: string): SupplierQuote[] => {
    return quotes.filter(quote => quote.project_id === targetProjectId);
  };

  // Get overdue quotes
  const getOverdueQuotes = (): SupplierQuote[] => {
    const now = new Date();
    return quotes.filter(quote =>
      quote.status === 'sent' &&
      quote.quote_deadline &&
      new Date(quote.quote_deadline) < now
    );
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchQuotes();

    const channel = supabase
      .channel('supplier-quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_quotes'
        },
        (payload) => {
          console.log('Supplier quote change received:', payload);

          if (payload.eventType === 'INSERT') {
            // Fetch full quote data with relations
            supabase
              .from('supplier_quotes')
              .select(`
                *,
                supplier:suppliers(*),
                project:projects(*)
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setQuotes(prev => [data, ...prev]);
                }
              });
          } else if (payload.eventType === 'UPDATE') {
            // Fetch updated quote data with relations
            supabase
              .from('supplier_quotes')
              .select(`
                *,
                supplier:suppliers(*),
                project:projects(*)
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setQuotes(prev => prev.map(quote =>
                    quote.id === data.id ? data : quote
                  ));
                }
              });
          } else if (payload.eventType === 'DELETE') {
            setQuotes(prev => prev.filter(quote => quote.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, projectId]);

  // Background task to expire overdue quotes
  useEffect(() => {
    const interval = setInterval(() => {
      expireOverdueQuotes();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Subscribe to quote updates for the specific project if projectId is provided
  const subscribeToQuoteUpdates = (targetProjectId: string) => {
    const channel = supabase
      .channel(`project-${targetProjectId}-quotes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_quotes',
          filter: `project_id=eq.${targetProjectId}`
        },
        (payload) => {
          console.log('Project quote update received:', payload);
          fetchQuotes(targetProjectId);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,

    // CRUD operations
    createQuote,
    updateQuote,
    deleteQuote,
    updateQuoteStatus,

    // Quote management
    sendRFQToSuppliers,
    acceptQuote,
    compareQuotes,
    getQuoteReadinessScore,
    getQuoteStatusHistory,

    // Filtering and utilities
    getQuotesByStatus,
    getProjectQuotes,
    getOverdueQuotes,
    expireOverdueQuotes,

    // Real-time subscriptions
    subscribeToQuoteUpdates
  };
}