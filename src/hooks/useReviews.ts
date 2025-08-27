import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Types for reviews system
export interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_role: string;
  review_type: 'standard' | 'technical' | 'quality' | 'production' | 'cost' | 'compliance' | 'safety';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_info' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comments?: string;
  risks: any[];
  recommendations?: string;
  tooling_required: boolean;
  estimated_cost?: number;
  estimated_lead_time?: number;
  due_date?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewChecklistItem {
  id: string;
  review_id: string;
  item_text: string;
  is_checked: boolean;
  is_required: boolean;
  notes?: string;
  checked_by?: string;
  checked_at?: string;
}

export function useReviews(projectId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [checklistItems, setChecklistItems] = useState<ReviewChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all review data
  const fetchReviews = async () => {
    if (!projectId) return;

    try {
      const [reviewsRes, checklistRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('review_checklist_items')
          .select('*')
          .eq('review_id', projectId)
          .order('item_text', { ascending: true })
      ]);

      if (reviewsRes.error) throw reviewsRes.error;
      if (checklistRes.error) throw checklistRes.error;

      setReviews(reviewsRes.data || []);
      setChecklistItems(checklistRes.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load reviews.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [projectId]);

  // Create a new review
  const createReview = async (reviewData: Partial<Review>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          project_id: projectId,
          reviewer_id: user.id,
          ...reviewData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review created successfully.'
      });

      await fetchReviews();
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create review.'
      });
      return null;
    }
  };

  // Update a review
  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review updated successfully.'
      });

      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update review.'
      });
      return false;
    }
  };

  // Create checklist item
  const createChecklistItem = async (reviewId: string, itemData: Partial<ReviewChecklistItem>) => {
    try {
      const { data, error } = await supabase
        .from('review_checklist_items')
        .insert({
          review_id: reviewId,
          ...itemData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReviews();
      return data;
    } catch (error) {
      console.error('Error creating checklist item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create checklist item.'
      });
      return null;
    }
  };

  // Update checklist item
  const updateChecklistItem = async (itemId: string, updates: Partial<ReviewChecklistItem>) => {
    try {
      const { error } = await supabase
        .from('review_checklist_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error updating checklist item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update checklist item.'
      });
      return false;
    }
  };

  return {
    reviews,
    checklistItems,
    loading,
    createReview,
    updateReview,
    createChecklistItem,
    updateChecklistItem,
    refetch: fetchReviews
  };
}