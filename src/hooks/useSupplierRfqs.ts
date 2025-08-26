import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierRfqsApi, supplierQuotesApi } from '@/lib/api/supplier-rfqs';
import type { SupplierRFQ, SupplierQuote } from '@/types/supplier-rfq';
import { toast } from 'sonner';

export const useSupplierRfqs = (projectId: string) => {
  return useQuery({
    queryKey: ['supplier-rfqs', projectId],
    queryFn: () => supplierRfqsApi.getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useSupplierRfq = (id: string) => {
  return useQuery({
    queryKey: ['supplier-rfq', id],
    queryFn: () => supplierRfqsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSupplierRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierRfqsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-rfqs', data.project_id] });
      toast.success('Supplier RFQ created successfully');
    },
    onError: () => {
      toast.error('Failed to create supplier RFQ');
    },
  });
};

export const useUpdateSupplierRfq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SupplierRFQ> }) =>
      supplierRfqsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-rfqs', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['supplier-rfq', data.id] });
      toast.success('Supplier RFQ updated successfully');
    },
    onError: () => {
      toast.error('Failed to update supplier RFQ');
    },
  });
};

export const useSupplierQuotes = (rfqId: string) => {
  return useQuery({
    queryKey: ['supplier-quotes', rfqId],
    queryFn: () => supplierQuotesApi.getByRfqId(rfqId),
    enabled: !!rfqId,
  });
};

export const useCreateSupplierQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierQuotesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotes', data.supplier_rfq_id] });
      toast.success('Quote created successfully');
    },
    onError: () => {
      toast.error('Failed to create quote');
    },
  });
};

export const useUpdateSupplierQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SupplierQuote> }) =>
      supplierQuotesApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotes', data.supplier_rfq_id] });
      toast.success('Quote updated successfully');
    },
    onError: () => {
      toast.error('Failed to update quote');
    },
  });
};

export const useSelectSupplierQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierQuotesApi.selectQuote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-quotes', data.supplier_rfq_id] });
      toast.success('Quote selected successfully');
    },
    onError: () => {
      toast.error('Failed to select quote');
    },
  });
};