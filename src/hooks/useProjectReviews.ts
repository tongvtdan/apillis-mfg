import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InternalReview, RFQRisk, RFQClarification, Department, ReviewSubmission } from '@/types/review';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useProjectReviews(projectId: string) {
    const [reviews, setReviews] = useState<InternalReview[]>([]);
    const [risks, setRisks] = useState<RFQRisk[]>([]);
    const [clarifications, setClarifications] = useState<RFQClarification[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    // For now, return empty data since review tables don't exist yet
    const fetchReviewData = async () => {
        if (!projectId) return;

        try {
            // Mock empty review data until proper project review tables are created
            setReviews([]);
            setRisks([]);
            setClarifications([]);
        } catch (error) {
            console.error('Error fetching project review data:', error);
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

    // Mock submission until proper review tables are created -> This function should be removed, because only signed in user can go to dashboard, project. So this look like redundant
    const submitReview = async (department: Department, submission: ReviewSubmission) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to submit a review.'
            });
            return false;
        }

        // Mock successful submission
        toast({
            title: 'Success',
            description: `${department} review submitted successfully.`
        });

        return true;
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
