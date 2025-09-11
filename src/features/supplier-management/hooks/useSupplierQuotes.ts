import { useState, useEffect } from 'react';
import { SupplierQuote, SupplierQuoteStatus, SendRFQRequest, AcceptQuoteRequest, UpdateSupplierQuoteRequest } from '@/types/supplier';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

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
                title: "RFQ Sent",
                description: `RFQ sent to ${request.supplier_ids.length} suppliers.`,
            });

            return true;
        } catch (error) {
            console.error('Error sending RFQ:', error);
            toast({
                variant: "destructive",
                title: "RFQ Send Failed",
                description: error instanceof Error ? error.message : 'Failed to send RFQ.',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const acceptQuote = async (request: AcceptQuoteRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            // Mock implementation
            console.log('Would accept quote:', request);

            // Update quote status locally
            setQuotes(prev =>
                prev.map(quote =>
                    quote.id === request.quote_id
                        ? { ...quote, status: 'accepted' as SupplierQuoteStatus }
                        : quote
                )
            );

            toast({
                title: "Quote Accepted",
                description: "Supplier quote has been accepted.",
            });

            return true;
        } catch (error) {
            console.error('Error accepting quote:', error);
            toast({
                variant: "destructive",
                title: "Quote Acceptance Failed",
                description: error instanceof Error ? error.message : 'Failed to accept quote.',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateQuote = async (request: UpdateSupplierQuoteRequest): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            // Mock implementation
            console.log('Would update quote:', request);

            toast({
                title: "Quote Updated",
                description: "Supplier quote has been updated.",
            });

            return true;
        } catch (error) {
            console.error('Error updating quote:', error);
            toast({
                variant: "destructive",
                title: "Quote Update Failed",
                description: error instanceof Error ? error.message : 'Failed to update quote.',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getQuotesByStatus = (status: SupplierQuoteStatus) => {
        return quotes.filter(quote => quote.status === status);
    };

    const getQuotesBySupplier = (supplierId: string) => {
        return quotes.filter(quote => quote.supplier_id === supplierId);
    };

    useEffect(() => {
        fetchQuotes();
    }, [user, projectId]);

    return {
        quotes,
        loading,
        error,
        filters,
        setFilters,
        fetchQuotes,
        sendRFQToSuppliers,
        acceptQuote,
        updateQuote,
        getQuotesByStatus,
        getQuotesBySupplier,
        refetch: fetchQuotes
    };
}
