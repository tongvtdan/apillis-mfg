import { supabase } from '@/integrations/supabase/client.js';
import { useAuth } from '@/core/auth';
import { useApproval } from '@/core/approvals';
import { EngineeringReviewData, EngineeringRisk, ReviewSubmissionResult, EngineeringDepartment } from '../types/engineering-review.types';

export class EngineeringReviewService {

    /**
     * Submit engineering review for a project
     */
    static async submitEngineeringReview(
        projectId: string,
        reviewData: EngineeringReviewData,
        reviewerId: string,
        reviewerName: string
    ): Promise<ReviewSubmissionResult> {

        console.log('🔧 Starting engineering review submission:', {
            projectId,
            department: reviewData.department,
            reviewerId
        });

        try {
            // Validate review data
            const validation = await this.validateReviewData(reviewData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }

            // Create engineering review record
            const reviewRecord = await this.createEngineeringReviewRecord(
                projectId,
                reviewData,
                reviewerId,
                reviewerName
            );

            // Create risk records if any
            const riskRecords = await this.createRiskRecords(
                projectId,
                reviewRecord.id,
                reviewData.risks,
                reviewerId
            );

            // Update project status based on review
            await this.updateProjectStatus(projectId, reviewData.status, reviewerId);

            // Create approval request if revision requested
            if (reviewData.status === 'revision_requested') {
                await this.createRevisionApprovalRequest(projectId, reviewRecord.id, reviewerId);
            }

            // Log activity
            await this.logReviewActivity(projectId, 'engineering_review_submitted', {
                department: reviewData.department,
                status: reviewData.status,
                riskCount: reviewData.risks.length,
                technicalFeasibility: reviewData.technical_feasibility
            }, reviewerId);

            return {
                success: true,
                reviewId: reviewRecord.id,
                warnings: validation.warnings
            };

        } catch (error) {
            console.error('❌ Engineering review submission failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Validate review data
     */
    private static async validateReviewData(reviewData: EngineeringReviewData): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation
        if (!reviewData.feedback?.trim()) {
            errors.push('Feedback is required');
        }

        if (reviewData.feedback && reviewData.feedback.length < 10) {
            errors.push('Feedback must be at least 10 characters');
        }

        // Risk validation
        if (reviewData.risks.length > 0) {
            reviewData.risks.forEach((risk, index) => {
                if (!risk.mitigation_plan?.trim()) {
                    errors.push(`Risk ${index + 1} requires a mitigation plan`);
                }
            });
        }

        // Technical feasibility validation
        if (reviewData.technical_feasibility === 'not_feasible' && reviewData.status === 'approved') {
            errors.push('Cannot approve a project marked as not feasible');
        }

        // Design changes validation
        if (reviewData.design_changes_required && !reviewData.design_change_details?.trim()) {
            warnings.push('Design change details should be provided when changes are required');
        }

        // Complexity vs feasibility warning
        if (reviewData.complexity_level === 'very_high' && reviewData.technical_feasibility === 'excellent') {
            warnings.push('High complexity projects typically require more detailed feasibility assessment');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Create engineering review record
     */
    private static async createEngineeringReviewRecord(
        projectId: string,
        reviewData: EngineeringReviewData,
        reviewerId: string,
        reviewerName: string
    ) {
        const reviewRecord = {
            project_id: projectId,
            department: reviewData.department,
            reviewer_id: reviewerId,
            reviewer_name: reviewerName,
            status: reviewData.status,

            // Technical assessment
            technical_feasibility: reviewData.technical_feasibility,
            complexity_level: reviewData.complexity_level,
            estimated_effort_hours: reviewData.estimated_effort_hours,

            // Feedback and recommendations
            feedback: reviewData.feedback,
            technical_notes: reviewData.technical_notes,
            recommendations: reviewData.recommendations,

            // Design and manufacturing
            design_changes_required: reviewData.design_changes_required,
            design_change_details: reviewData.design_change_details,
            manufacturing_notes: reviewData.manufacturing_notes,
            special_processes_required: reviewData.special_processes_required,

            // Timeline and confidence
            estimated_completion_weeks: reviewData.estimated_completion_weeks,
            confidence_level: reviewData.confidence_level,
            requires_follow_up: reviewData.requires_follow_up,
            follow_up_notes: reviewData.follow_up_notes,

            // Metadata
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            submitted_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('engineering_reviews')
            .insert(reviewRecord)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create engineering review: ${error.message}`);
        }

        return data;
    }

    /**
     * Create risk records
     */
    private static async createRiskRecords(
        projectId: string,
        reviewId: string,
        risks: EngineeringReviewData['risks'],
        reviewerId: string
    ): Promise<any[]> {
        if (risks.length === 0) return [];

        const riskRecords = risks.map(risk => ({
            project_id: projectId,
            review_id: reviewId,
            description: risk.description,
            category: risk.category,
            severity: risk.severity,
            probability: risk.probability,
            mitigation_plan: risk.mitigation_plan,
            created_by: reviewerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('engineering_risks')
            .insert(riskRecords)
            .select();

        if (error) {
            throw new Error(`Failed to create risk records: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Update project status based on review
     */
    private static async updateProjectStatus(
        projectId: string,
        reviewStatus: string,
        reviewerId: string
    ) {
        const statusMapping = {
            approved: 'engineering_approved',
            rejected: 'engineering_rejected',
            revision_requested: 'revision_requested'
        };

        const newStatus = statusMapping[reviewStatus as keyof typeof statusMapping] || 'in_review';

        const { error } = await supabase
            .from('projects')
            .update({
                status: newStatus,
                updated_by: reviewerId,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (error) {
            console.warn('Failed to update project status:', error);
        }
    }

    /**
     * Create approval request for revision
     */
    private static async createRevisionApprovalRequest(
        projectId: string,
        reviewId: string,
        reviewerId: string
    ) {
        try {
            // This would integrate with the core approvals module
            // For now, we'll just log it
            console.log('📝 Creating revision approval request for project:', projectId);
        } catch (error) {
            console.warn('Failed to create revision approval request:', error);
        }
    }

    /**
     * Log review activity
     */
    private static async logReviewActivity(
        projectId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    action,
                    details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log review activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Get engineering reviews for a project
     */
    static async getEngineeringReviews(projectId: string) {
        const { data, error } = await supabase
            .from('engineering_reviews')
            .select(`
                *,
                risks:engineering_risks(*)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch engineering reviews: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get pending reviews for reviewer
     */
    static async getPendingReviewsForReviewer(reviewerId: string) {
        const { data, error } = await supabase
            .from('engineering_reviews')
            .select(`
                *,
                project:projects(id, title, priority, status)
            `)
            .eq('reviewer_id', reviewerId)
            .eq('status', 'pending');

        if (error) {
            throw new Error(`Failed to fetch pending reviews: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Calculate risk score for a project
     */
    static calculateRiskScore(risks: EngineeringRisk[]): {
        score: number;
        level: 'low' | 'medium' | 'high';
        breakdown: Record<string, number>;
    } {
        if (risks.length === 0) {
            return { score: 0, level: 'low', breakdown: {} };
        }

        const severityScores = { low: 1, medium: 2, high: 3 };
        const totalScore = risks.reduce((sum, risk) => {
            const severityScore = severityScores[risk.severity];
            const probabilityMultiplier = risk.probability === 'high' ? 1.5 : risk.probability === 'medium' ? 1.0 : 0.5;
            return sum + (severityScore * probabilityMultiplier);
        }, 0);

        const averageScore = totalScore / risks.length;

        let level: 'low' | 'medium' | 'high';
        if (averageScore >= 2.5) level = 'high';
        else if (averageScore >= 1.5) level = 'medium';
        else level = 'low';

        const breakdown = risks.reduce((acc, risk) => {
            const category = risk.category;
            const severityScore = severityScores[risk.severity];
            acc[category] = (acc[category] || 0) + severityScore;
            return acc;
        }, {} as Record<string, number>);

        return { score: averageScore, level, breakdown };
    }
}
