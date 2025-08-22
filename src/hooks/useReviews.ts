import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InternalReview, RFQRisk, RFQClarification, ReviewSubmission, Department } from '@/types/review';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useReviews(rfqId: string) {
  const [reviews, setReviews] = useState<InternalReview[]>([]);
  const [risks, setRisks] = useState<RFQRisk[]>([]);
  const [clarifications, setClarifications] = useState<RFQClarification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all review data
  const fetchReviewData = async () => {
    if (!rfqId) return;

    try {
      const [reviewsRes, risksRes, clarificationsRes] = await Promise.all([
        supabase
          .from('rfq_internal_reviews')
          .select('*')
          .eq('rfq_id', rfqId)
          .order('created_at', { ascending: true }),
        
        supabase
          .from('rfq_risks')
          .select('*')
          .eq('rfq_id', rfqId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('rfq_clarifications')
          .select('*')
          .eq('rfq_id', rfqId)
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
      console.error('Error fetching review data:', error);
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
  }, [rfqId]);

  // Submit review
  const submitReview = async (department: Department, submission: ReviewSubmission) => {
    if (!user) return;

    try {
      // Check if review already exists
      const existingReview = reviews.find(r => r.department === department);
      
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('rfq_internal_reviews')
          .update({
            status: submission.status,
            feedback: submission.feedback,
            suggestions: submission.suggestions,
            submitted_at: new Date().toISOString(),
            submitted_by: user.id
          })
          .eq('id', existingReview.id);

        if (updateError) throw updateError;
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('rfq_internal_reviews')
          .insert({
            rfq_id: rfqId,
            department,
            reviewer_id: user.id,
            status: submission.status,
            feedback: submission.feedback,
            suggestions: submission.suggestions,
            submitted_at: new Date().toISOString(),
            submitted_by: user.id
          });

        if (insertError) throw insertError;
      }

      // Submit risks if any
      if (submission.risks.length > 0) {
        const { error: risksError } = await supabase
          .from('rfq_risks')
          .insert(
            submission.risks.map(risk => ({
              rfq_id: rfqId,
              description: risk.description,
              category: risk.category,
              severity: risk.severity,
              mitigation_plan: risk.mitigation_plan,
              created_by: user.id
            }))
          );

        if (risksError) throw risksError;
      }

      // Refresh data
      await fetchReviewData();

      toast({
        title: 'Review Submitted',
        description: `Your ${department} review has been submitted successfully.`
      });

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

  // Submit clarification request
  const submitClarification = async (description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('rfq_clarifications')
        .insert({
          rfq_id: rfqId,
          requested_by: user.id,
          description,
          status: 'open'
        });

      if (error) throw error;

      await fetchReviewData();

      toast({
        title: 'Clarification Requested',
        description: 'Your clarification request has been submitted.'
      });

      return true;
    } catch (error) {
      console.error('Error submitting clarification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit clarification request.'
      });
      return false;
    }
  };

  // Assign reviewer
  const assignReviewer = async (department: Department, reviewerId: string) => {
    try {
      const fieldName = `${department.toLowerCase()}_reviewer_id` as const;
      
      const { error } = await supabase
        .from('rfqs')
        .update({ [fieldName]: reviewerId })
        .eq('id', rfqId);

      if (error) throw error;

      toast({
        title: 'Reviewer Assigned',
        description: `Reviewer assigned to ${department} review.`
      });

      return true;
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign reviewer.'
      });
      return false;
    }
  };

  return {
    reviews,
    risks,
    clarifications,
    loading,
    submitReview,
    submitClarification,
    assignReviewer,
    refreshData: fetchReviewData
  };
}