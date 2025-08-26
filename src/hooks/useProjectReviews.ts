import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InternalReview, RFQRisk, RFQClarification, Department } from '@/types/review';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useProjectReviews(projectId: string) {
    const [reviews, setReviews] = useState<InternalReview[]>([]);
    const [risks, setRisks] = useState<RFQRisk[]>([]);
    const [clarifications, setClarifications] = useState<RFQClarification[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all review data for a project
    const fetchReviewData = async () => {
        if (!projectId) return;

        try {
            // For now, we'll use the project ID to fetch reviews
            // In the future, this should be updated to use project-specific review tables
            const [reviewsRes, risksRes, clarificationsRes] = await Promise.all([
                supabase
                    .from('rfq_internal_reviews')
                    .select('*')
                    .eq('rfq_id', projectId) // Using projectId as rfq_id for now
                    .order('created_at', { ascending: true }),

                supabase
                    .from('rfq_risks')
                    .select('*')
                    .eq('rfq_id', projectId) // Using projectId as rfq_id for now
                    .order('created_at', { ascending: false }),

                supabase
                    .from('rfq_clarifications')
                    .select('*')
                    .eq('rfq_id', projectId) // Using projectId as rfq_id for now
                    .order('created_at', { ascending: false })
            ]);

            if (reviewsRes.error) throw reviewsRes.error;
            if (risksRes.error) throw risksRes.error;
            if (clarificationsRes.error) throw clarificationsRes.error;

            setReviews((reviewsRes.data || []).filter(r => ['Engineering', 'QA', 'Production'].includes(r.department)) as InternalReview[]);
            setRisks(risksRes.data || []);
            setClarifications((clarificationsRes.data || []).map(c => ({
                ...c,
                status: c.status as any
            })) as RFQClarification[]);
        } catch (error) {
            console.error('Error fetching project review data:', error);
            // Don't show toast for now as this might be expected for new projects
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

    return {
        reviews,
        risks,
        clarifications,
        loading,
        getReviewStatus,
        getReviewStatuses,
        getOverallReviewStatus,
        getReviewSummary,
        refetch: fetchReviewData
    };
}
