import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InternalReview, RFQRisk, RFQClarification, Department, ReviewSubmission } from '@/types/review';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';

// Define the database review type based on the actual schema
interface DatabaseReview {
    id: string;
    project_id: string;
    reviewer_id: string;
    review_type: string;
    status: string;
    comments: string | null;
    recommendations: string | null;
    metadata: any;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    reviewer?: {
        name: string;
        email: string;
        role: string;
    } | null;
}

export function useProjectReviews(projectId: string) {
    const [reviews, setReviews] = useState<InternalReview[]>([]);
    const [risks, setRisks] = useState<RFQRisk[]>([]);
    const [clarifications, setClarifications] = useState<RFQClarification[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch review data from database
    const fetchReviewData = async () => {
        if (!projectId) return;

        try {
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users!reviews_reviewer_id_fkey(name, email, role)
                `)
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            // Transform the data to match InternalReview interface
            const transformedReviews: InternalReview[] = (reviewsData || []).map((review: any) => ({
                id: review.id,
                project_id: review.project_id,
                reviewer_id: review.reviewer_id,
                reviewer_name: review.reviewer?.name || 'Unknown',
                department: review.review_type as Department, // Map review_type to department
                status: review.status as any || 'pending',
                feedback: review.comments || '',
                suggestions: review.recommendations ? [review.recommendations] : [],
                risks: review.metadata?.risks || [],
                created_at: review.created_at,
                updated_at: review.updated_at,
                submitted_at: review.completed_at
            }));

            setReviews(transformedReviews);
            setRisks([]); // For now, keep risks empty until we implement risk tracking
            setClarifications([]); // For now, keep clarifications empty until we implement clarification tracking
        } catch (error) {
            console.error('Error fetching project review data:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load review data.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewData();
    }, [projectId]);

    // Get review status for a specific department
    const getReviewStatus = (department: Department) => {
        const review = reviews.find(r => r.department === department);
        return review?.status || 'pending';
    };

    // Get all review statuses
    const getReviewStatuses = () => {
        return {
            Engineering: getReviewStatus('Engineering'),
            QA: getReviewStatus('QA'),
            Production: getReviewStatus('Production')
        };
    };

    // Get overall review status
    const getOverallReviewStatus = () => {
        const statuses = getReviewStatuses();
        const allApproved = Object.values(statuses).every(status => status === 'approved');
        const anyRejected = Object.values(statuses).some(status => status === 'rejected');
        const anyRevisionRequested = Object.values(statuses).some(status => status === 'revision_requested');

        if (anyRejected) return 'rejected';
        if (anyRevisionRequested) return 'revision_requested';
        if (allApproved) return 'approved';
        return 'pending';
    };

    // Get review summary
    const getReviewSummary = () => {
        const statuses = getReviewStatuses();
        const total = Object.keys(statuses).length;
        const approved = Object.values(statuses).filter(status => status === 'approved').length;
        const pending = Object.values(statuses).filter(status => status === 'pending').length;
        const rejected = Object.values(statuses).filter(status => status === 'rejected').length;
        const revisionRequested = Object.values(statuses).filter(status => status === 'revision_requested').length;

        return {
            total,
            approved,
            pending,
            rejected,
            revisionRequested,
            progress: total > 0 ? Math.round((approved / total) * 100) : 0
        };
    };

    // Submit a review to the database
    const submitReview = async (department: Department, submission: ReviewSubmission) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to submit a review.'
            });
            return false;
        }

        try {
            // Map department to review_type
            const reviewTypeMap: Record<Department, string> = {
                'Engineering': 'technical',
                'QA': 'quality',
                'Production': 'production'
            };

            // First, get the user's organization_id
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;

            const reviewData = {
                project_id: projectId,
                reviewer_id: user.id,
                review_type: reviewTypeMap[department],
                status: submission.status,
                comments: submission.feedback,
                recommendations: submission.suggestions.join('\n'),
                metadata: {
                    risks: submission.risks || [],
                    suggestions: submission.suggestions || []
                },
                completed_at: new Date().toISOString(),
                created_by: user.id,
                organization_id: userData.organization_id
            };

            const { error } = await supabase
                .from('reviews')
                .insert(reviewData);

            if (error) throw error;

            toast({
                title: 'Success',
                description: `${department} review submitted successfully.`
            });

            // Refresh the reviews data
            await fetchReviewData();
            return true;
        } catch (error) {
            console.error('Error submitting review:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit review. Please try again.'
            });
            return false;
        }
    };

    return {
        reviews,
        risks,
        clarifications,
        loading,
        getReviewStatus,
        getReviewStatuses,
        getOverallReviewStatus,
        getReviewSummary,
        submitReview,
        refetch: fetchReviewData
    };
}