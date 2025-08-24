import { useState, useEffect } from 'react';
import { SupplierQuote, SendRFQRequest, AcceptQuoteRequest, UpdateSupplierQuoteRequest } from '@/types/supplier';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuoteFilters {
  status?: string[];
  supplier_id?: string;
  project_id?: string;
  date_from?: string;
  date_to?: string;
}

export function useSupplierQuotes(projectId?: string) {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuoteFilters>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuotes = async () => {
    if (!user) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock implementation for now - integrate with database later
      setQuotes([]);
    } catch (err) {
      console.error('Error in fetchQuotes:', err);
      setError('Failed to fetch supplier quotes');
    } finally {
      setLoading(false);
    }
  };

  const sendRFQToSuppliers = async (request: SendRFQRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Mock implementation
      console.log('Would send RFQ to suppliers:', request);

      toast({
        title: 'RFQ Sent Successfully',
        description: `RFQ sent to ${request.supplier_ids.length} suppliers`,
      });
      return true;
    } catch (err) {
      console.error('Error sending RFQ:', err);
      setError('Failed to send RFQ');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send RFQ to suppliers',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (quoteId: string, updates: UpdateSupplierQuoteRequest): Promise<boolean> => {
    try {
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, ...updates, updated_at: new Date().toISOString() } : q));
      toast({ title: 'Quote Updated', description: 'Quote updated successfully' });
      return true;
    } catch (err) {
      console.error('Error updating quote:', err);
      return false;
    }
  };

  const acceptQuote = async (request: AcceptQuoteRequest): Promise<boolean> => {
    try {
      setQuotes(prev => prev.map(q => q.id === request.quote_id ? { ...q, status: 'accepted' } : q));
      toast({ title: 'Quote Accepted', description: 'Quote accepted successfully' });
      return true;
    } catch (err) {
      console.error('Error accepting quote:', err);
      return false;
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string): Promise<boolean> => {
    try {
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
      return true;
    } catch (err) {
      console.error('Error updating quote status:', err);
      return false;
    }
  };

  const deleteQuote = async (quoteId: string): Promise<boolean> => {
    try {
      setQuotes(prev => prev.filter(q => q.id !== quoteId));
      toast({ title: 'Quote Deleted', description: 'Quote deleted successfully' });
      return true;
    } catch (err) {
      console.error('Error deleting quote:', err);
      return false;
    }
  };

  const getQuotesByProject = (pid: string): SupplierQuote[] => quotes.filter(q => q.project_id === pid);
  const getQuotesBySupplier = (sid: string): SupplierQuote[] => quotes.filter(q => q.supplier_id === sid);
  const getPendingQuotes = (): SupplierQuote[] => quotes.filter(q => q.status === 'sent');
  const getExpiredQuotes = (): SupplierQuote[] => {
    const now = new Date();
    return quotes.filter(q => q.quote_deadline && new Date(q.quote_deadline) < now);
  };

  const updateFilters = (newFilters: Partial<QuoteFilters>) => setFilters(prev => ({ ...prev, ...newFilters }));
  const clearFilters = () => setFilters({});

  useEffect(() => { fetchQuotes(); }, [user, filters, projectId]);

  return {
    quotes,
    loading,
    error,
    filters,
    
    // CRUD operations
    sendRFQToSuppliers,
    updateQuote,
    acceptQuote,
    updateQuoteStatus,
    deleteQuote,
    refetch: fetchQuotes,
    
    // Query helpers
    getQuotesByProject,
    getQuotesBySupplier,
    getPendingQuotes,
    getExpiredQuotes,
    
    // Filter management
    updateFilters,
    clearFilters,
  };
}