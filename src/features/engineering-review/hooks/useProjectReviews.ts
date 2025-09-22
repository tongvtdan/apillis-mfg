import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client.js';
import { InternalReview, RFQRisk, RFQClarification, Department, ReviewSubmission } from '@/types/review';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';

export function useProjectReviews(projectId: string) {
    const [reviews, setReviews] = useState<InternalReview[]>([]);
    const [risks, setRisks] = useState<RFQRisk[]>([]);
    const [clarifications, setClarifications] = useState<RFQClarification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch review data from database
    const fetchReviewData = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users!reviews_reviewer_id_fkey(name, email, role)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            // Transform database reviews to InternalReview format
            const transformedReviews: InternalReview[] = (reviewsData || []).map(review => ({
                id: review.id,
                project_id: review.project_id,
                reviewer_id: review.reviewer_id,
                review_type: review.review_type as any,
                status: review.status as any,
                priority: 'medium' as any,
                comments: review.comments,
                recommendations: review.recommendations,
                risks: [],
                tooling_required: false,
                estimated_cost: 0,
                estimated_lead_time: 0,
                due_date: undefined,
                reviewed_at: review.completed_at,
                created_at: review.created_at,
                updated_at: review.updated_at,
                reviewer: review.reviewer ? {
                    name: review.reviewer.name,
                    email: review.reviewer.email,
                    role: review.reviewer.role
                } : undefined
            }));

            setReviews(transformedReviews);

            // Fetch risks and clarifications
            await fetchRisksAndClarifications();

        } catch (err) {
            console.error('Error fetching review data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch review data');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load project reviews."
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchRisksAndClarifications = async () => {
        // Mock implementation - integrate with actual tables later
        setRisks([]);
        setClarifications([]);
    };

    // Submit a new review
    const submitReview = async (reviewData: ReviewSubmission): Promise<boolean> => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to submit reviews"
            });
            return false;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    project_id: projectId,
                    reviewer_id: user.id,
                    review_type: reviewData.review_type,
                    status: 'pending',
                    comments: reviewData.comments,
                    recommendations: reviewData.recommendations,
                    metadata: reviewData.metadata
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Review Submitted",
                description: "Your review has been submitted successfully."
            });

            // Refresh data
            await fetchReviewData();

            return true;
        } catch (error) {
            console.error('Error submitting review:', error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error instanceof Error ? error.message : 'Failed to submit review.'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Update review status
    const updateReviewStatus = async (reviewId: string, status: string): Promise<boolean> => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('reviews')
                .update({
                    status,
                    completed_at: status === 'approved' || status === 'rejected' ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', reviewId);

            if (error) throw error;

            toast({
                title: "Review Updated",
                description: `Review status updated to ${status}.`
            });

            // Refresh data
            await fetchReviewData();

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
        fetchReviewData();
    }, [projectId]);

    return {
        reviews,
        risks,
        clarifications,
        loading,
        error,
        submitReview,
        updateReviewStatus,
        refetch: fetchReviewData
    };
}
