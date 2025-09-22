import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

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
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all review data
    const fetchReviews = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            // Transform to Review interface
            const transformedReviews: Review[] = (reviewsData || []).map(review => ({
                id: review.id,
                project_id: review.project_id,
                reviewer_id: review.reviewer_id,
                reviewer_role: review.reviewer_role || 'engineer',
                review_type: review.review_type || 'standard',
                status: review.status || 'pending',
                priority: review.priority || 'medium',
                comments: review.comments,
                risks: review.risks || [],
                recommendations: review.recommendations,
                tooling_required: review.tooling_required || false,
                estimated_cost: review.estimated_cost,
                estimated_lead_time: review.estimated_lead_time,
                due_date: review.due_date,
                reviewed_at: review.completed_at,
                created_at: review.created_at,
                updated_at: review.updated_at
            }));

            setReviews(transformedReviews);

            // Fetch checklist items
            await fetchChecklistItems();

        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load reviews."
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchChecklistItems = async () => {
        // Mock implementation - integrate with actual checklist table later
        setChecklistItems([]);
    };

    // Create new review
    const createReview = async (reviewData: Partial<Review>): Promise<Review | null> => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to create reviews"
            });
            return null;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    project_id: projectId,
                    reviewer_id: user.id,
                    reviewer_role: user.user_metadata?.role || 'engineer',
                    review_type: reviewData.review_type || 'standard',
                    status: 'pending',
                    priority: reviewData.priority || 'medium',
                    comments: reviewData.comments,
                    recommendations: reviewData.recommendations,
                    tooling_required: reviewData.tooling_required || false,
                    estimated_cost: reviewData.estimated_cost,
                    estimated_lead_time: reviewData.estimated_lead_time,
                    due_date: reviewData.due_date
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Review Created",
                description: "Review has been created successfully."
            });

            // Refresh data
            await fetchReviews();

            return data as Review;
        } catch (error) {
            console.error('Error creating review:', error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error instanceof Error ? error.message : 'Failed to create review.'
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update review
    const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('reviews')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', reviewId);

            if (error) throw error;

            toast({
                title: "Review Updated",
                description: "Review has been updated successfully."
            });

            // Refresh data
            await fetchReviews();

            return true;
        } catch (error) {
            console.error('Error updating review:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error instanceof Error ? error.message : 'Failed to update review.'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [projectId]);

    return {
        reviews,
        checklistItems,
        loading,
        error,
        createReview,
        updateReview,
        refetch: fetchReviews
    };
}
