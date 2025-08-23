import { renderHook, act, waitFor } from '@testing-library/react';
import { useSuppliers } from '../useSuppliers';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/types/supplier';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  ilike: jest.fn(),
  contains: jest.fn(),
  order: jest.fn(),
  rpc: jest.fn(),
  channel: jest.fn(),
  on: jest.fn(),
  subscribe: jest.fn(),
};

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock data
const mockSupplier: Supplier = {
  id: '1',
  name: 'Test Supplier',
  company: 'Test Company',
  email: 'test@supplier.com',
  phone: '+1234567890',
  address: '123 Test St',
  country: 'USA',
  specialties: ['machining', 'fabrication'],
  rating: 4.5,
  response_rate: 85.5,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_contact_date: '2024-01-01T00:00:00Z',
  total_quotes_sent: 10,
  total_quotes_received: 8,
  average_turnaround_days: 2.5,
  notes: 'Test notes',
  tags: ['reliable', 'fast']
};

const mockSupplierAnalytics = {
  supplier_id: '1',
  supplier_name: 'Test Supplier',
  supplier_company: 'Test Company',
  total_quotes: 10,
  quotes_received: 8,
  quotes_accepted: 3,
  quotes_expired: 1,
  response_rate_percent: 80.0,
  win_rate_percent: 37.5,
  avg_response_time_hours: 24.5,
  first_quote_date: '2024-01-01T00:00:00Z',
  last_activity_date: '2024-01-15T00:00:00Z'
};

describe('useSuppliers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock chain
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.contains.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.rpc.mockReturnValue(mockSupabase);
    mockSupabase.channel.mockReturnValue(mockSupabase);
    mockSupabase.on.mockReturnValue(mockSupabase);
    mockSupabase.subscribe.mockReturnValue({ unsubscribe: jest.fn() });
  });

  describe('Initialization', () => {
    it('should initialize with empty suppliers list and loading state', () => {
      mockSupabase.select.mockResolvedValue({ data: [], error: null });
      
      const { result } = renderHook(() => useSuppliers());
      
      expect(result.current.suppliers).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should load suppliers on mount', async () => {
      mockSupabase.select.mockResolvedValue({ 
        data: [mockSupplier], 
        error: null 
      });
      
      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.suppliers).toEqual([mockSupplier]);
      expect(mockSupabase.from).toHaveBeenCalledWith('suppliers');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('name');
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to load suppliers');
      mockSupabase.select.mockResolvedValue({ 
        data: null, 
        error 
      });
      
      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(error);
      expect(result.current.suppliers).toEqual([]);
    });
  });

  describe('createSupplier', () => {
    it('should create a new supplier successfully', async () => {
      const newSupplierData: CreateSupplierRequest = {
        name: 'New Supplier',
        company: 'New Company',
        email: 'new@supplier.com',
        specialties: ['machining'],
        tags: ['new']
      };

      const createdSupplier = { ...mockSupplier, ...newSupplierData, id: '2' };
      
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.insert.mockResolvedValue({ 
        data: [createdSupplier], 
        error: null 
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createResult;
      await act(async () => {
        createResult = await result.current.createSupplier(newSupplierData);
      });

      expect(createResult).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith([newSupplierData]);
      expect(result.current.suppliers).toContainEqual(createdSupplier);
    });

    it('should handle create supplier error', async () => {
      const newSupplierData: CreateSupplierRequest = {
        name: 'New Supplier',
        specialties: ['machining']
      };

      const error = new Error('Failed to create supplier');
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.insert.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createResult;
      await act(async () => {
        createResult = await result.current.createSupplier(newSupplierData);
      });

      expect(createResult).toBe(false);
      expect(result.current.error).toBe(error);
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier successfully', async () => {
      const updateData: UpdateSupplierRequest = {
        name: 'Updated Supplier',
        rating: 5.0
      };

      const updatedSupplier = { ...mockSupplier, ...updateData };
      
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.update.mockResolvedValue({ 
        data: [updatedSupplier], 
        error: null 
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateSupplier('1', updateData);
      });

      expect(updateResult).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle update supplier error', async () => {
      const updateData: UpdateSupplierRequest = {
        name: 'Updated Supplier'
      };

      const error = new Error('Failed to update supplier');
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.update.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateSupplier('1', updateData);
      });

      expect(updateResult).toBe(false);
      expect(result.current.error).toBe(error);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier successfully', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.delete.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteSupplier('1');
      });

      expect(deleteResult).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(result.current.suppliers).toEqual([]);
    });

    it('should handle delete supplier error', async () => {
      const error = new Error('Failed to delete supplier');
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.delete.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteSupplier('1');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).toBe(error);
    });
  });

  describe('searchSuppliers', () => {
    it('should search suppliers by name', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.searchSuppliers({ name: 'Test' });
      });

      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%Test%');
    });

    it('should search suppliers by specialties', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.searchSuppliers({ specialties: ['machining'] });
      });

      expect(mockSupabase.contains).toHaveBeenCalledWith('specialties', ['machining']);
    });

    it('should filter by active status', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.searchSuppliers({ is_active: true });
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  describe('getSupplierAnalytics', () => {
    it('should fetch supplier analytics successfully', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: [mockSupplierAnalytics], 
        error: null 
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let analyticsResult;
      await act(async () => {
        analyticsResult = await result.current.getSupplierAnalytics();
      });

      expect(analyticsResult).toEqual([mockSupplierAnalytics]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_supplier_analytics');
    });

    it('should handle analytics fetch error', async () => {
      const error = new Error('Failed to fetch analytics');
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.rpc.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let analyticsResult;
      await act(async () => {
        analyticsResult = await result.current.getSupplierAnalytics();
      });

      expect(analyticsResult).toEqual([]);
      expect(result.current.error).toBe(error);
    });
  });

  describe('Real-time subscriptions', () => {
    it('should set up real-time subscription on mount', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('suppliers_changes');
        expect(mockSupabase.on).toHaveBeenCalledWith(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'suppliers' 
          },
          expect.any(Function)
        );
        expect(mockSupabase.subscribe).toHaveBeenCalled();
      });
    });

    it('should handle real-time INSERT events', async () => {
      const newSupplier = { ...mockSupplier, id: '2', name: 'New Supplier' };
      
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      let realtimeCallback: Function;
      mockSupabase.on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase;
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time insert
      act(() => {
        realtimeCallback({
          eventType: 'INSERT',
          new: newSupplier,
          old: null
        });
      });

      expect(result.current.suppliers).toHaveLength(2);
      expect(result.current.suppliers).toContainEqual(newSupplier);
    });

    it('should handle real-time UPDATE events', async () => {
      const updatedSupplier = { ...mockSupplier, name: 'Updated Name' };
      
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      let realtimeCallback: Function;
      mockSupabase.on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase;
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time update
      act(() => {
        realtimeCallback({
          eventType: 'UPDATE',
          new: updatedSupplier,
          old: mockSupplier
        });
      });

      expect(result.current.suppliers).toHaveLength(1);
      expect(result.current.suppliers[0].name).toBe('Updated Name');
    });

    it('should handle real-time DELETE events', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      
      let realtimeCallback: Function;
      mockSupabase.on.mockImplementation((event, config, callback) => {
        realtimeCallback = callback;
        return mockSupabase;
      });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time delete
      act(() => {
        realtimeCallback({
          eventType: 'DELETE',
          new: null,
          old: mockSupplier
        });
      });

      expect(result.current.suppliers).toHaveLength(0);
    });
  });

  describe('Performance tracking', () => {
    it('should update performance metrics in background', async () => {
      mockSupabase.select.mockResolvedValue({ data: [mockSupplier], error: null });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSuppliers());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePerformanceMetrics('1');
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_supplier_performance', {
        p_supplier_id: '1'
      });
    });
  });
});